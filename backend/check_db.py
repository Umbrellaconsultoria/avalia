import sqlite3

def check_db(db_path):
    print(f"--- Checking {db_path} ---")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"Tables: {tables}")
        
        for table in tables:
            t_name = table[0]
            if t_name == 'User' or t_name == 'user':
                print(f"Data from {t_name}:")
                cursor.execute(f"SELECT email, name, cpf, role, password FROM {t_name}")
                rows = cursor.fetchall()
                for row in rows:
                    print(row)
        conn.close()
    except Exception as e:
        print(f"Error checking {db_path}: {e}")

check_db('dev.db')
check_db('prisma/dev.db')
