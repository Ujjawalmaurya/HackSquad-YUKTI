#!/bin/bash
# verify_backend.sh

echo "1. Fetching Farms..."
response=$(curl -s https://hyperspace-c9kd.onrender.com/api/farms)
echo "Response: $response"

# Extract ID using grep/sed (simple hack, assuming simple json)
farm_id=$(echo $response | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$farm_id" ]; then
    echo "Error: No farm ID found."
    exit 1
fi

echo "Found Farm ID: $farm_id"

echo "2. Creating dummy image..."
convert -size 100x100 xc:white test_image.jpg

echo "3. Uploading Image..."
analyze_response=$(curl -s -X POST -F "image=@test_image.jpg" -F "farmId=$farm_id" http://localhost:5001/api/analyze)
echo "Analyze Response: $analyze_response"

if [[ "$analyze_response" == *"Fallback Active"* ]]; then
    echo "SUCCESS: Backend handled upload and triggered fallback correctly."
else
    echo "WARNING: Unexpected response (Check output)."
fi
