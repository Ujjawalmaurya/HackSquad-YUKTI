
import os
import sys
import numpy as np
import cv2
import torch
from pathlib import Path
from ultralytics import YOLO

# Mock calculate_ndvi and annotate_image if needed, or import them
sys.path.append(os.getcwd())
try:
    from utils.image import calculate_ndvi, annotate_image
except ImportError:
    print("Failed to import utils.image")
    exit(1)

def test_logic():
    # 1. Setup
    print("Loading models...")
    model = YOLO('yolov8x-cls.pt') 
    pest_detector = YOLO('weights/pest.pt')
    weed_detector = YOLO('weights/weed.pt')
    
    # 2. Create dummy image
    image = np.zeros((640, 640, 3), dtype=np.uint8)
    cv2.putText(image, 'Test', (200, 300), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
    
    # 3. Simulate analysis logic
    print("Running analysis...")
    ndvi = calculate_ndvi(image)
    avg_ndvi = np.mean(ndvi)
    
    device = '0' if torch.cuda.is_available() else 'cpu'
    results = model(image, device=device)
    pest_results = pest_detector(image, device=device)
    weed_results = weed_detector(image, device=device)
    
    detections_for_viz = []
    raw_findings = []
    
    for r in pest_results:
        for box in r.boxes:
            det = {
                "label": pest_detector.names[int(box.cls)],
                "confidence": float(box.conf),
                "box": box.xyxy[0].tolist(),
                "class_id": int(box.cls),
                "type": "pest",
                "color": (0, 0, 255)
            }
            detections_for_viz.append(det)
            raw_findings.append(det)

    for r in weed_results:
        for box in r.boxes:
            det = {
                "label": weed_detector.names[int(box.cls)],
                "confidence": float(box.conf),
                "box": box.xyxy[0].tolist(),
                "class_id": int(box.cls),
                "type": "weed",
                "color": (0, 255, 0)
            }
            detections_for_viz.append(det)
            raw_findings.append(det)
    
    print(f"Found {len(raw_findings)} detections")
    
    # 4. Test Annotation
    print("Testing annotation...")
    annotated = annotate_image(image, detections_for_viz)
    
    # Verify shape
    assert annotated.shape == image.shape
    print("Annotation shape verified.")
    
    # 5. Output structure check
    output = {
        "ndvi": float(avg_ndvi),
        "detections": raw_findings,
        "status": "Success"
    }
    print("Final output structure looks good.")
    print(output)

if __name__ == "__main__":
    test_logic()
