import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управляет чатами: получение списка чатов, создание чатов, добавление контактов, блокировка
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute("""
                SELECT DISTINCT ON (c.id)
                    c.id,
                    CASE 
                        WHEN c.is_group THEN c.name
                        ELSE u.name
                    END as chat_name,
                    CASE 
                        WHEN c.is_group THEN c.avatar_url
                        ELSE u.avatar_url
                    END as avatar,
                    u.is_online,
                    m.text as last_message,
                    TO_CHAR(m.created_at, 'HH24:MI') as timestamp,
                    COUNT(CASE WHEN m.is_read = false AND m.sender_id != %s THEN 1 END) as unread_count
                FROM chats c
                INNER JOIN chat_participants cp ON cp.chat_id = c.id
                LEFT JOIN chat_participants cp2 ON cp2.chat_id = c.id AND cp2.user_id != %s
                LEFT JOIN users u ON u.id = cp2.user_id
                LEFT JOIN messages m ON m.chat_id = c.id
                WHERE cp.user_id = %s AND cp.is_blocked = false
                GROUP BY c.id, c.is_group, c.name, c.avatar_url, u.name, u.avatar_url, u.is_online, m.id, m.text, m.created_at
                ORDER BY c.id, m.created_at DESC NULLS LAST
            """, (user_id, user_id, user_id))
            
            chats = []
            for row in cur.fetchall():
                chats.append({
                    'id': str(row[0]),
                    'name': row[1] or 'Неизвестный',
                    'avatar': row[2] or '',
                    'isOnline': row[3] or False,
                    'lastMessage': row[4] or '',
                    'timestamp': row[5] or '',
                    'unread': row[6] or 0,
                    'isTyping': False
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'chats': chats}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create':
                contact_phone = body_data.get('phone')
                
                cur.execute("SELECT id, name, avatar_url FROM users WHERE phone = %s", (contact_phone,))
                contact = cur.fetchone()
                
                if not contact:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
                
                contact_id = contact[0]
                
                cur.execute("""
                    SELECT c.id FROM chats c
                    INNER JOIN chat_participants cp1 ON cp1.chat_id = c.id
                    INNER JOIN chat_participants cp2 ON cp2.chat_id = c.id
                    WHERE c.is_group = false 
                    AND cp1.user_id = %s 
                    AND cp2.user_id = %s
                """, (user_id, contact_id))
                
                existing_chat = cur.fetchone()
                
                if existing_chat:
                    chat_id = existing_chat[0]
                else:
                    cur.execute("INSERT INTO chats (is_group) VALUES (false) RETURNING id")
                    chat_id = cur.fetchone()[0]
                    
                    cur.execute("INSERT INTO chat_participants (chat_id, user_id) VALUES (%s, %s)", (chat_id, user_id))
                    cur.execute("INSERT INTO chat_participants (chat_id, user_id) VALUES (%s, %s)", (chat_id, contact_id))
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'chatId': str(chat_id), 'contact': {'id': contact_id, 'name': contact[1], 'avatar': contact[2]}}),
                    'isBase64Encoded': False
                }
            
            elif action == 'block':
                chat_id = body_data.get('chatId')
                
                cur.execute("UPDATE chat_participants SET is_blocked = true WHERE chat_id = %s AND user_id = %s", (chat_id, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
    
    finally:
        cur.close()
        conn.close()
