import numpy as np
import cv2

def calculate_ndvi(image):
    """
    Calculate NDVI from image.
    Heuristic: Assume BGRN (4 channels), else standard BGR.
    """
    if len(image.shape) == 3 and image.shape[2] >= 4:
        # B, G, R, NIR
        red = image[:, :, 2].astype(float)
        nir = image[:, :, 3].astype(float)
    else:
        # Fallback for RGB: use Blue as NIR simulator (not accurate but keeps it running)
        red = image[:, :, 2].astype(float)
        nir = image[:, :, 0].astype(float) 
        
    numerator = (nir - red)
    denominator = (nir + red + 1e-6)
    return numerator / denominator

def annotate_image(image, detections):
    """
    Draw bounding boxes and labels on the image.
    detections: List of dicts with {"label": str, "confidence": float, "box": [x1, y1, x2, y2], "color": (b, g, r)}
    """
    annotated = image.copy()
    for det in detections:
        x1, y1, x2, y2 = map(int, det["box"])
        color = det.get("color", (0, 255, 0)) # Default to green
        label = det["label"]
        conf = det["confidence"]
        
        # Draw Box
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        
        # Draw Label
        text = f"{label} {conf:.2f}"
        (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
        cv2.rectangle(annotated, (x1, y1 - th - 10), (x1 + tw, y1), color, -1)
        cv2.putText(annotated, text, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
    return annotated
