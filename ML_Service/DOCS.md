# ML Service API Documentation

Here's a breakdown of the available endpoints and how to use them.

## 1. Analyze Single Image
Use this to get an in-depth look at a single photo.

**Endpoint:** `POST /analyze`

### Request
- **Type:** `multipart/form-data`
- **Body:** `file` (a single image file, e.g., JPG, PNG, TIF)

### Response
- `analysis_id`: Unique ID for this analysis.
- `ndvi`: The calculated health score (0 to 1).
- `disease_detected`: True if the model finds signs of disease.
- `detections`: A list of every pest and weed found.
    - `label`: Name of what was found.
    - `confidence`: How sure the model is (0 to 1).
    - `box`: Coordinates `[x1, y1, x2, y2]` of the found item.
- `annotated_image_url`: Link to the photo with boxes drawn around findings.
- `yield_prediction`: Estimated harvest amount.

---

## 2. Analyze Multiple Images (Batch)
Use this to process a group of photos at once.

**Endpoint:** `POST /analyze-batch`

### Request
- **Type:** `multipart/form-data`
- **Body:** `files` (one or more image files)

### Response
- `job_id`: Unique ID for the batch.
- `results`: List of individual image results:
    - `filename`: Name of the original file.
    - `detections`: List of found pests/weeds.
    - `result_url`: Link to the individual annotated photo.

---

## 3. YOLOv8 Precision Analysis (New)
Use this for high-precision pest and weed detection with strict bounding box visualization.

**Endpoint:** `POST /analyze-v2`

### Request
- **Type:** `multipart/form-data`
- **Body:** 
    - `files`: List of image files.
- **Query Parameters:**
    - `conf_threshold`: (Optional) Confidence threshold for detections (default: `0.25`).

### Response
- `status`: "success" or "error".
- `batch_id`: Unique ID for the batch (e.g., `uuid_timestamp`).
- `base_path`: Server path where results are stored.
- `results`: List of result objects:
    - `input`: Original filename.
    - `result_url`: URL to the annotated image.
    - `meta_url`: URL to the detailed JSON metadata.
    - `detections_count`: Number of objects found.

**Endpoint:** `GET /analyze-v2/{batch_id}`

### Description
Retrieve the results of a previously processed batch without re-running inference.

### Response
Same structure as the POST response.

---

## 3. Process Full Dataset
Use this for large-scale multispectral mapping from a zipped collection of drone images.

**Endpoint:** `POST /process-dataset`

### Request
- **Type:** `multipart/form-data`
- **Body:** `file` (a **ZIP file** containing multispectral TIF images)

### Response
- `job_id`: Use this ID to check status or get the final report.
- `message`: Tells you the job has been queued.

---

## 4. Check Job Status
Check how your dataset processing is coming along.

**Endpoint:** `GET /status/{job_id}`

### Response
- `status`: Current stage (`QUEUED`, `PROCESSING`, `COMPLETED`, or `FAILED`).
- `step`: More detail on what it's doing right now.

---

## 5. Get Processing Report
Get the final results once the dataset processing is `COMPLETED`.

**Endpoint:** `GET /report/{job_id}`

### Response
- `report_url`: Link to a full HTML report.
- `indices`: Links to generated maps (NDVI, GNDVI, etc.) with color scales.
