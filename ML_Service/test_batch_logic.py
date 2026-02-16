
import requests
import os
import numpy as np
import cv2

# 1. Create a few dummy images
imgs = []
for i in range(2):
    img_name = f"test_batch_{i}.jpg"
    img = np.zeros((640, 640, 3), dtype=np.uint8)
    cv2.putText(img, f"Batch Image {i}", (50, 300), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    cv2.imwrite(img_name, img)
    imgs.append(img_name)

# 2. Upload to /analyze-batch
url = "http://localhost:8000" 
print(f"Testing batch upload to {url}/analyze-batch...")

files = [('files', open(img, 'rb')) for img in imgs]
resp = requests.post(f"{url}/analyze-batch", files=files)

# Close files
for _, f in files:
    f.close()

if resp.status_code != 200:
    print("Batch Analysis failed:", resp.text)
    exit(1)

data = resp.json()
print(f"Success! Job ID: {data.get('job_id')}")
print(f"Processed {data.get('processed_count')} images.")

for res in data.get('results', []):
    print(f"\nFile: {res['filename']}")
    print(f"Annotated URL: {res['result_url']}")
    print(f"Detections: {len(res['detections'])}")

# Clean up
for img in imgs:
    os.remove(img)
