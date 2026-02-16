import requests
import time

# 1. Login
auth_url = "http://localhost:5000/api/auth/login"
creds = {"email": "testuser@example.com", "password": "password123"}
try:
    auth_res = requests.post(auth_url, json=creds)
    token = auth_res.json().get("token")
    if not token:
        print("Login failed")
        exit(1)
    print("Login successful.")
except Exception as e:
    print(f"Login error: {e}")
    exit(1)

headers = {"Authorization": f"Bearer {token}"}

# 2. Check existing alerts count
alerts_url = "http://localhost:5000/api/alerts"
res = requests.get(alerts_url, headers=headers)
initial_count = len(res.json())
print(f"Initial alert count: {initial_count}")

# 3. Trigger Analysis (which should trigger alert)
# We use the same image as before, assuming it has detections
analyze_url = "http://localhost:5000/api/analysis/analyze-v2"
image_path = "/home/um/Stuffs/HackSquad-YUKTI/backend/test_image.jpg" # Ensure this exists or use fallback
# ... (reuse fallback logic from previous script if needed, but for now assuming it's there or using uploads)
import os
if not os.path.exists(image_path):
    # Try find any jpg in uploads
    for f in os.listdir("/home/um/Stuffs/HackSquad-YUKTI/backend/uploads"):
        if f.endswith(".jpg") or f.endswith(".jpeg"):
            image_path = os.path.join("/home/um/Stuffs/HackSquad-YUKTI/backend/uploads", f)
            break
print(f"Using image: {image_path}")

files = [("files", ("test_alert.jpg", open(image_path, "rb"), "image/jpeg"))]
print("Triggering analysis...")
res = requests.post(analyze_url, files=files, headers=headers)
if res.status_code != 200:
    print("Analysis failed")
    print(res.text)
    exit(1)

print("Analysis done. Waiting for potential async operations...")
time.sleep(2) 

# 4. Check alerts again
res = requests.get(alerts_url, headers=headers)
new_alerts = res.json()
final_count = len(new_alerts)
print(f"Final alert count: {final_count}")

if final_count > initial_count:
    print("SUCCESS: New alerts generated.")
    print("Latest Alert:", new_alerts[0])
else:
    print("WARNING: No new alerts generated. (Maybe no pests detected?)")
