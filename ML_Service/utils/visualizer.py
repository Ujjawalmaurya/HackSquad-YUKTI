import cv2
import numpy as np

def draw_detections(image, detections):
    """
    Draws bounding boxes and labels on the image with strict visibility rules.
    
    Args:
        image: The original image (numpy array, BGR).
        detections: List of dicts, each containing:
            - box: [x1, y1, x2, y2]
            - label: str
            - confidence: float
            - color: tuple (B, G, R)
            
    Returns:
        Annotated image (numpy array).
    """
    annotated = image.copy()
    h_img, w_img = annotated.shape[:2]
    
    for det in detections:
        x1, y1, x2, y2 = map(int, det["box"])
        label = det.get("label", "Object")
        conf = det.get("confidence", 0.0)
        color = det.get("color", (0, 255, 0)) # Default Green
        
        # Enforce Box Drawing
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        
        # Prepare Text
        text = f"{label} {conf:.2f}"
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.6
        thickness = 2
        
        (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)
        
        # Determine Text Position (Prefer Top)
        # Check if text fits above the box
        if y1 - text_height - 10 > 0:
            text_x = x1
            text_y = y1 - 5
            
            # Background Rect (Top)
            cv2.rectangle(annotated, 
                          (text_x, text_y - text_height - baseline), 
                          (text_x + text_width, text_y + baseline), 
                          color, 
                          -1)
            
            # Draw Text
            cv2.putText(annotated, text, (text_x, text_y), font, font_scale, (255, 255, 255), thickness)
            
        else:
            # Collision with top edge -> Move to Bottom/Inside
            # Try inside top
            text_x = x1
            text_y = y1 + text_height + 10
            
            # Background Rect (Inside Top)
            cv2.rectangle(annotated, 
                          (text_x, text_y - text_height - baseline), 
                          (text_x + text_width, text_y + baseline), 
                          color, 
                          -1)
            
            # Draw Text
            cv2.putText(annotated, text, (text_x, text_y), font, font_scale, (255, 255, 255), thickness)

    return annotated
