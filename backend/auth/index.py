import json
import os
import psycopg2
from typing import Dict, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Обрабатывает аутентификацию пользователей через Google, Telegram или по номеру телефона
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    auth_type = body_data.get('type')
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        user_id = None
        user_data = None
        
        if auth_type == 'google':
            google_id = body_data.get('google_id')
            email = body_data.get('email')
            name = body_data.get('name')
            avatar = body_data.get('avatar')
            
            cur.execute(
                "SELECT id, phone, name, bio, avatar_url FROM users WHERE google_id = %s",
                (google_id,)
            )
            result = cur.fetchone()
            
            if result:
                user_id = result[0]
                user_data = {
                    'id': result[0],
                    'phone': result[1],
                    'name': result[2],
                    'bio': result[3],
                    'avatar': result[4]
                }
            else:
                phone = body_data.get('phone', email)
                cur.execute(
                    "INSERT INTO users (phone, name, avatar_url, google_id) VALUES (%s, %s, %s, %s) RETURNING id",
                    (phone, name, avatar, google_id)
                )
                user_id = cur.fetchone()[0]
                conn.commit()
                user_data = {'id': user_id, 'phone': phone, 'name': name, 'avatar': avatar, 'bio': ''}
        
        elif auth_type == 'telegram':
            telegram_id = body_data.get('telegram_id')
            username = body_data.get('username')
            first_name = body_data.get('first_name')
            photo_url = body_data.get('photo_url')
            
            cur.execute(
                "SELECT id, phone, name, bio, avatar_url FROM users WHERE telegram_id = %s",
                (telegram_id,)
            )
            result = cur.fetchone()
            
            if result:
                user_id = result[0]
                user_data = {
                    'id': result[0],
                    'phone': result[1],
                    'name': result[2],
                    'bio': result[3],
                    'avatar': result[4]
                }
            else:
                phone = body_data.get('phone', username)
                name = first_name or username
                cur.execute(
                    "INSERT INTO users (phone, name, avatar_url, telegram_id) VALUES (%s, %s, %s, %s) RETURNING id",
                    (phone, name, photo_url, telegram_id)
                )
                user_id = cur.fetchone()[0]
                conn.commit()
                user_data = {'id': user_id, 'phone': phone, 'name': name, 'avatar': photo_url, 'bio': ''}
        
        elif auth_type == 'phone':
            phone = body_data.get('phone')
            name = body_data.get('name')
            
            cur.execute(
                "SELECT id, phone, name, bio, avatar_url FROM users WHERE phone = %s",
                (phone,)
            )
            result = cur.fetchone()
            
            if result:
                user_id = result[0]
                user_data = {
                    'id': result[0],
                    'phone': result[1],
                    'name': result[2],
                    'bio': result[3],
                    'avatar': result[4]
                }
            else:
                cur.execute(
                    "INSERT INTO users (phone, name) VALUES (%s, %s) RETURNING id",
                    (phone, name)
                )
                user_id = cur.fetchone()[0]
                conn.commit()
                user_data = {'id': user_id, 'phone': phone, 'name': name, 'avatar': '', 'bio': ''}
        
        cur.execute("UPDATE users SET is_online = true, last_seen = CURRENT_TIMESTAMP WHERE id = %s", (user_id,))
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'user': user_data, 'token': str(user_id)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
