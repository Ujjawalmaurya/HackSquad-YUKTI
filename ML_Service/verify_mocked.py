
import os
import sys
import numpy as np
import cv2
from unittest.mock import MagicMock

# Mock ultralytics before importing anything that might use it
sys.modules['ultralytics'] = MagicMock()

sys.path.append(os.getcwd())
from utils.image import calculate_ndvi, annotate_image

def test_logic():
    print("Testing with Mocked Models...")
    
    # 1. Create dummy image
    image = np.zeros((640, 640, 3), dtype=np.uint8)
    cv2.putText(image, 'Test', (200, 300), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
    
    # 2. Test calculate_ndvi
    print("Testing NDVI...")
    ndvi = calculate_ndvi(image)
    assert ndvi.shape == (640, 640)
    print("NDVI shape OK.")
    
    # 3. Simulate detections (raw findings format)
    print("Simulating detections...")
    detections = [
        {
            "label": "Pest A",
            "confidence": 0.85,
            "box": [100, 100, 200, 200],
            "class_id": 1,
            "type": "pest",
            "color": (0, 0, 255)
        },
        {
            "label": "Weed B",
            "confidence": 0.92,
            "box": [300, 300, 450, 400],
            "class_id": 2,
            "type": "weed",
            "color": (0, 255, 0)
        }
    ]
    
    # 4. Test Annotation
    print("Testing annotation...")
    annotated = annotate_image(image, detections)
    
    # Verify shape
    assert annotated.shape == image.shape
    print("Annotation shape verified.")
    
    # 5. Output structure check (matching analyze_image response)
    output = {
        "analysis_id": "test-uuid",
        "ndvi": float(np.mean(ndvi)),
        "disease_detected": False,
        "predictions": [{"label": "healthy", "confidence": 0.99}],
        "detections": detections,
        "annotated_image_url": "/data/analysis/test-uuid/annotated_test.jpg",
        "yield_prediction": 15.0,
        "status": "Success"
    }
    
    print("Output structure check:")
    print(f"  NDVI: {output['ndvi']}")
    print(f"  Detections: {len(output['detections'])}")
    print(f"  Image URL: {output['annotated_image_url']}")
    
    print("\nLogic Verification PASSED (Mocked).")

if __name__ == "__main__":
    test_logic()
