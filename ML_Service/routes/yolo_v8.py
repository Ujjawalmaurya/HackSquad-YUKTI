from fastapi import APIRouter, UploadFile, File, HTTPException
import numpy as np
import cv2
import torch
from ultralytics import YOLO
from utils.visualizer import draw_detections
from utils.storage import save_analysis_results, BASE_STORAGE_PATH
import os
import glob
from typing import List

router = APIRouter()

# Load models once
# Ensure weights exist in 'weights/' directory relative to ML_Service root
# We assume the service is run from ML_Service/ directory
try:
    pest_model = YOLO('weights/pest.pt')
    weed_model = YOLO('weights/weed.pt')
except Exception as e:
    print(f"Error loading models: {e}")
    # Fallback or exit? For now, let it crash if weights are missing as they are critical.
    # But to be safe for this environment we might want to check.
    pass 

@router.post("/analyze-v2")
async def analyze_v2(files: List[UploadFile] = File(...), conf_threshold: float = 0.25):
    """
    Endpoint for YOLOv8 analysis with strict visualization and storage.
    Args:
        files: List of images.
        conf_threshold: Confidence threshold for detections (default 0.25).
    """
    processed_images = []
    all_detections = []
    
    device = '0' if torch.cuda.is_available() else 'cpu'
    
    for file in files:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            print(f"Failed to decode image: {file.filename}")
            continue
            
        # Run Inference
        # Pest
        pest_results = pest_model(image, device=device, conf=conf_threshold)
        # Weed
        weed_results = weed_model(image, device=device, conf=conf_threshold)
        
        detections = []
        
        # Process Pest Results
        for r in pest_results:
            for box in r.boxes:
                detections.append({
                    "label": pest_model.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "box": box.xyxy[0].tolist(),
                    "class_id": int(box.cls),
                    "type": "pest",
                    "color": (0, 0, 255) # Red
                })
                
        # Process Weed Results
        for r in weed_results:
            for box in r.boxes:
                detections.append({
                    "label": weed_model.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "box": box.xyxy[0].tolist(),
                    "class_id": int(box.cls),
                    "type": "weed",
                    "color": (0, 255, 0) # Green
                })
        
        # Draw Visualizations (Strict Rules)
        annotated_image = draw_detections(image, detections)
        
        processed_images.append((file.filename, annotated_image))
        all_detections.append(detections)
        
    if not processed_images:
        return {"status": "error", "message": "No valid images processed"}
        
    # Save Results
    storage_result = save_analysis_results(processed_images, all_detections)
    
    return {
        "status": "success",
        "batch_id": storage_result["batch_id"],
        "base_path": storage_result["base_path"],
        "results": storage_result["results"]
    }

@router.get("/analyze-v2/{batch_id}")
async def get_batch_results(batch_id: str):
    """
    Retrieve results for a specific batch ID.
    """
    batch_dir = BASE_STORAGE_PATH / batch_id
    
    if not batch_dir.exists():
        raise HTTPException(status_code=404, detail="Batch not found")
        
    # Find all meta files to reconstruct results
    meta_files = list(batch_dir.glob("*_meta.json"))
    
    results = []
    for meta_file in meta_files:
        # derive image name
        # meta is name_meta.json
        # image is name_boxed.jpg (or png)
        # We can just look for the corresponding image
        
        base_name = meta_file.name.replace("_meta.json", "")
        
        # Try finding the boxed image
        image_name = f"{base_name}_boxed.jpg"
        if not (batch_dir / image_name).exists():
            # Try png
            image_name = f"{base_name}_boxed.png"
            
        if (batch_dir / image_name).exists():
            results.append({
                "input": f"{base_name} (original)", # We don't verify original input path here easily unless in meta
                "result_url": f"/storage/analysis/{batch_id}/{image_name}",
                "meta_url": f"/storage/analysis/{batch_id}/{meta_file.name}"
            })
            
    return {
        "batch_id": batch_id,
        "base_path": f"/storage/analysis/{batch_id}",
        "results": results
    }
