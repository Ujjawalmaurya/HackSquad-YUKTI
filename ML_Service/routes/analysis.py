from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import numpy as np
import cv2
import torch
import uuid
import os
from pathlib import Path
from ultralytics import YOLO
from utils.image import calculate_ndvi, annotate_image

router = APIRouter()

# Load models
model = YOLO('yolov8x-cls.pt') 
pest_detector = YOLO('weights/pest.pt')
weed_detector = YOLO('weights/weed.pt')

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
    
    ndvi = calculate_ndvi(image)
    avg_ndvi = np.mean(ndvi)
    
    device = '0' if torch.cuda.is_available() else 'cpu'
    results = model(image, device=device)
    
    # Run Detection Models
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
                "color": (0, 0, 255) # Red for pests
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
                "color": (0, 255, 0) # Green for weeds
            }
            detections_for_viz.append(det)
            raw_findings.append(det)
    
    # Create Annotated Image
    annotated = annotate_image(image, detections_for_viz)
    
    # Save Annotated Image
    analysis_id = str(uuid.uuid4())
    output_dir = Path("data_layer/processed/analysis") / analysis_id
    output_dir.mkdir(parents=True, exist_ok=True)
    output_filename = f"annotated_{file.filename}"
    output_path = output_dir / output_filename
    cv2.imwrite(str(output_path), annotated)
    
    # Classification Logic
    top5_probs = []
    disease_detected = False
    
    if results[0].probs is not None:
        probs = results[0].probs
        top5_indices = probs.top5
        top5_conf = probs.top5conf
        
        for i in range(len(top5_indices)):
            class_index = top5_indices[i]
            confidence = float(top5_conf[i])
            label = model.names[int(class_index)]
            
            top5_probs.append({
                "label": label,
                "confidence": confidence
            })
            
            if i == 0 and "healthy" not in label.lower() and confidence > 0.4:
                disease_detected = True

    yield_est = float(avg_ndvi * 12 + 4) 
    
    return {
        "analysis_id": analysis_id,
        "ndvi": float(avg_ndvi),
        "disease_detected": disease_detected,
        "predictions": top5_probs,
        "detections": raw_findings,
        "annotated_image_url": f"/data/analysis/{analysis_id}/{output_filename}",
        "yield_prediction": yield_est,
        "metadata": {
            "resolution": f"{image.shape[1]}x{image.shape[0]}",
            "app_mode": "In-depth Analysis",
            "model": "YOLOv8-MultiTask"
        },
        "status": "Success"
    }

@router.post("/analyze-batch")
async def analyze_batch(files: List[UploadFile] = File(...)):
    job_id = str(uuid.uuid4())
    results = []
    
    base_output = Path("data_layer/processed/batch") / job_id
    base_output.mkdir(parents=True, exist_ok=True)
    
    device = '0' if torch.cuda.is_available() else 'cpu'
    
    for file in files:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            continue
            
        # Run Detection Models
        pest_res = pest_detector(image, device=device)
        weed_res = weed_detector(image, device=device)
        
        img_detections = []
        
        for r in pest_res:
            for box in r.boxes:
                img_detections.append({
                    "label": pest_detector.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "box": box.xyxy[0].tolist(),
                    "class_id": int(box.cls),
                    "type": "pest",
                    "color": (0, 0, 255)
                })

        for r in weed_res:
            for box in r.boxes:
                img_detections.append({
                    "label": weed_detector.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "box": box.xyxy[0].tolist(),
                    "class_id": int(box.cls),
                    "type": "weed",
                    "color": (0, 255, 0)
                })

        # Create Annotated Image
        annotated = annotate_image(image, img_detections)
        
        output_filename = f"annotated_{file.filename}"
        output_path = base_output / output_filename
        cv2.imwrite(str(output_path), annotated)
        
        results.append({
            "filename": file.filename,
            "detections": img_detections,
            "result_url": f"/data/batch/{job_id}/{output_filename}"
        })

    return {
        "job_id": job_id,
        "total_images": len(files),
        "processed_count": len(results),
        "results": results,
        "status": "Success"
    }
