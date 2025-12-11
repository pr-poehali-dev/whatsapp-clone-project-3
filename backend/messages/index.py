import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управляет сообщениями: получение истории, отправка сообщений, пометка как прочитанное
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
            query_params = event.get('queryStringParameters', {})
            chat_id = query_params.get('chatId')
            
            if not chat_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'chatId required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                SELECT 
                    m.id,
                    m.text,
                    TO_CHAR(m.created_at, 'HH24:MI') as timestamp,
                    m.sender_id = %s as is_sent,
                    m.is_read,
                    m.attachment_type,
                    m.attachment_url,
                    m.attachment_name
                FROM messages m
                WHERE m.chat_id = %s
                ORDER BY m.created_at ASC
            """, (user_id, chat_id))
            
            messages = []
            for row in cur.fetchall():
                msg = {
                    'id': str(row[0]),
                    'text': row[1],
                    'timestamp': row[2],
                    'isSent': row[3],
                    'status': 'read' if row[4] else 'sent'
                }
                
                if row[5]:
                    msg['attachment'] = {
                        'type': row[5],
                        'url': row[6],
                        'name': row[7]
                    }
                
                messages.append(msg)
            
            cur.execute("""
                UPDATE messages 
                SET is_read = true 
                WHERE chat_id = %s AND sender_id != %s AND is_read = false
            """, (chat_id, user_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'messages': messages}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            chat_id = body_data.get('chatId')
            text = body_data.get('text')
            attachment_type = body_data.get('attachmentType')
            attachment_url = body_data.get('attachmentUrl')
            attachment_name = body_data.get('attachmentName')
            
            if not chat_id or not text:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'chatId and text required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO messages (chat_id, sender_id, text, attachment_type, attachment_url, attachment_name)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, TO_CHAR(created_at, 'HH24:MI')
            """, (chat_id, user_id, text, attachment_type, attachment_url, attachment_name))
            
            message_id, timestamp = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': {
                        'id': str(message_id),
                        'text': text,
                        'timestamp': timestamp,
                        'isSent': True,
                        'status': 'sent'
                    }
                }),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
