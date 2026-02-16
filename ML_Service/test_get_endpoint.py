import requests
import json
import sys

# Use the batch_id from successful test if known, otherwise hardcode or pass as arg
batch_id = "e001f1c6_20260216_124321" 

if len(sys.argv) > 1:
    batch_id = sys.argv[1]

url = f"http://localhost:8000/analyze-v2/{batch_id}"

try:
    response = requests.get(url)
    if response.status_code == 200:
        print("Response 200 OK")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Failed: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Request failed: {e}")
