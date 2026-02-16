from ultralytics import YOLO
import sys

try:
    print("Loading pest.pt...")
    pest_model = YOLO('weights/pest.pt')
    print("pest.pt loaded successfully.")

    print("Loading weed.pt...")
    weed_model = YOLO('weights/weed.pt')
    print("weed.pt loaded successfully.")

except Exception as e:
    print(f"Error loading models: {e}")
    sys.exit(1)
