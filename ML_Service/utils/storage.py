import os
import uuid
import json
import cv2
from datetime import datetime
from pathlib import Path

# Base storage path - pointing to backend storage
# Assuming ML_Service is at /home/um/Stuffs/HackSquad-YUKTI/ML_Service
# and backend is at /home/um/Stuffs/HackSquad-YUKTI/backend
# We need to go up one level and then into backend/storage
BASE_STORAGE_PATH = Path("../backend/storage/analysis")

def generate_batch_id():
    """Generates a unique batch ID: uuid_timestamp."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8] # Short UUID for readability
    return f"{unique_id}_{timestamp}"

def save_analysis_results(images, detections_list, batch_id=None):
    """
    Saves annotated images and metadata to the backend storage.
    
    Args:
        images: List of tuple (filename, numpy_image_array)
        detections_list: List of detections corresponding to images.
        batch_id: Optional existing batch_id.
        
    Returns:
        dict containing batch_id and list of result objects with URLs.
    """
    if not batch_id:
        batch_id = generate_batch_id()
        
    batch_dir = BASE_STORAGE_PATH / batch_id
    batch_dir.mkdir(parents=True, exist_ok=True)
    
    saved_results = []
    
    for (filename, img), detections in zip(images, detections_list):
        # Generate clean filename
        base_name = Path(filename).stem
        ext = Path(filename).suffix
        safe_name = f"{base_name}_boxed{ext}" if ext else f"{base_name}_boxed.jpg"
        
        output_path = batch_dir / safe_name
        
        # Compress and Save
        # quality=90 for jpg
        if safe_name.lower().endswith(('.jpg', '.jpeg')):
            cv2.imwrite(str(output_path), img, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        else:
            cv2.imwrite(str(output_path), img) # PNG default compression
            
        # JSON Metadata
        meta_name = f"{base_name}_meta.json"
        meta_path = batch_dir / meta_name
        
        meta_data = {
            "original_filename": filename,
            "timestamp": datetime.now().isoformat(),
            "detections": detections
        }
        
        with open(meta_path, 'w') as f:
            json.dump(meta_data, f, indent=2)
            
        # Construct URL (assuming backend serves /storage)
        # URL depends on how backend serves it. 
        # Plan says: /storage/analysis/<batch_id>/<filename>
        result_url = f"/storage/analysis/{batch_id}/{safe_name}"
        meta_url = f"/storage/analysis/{batch_id}/{meta_name}"
        
        saved_results.append({
            "input": filename,
            "result_url": result_url,
            "meta_url": meta_url,
            "detections_count": len(detections)
        })
        
    return {
        "batch_id": batch_id,
        "base_path": f"/storage/analysis/{batch_id}",
        "images": saved_results
    }
