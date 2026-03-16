import sqlite3

db_path = 'dev.db'
email = 'gestor76693481353@pi.gov.br'
# Hash for '123456'
hashed_password = '$2b$10$YWwSx/3K.fbbJ5nMJh5bg./J7NicyboiHD0OFyOuIBC5Y1RKeFVfK'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("UPDATE User SET password = ? WHERE email = ?", (hashed_password, email))
    conn.commit()
    print(f"Rows affected: {cursor.rowcount}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
