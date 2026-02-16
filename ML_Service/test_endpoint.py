import requests
import json
import os

url = "http://localhost:8000/analyze-v2"
image_path = "/home/um/Stuffs/HackSquad-YUKTI/backend/uploads/1768588822460-test_image.jpg"

if not os.path.exists(image_path):
    print(f"Image not found at {image_path}")
    # Try finding any image in uploads
    uploads_dir = "/home/um/Stuffs/HackSquad-YUKTI/backend/uploads"
    files = [f for f in os.listdir(uploads_dir) if f.endswith('.jpg')]
    if files:
        image_path = os.path.join(uploads_dir, files[0])
        print(f"Using alternative image: {image_path}")
    else:
        print("No jpg images found in uploads.")
        exit(1)

with open(image_path, "rb") as f:
    files = {"files": (os.path.basename(image_path), f, "image/jpeg")}
    
    try:
        response = requests.post(url, files=files)
        if response.status_code == 200:
            print("Response 200 OK")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Request failed: {e}")
