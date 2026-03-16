import os
import subprocess
from datetime import datetime

MEMORY_FILE = os.path.join('.agent', 'memory.md')

def get_last_commit_message():
    try:
        return subprocess.check_output(['git', 'log', '-1', '--pretty=%B']).decode('utf-8').strip()
    except Exception as e:
        return f"Error getting commit message: {e}"

def update_memory():
    if not os.path.exists(MEMORY_FILE):
        return

    commit_msg = get_last_commit_message()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    entry = f"\n### 📝 Commit Auto-Log ({timestamp})\n- {commit_msg}\n"
    
    with open(MEMORY_FILE, 'a', encoding='utf-8') as f:
        f.write(entry)

if __name__ == "__main__":
    update_memory()
