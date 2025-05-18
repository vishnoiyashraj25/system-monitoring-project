import os
import json
import time
import socket
import psutil
import platform
import requests
from datetime import datetime
import threading
import random

# Server URL (change if needed)
SERVER_URL = "http://localhost:3001/api/report"
STATE_FILE = "prev_state.json"

def get_system_info():
    return {
        "machine_id": socket.gethostname(),  # Machine name
        "os": platform.system() + " " + platform.release(), 
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory": psutil.virtual_memory()._asdict(),
        "disk": psutil.disk_usage("/")._asdict(),
        "platform": platform.system(),
        "platform_version": platform.version(),
        "timestamp": datetime.now().isoformat()
    }
def load_previous_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return {}
    return {}

def save_current_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f)

def system_state_changed(old, new):
    return old != new

def send_report(data):
    try:
        res = requests.post(SERVER_URL, json=data)
        if res.status_code == 200:
            print(f"[✓] Report sent at {datetime.now().strftime('%H:%M:%S')}")
            return True
        else:
            print(f"[✗] Server error {res.status_code}")
    except Exception as e:
        print(f"[✗] Network error: {e}")
    return False

def monitor():
    while True:
        print("[✓] Running system check...")
        new_state = get_system_info()
        old_state = load_previous_state()

        if system_state_changed(old_state, new_state):
            print("[→] Change detected. Sending data to server...")
            if send_report(new_state):
                save_current_state(new_state)
        else:
            print("[✓] No changes detected. Skipping report.")

        # Sleep for a random time between 15 to 60 minutes (in seconds)
        sleep_time = random.randint(15 * 60, 60 * 60)
        print(f"[⏳] Sleeping for {sleep_time // 60} minutes...")
        time.sleep(sleep_time)

if __name__ == "__main__":
    # Run the monitor in a lightweight thread to act like a daemon
    thread = threading.Thread(target=monitor, daemon=True)
    thread.start()

    # Keep main process alive
    while True:
        time.sleep(3600)
