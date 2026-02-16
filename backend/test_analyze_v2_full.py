import requests
import json
import os

# 1. Login
auth_url = "http://localhost:5000/api/auth/login"
creds = {"email": "testuser@example.com", "password": "password123"}
try:
    auth_res = requests.post(auth_url, json=creds)
    token = auth_res.json().get("token")
    if not token:
        print("Login failed")
        print(auth_res.text)
        exit(1)
    print("Login successful.")
except Exception as e:
    print(f"Login error: {e}")
    exit(1)

# 2. Analyze
analyze_url = "http://localhost:5000/api/analysis/analyze-v2"
image_path = "/home/um/Stuffs/HackSquad-YUKTI/backend/uploads/1768588822460-test_image.jpg"

if not os.path.exists(image_path):
    print(f"Image not found: {image_path}")
    exit(1)

with open(image_path, "rb") as f:
    files = {"files": ("test_image.jpg", f, "image/jpeg")}
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        print("Sending analysis request...")
        res = requests.post(analyze_url, files=files, headers=headers)
        if res.status_code == 200:
            data = res.json()
            print("Analysis successful.")
            print(f"Batch ID: {data.get('batch_id')}")
            
            if "report" in data:
                report_content = data['report']
                print("Report generated successfully.")
                if "<img" in report_content:
                    print("SUCCESS: Image tags found in report.")
                    # Print snippet around the tag
                    idx = report_content.find("<img")
                    print(f"Snippet: {report_content[idx:idx+100]}...")
                else:
                    print("FAILURE: No image tags found in report.")
                    print("--- Full Report Content ---")
                    print(report_content)
                    print("--- End Report ---")
            else:
                print("Report field missing in response.")
                
            if "reportId" in data:
                print(f"Report saved to DB with ID: {data['reportId']}")
            else:
                print("Report ID missing.")
                
        else:
            print(f"Analysis failed: {res.status_code}")
            print(res.text)
    except Exception as e:
        print(f"Analysis error: {e}")
