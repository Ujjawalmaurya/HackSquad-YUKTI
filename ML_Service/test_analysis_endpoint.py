
import requests
import os
import glob
from pathlib import Path

# 1. Find a test image
image_files = glob.glob("ms-images/Multispectral Images on Paddy- Sri Lanka/*.TIF")
if not image_files:
    # Try another location or create a dummy one if needed, but let's assume one exists
    print("No TIF images found in ms-images/Multispectral Images on Paddy- Sri Lanka/")
    # Create a dummy image for testing if none found
    import numpy as np
    import cv2
    test_image = "test_image.jpg"
    cv2.imwrite(test_image, np.zeros((640, 640, 3), dtype=np.uint8))
else:
    test_image = image_files[0]

# 2. Upload to /analyze
url = "http://localhost:8000"
print(f"Testing {test_image} upload to {url}/analyze...")

with open(test_image, 'rb') as f:
    resp = requests.post(f"{url}/analyze", files={"file": f})

if resp.status_code != 200:
    print("Analysis failed:", resp.text)
    exit(1)

data = resp.json()
print("Success! Response:")
print(f"NDVI: {data.get('ndvi')}")
print(f"Disease Detected: {data.get('disease_detected')}")
print(f"Detections Count: {len(data.get('detections', []))}")
print(f"Annotated Image URL: {data.get('annotated_image_url')}")

if data.get('detections'):
    print("Example Detection:", data['detections'][0])

# Verify annotated image exists in filesystem (if running locally)
url_path = data.get('annotated_image_url')
if url_path:
    # /data/analysis/ID/filename -> data_layer/processed/analysis/ID/filename
    fs_path = Path("data_layer/processed") / url_path.replace("/data/", "")
    if fs_path.exists():
        print(f"Annotated image verified on disk: {fs_path}")
    else:
        print(f"Warning: Annotated image NOT found on disk at {fs_path}")
