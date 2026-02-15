# Backend API Documentation

This file documents the API endpoints for the Hyperspace backend.
Base URL: `http://localhost:5000`

## System

### Health Check
- **URL:** `/`
- **Method:** `GET`
- **Description:** Checks if the API service is running.
- **Response:**
  - `200 OK`: "API is running..."

---

## Authentication (`/api/auth`)

### Register
- **URL:** `/register`
- **Method:** `POST`
- **Description:** Registers a new farmer.
- **Body:**
  ```json
  {
      "name": "Full Name",
      "email": "email@example.com",
      "password": "strongPassword",
      "phoneNumber": "1234567890",
      "farmLocation": { "address": "...", "lat": 0, "lng": 0 }
  }
  ```
- **Response:** `201 Created` with token and user object.

### Login
- **URL:** `/login`
- **Method:** `POST`
- **Description:** Authenticates a user.
- **Response:** `200 OK` with token.

### Get Me
- **URL:** `/me`
- **Method:** `GET`
- **Description:** Returns the current authenticated user.

### Update Profile
- **URL:** `/profile`
- **Method:** `PUT`
- **Description:** Updates the user's profile details.

---

## Farms (`/api/farms`)

### List All Farms
- **URL:** `/`
- **Method:** `GET`
- **Description:** Retrieves a list of all farms.

### Get Dashboard Stats
- **URL:** `/stats`
- **Method:** `GET`
- **Description:** Retrieves aggregated statistics (total farms, area, etc.).

### Get Farm by ID
- **URL:** `/:id`
- **Method:** `GET`
- **Description:** Retrieves details of a specific farm.

---

## Analysis (`/api/analysis`)

### Single Image Analysis
- **URL:** `/analyze`
- **Method:** `POST`
- **Description:** Uploads one image for disease/NDVI analysis.
- **Body:** `multipart/form-data` with `image` and `farmId`.

### Batch Analysis & Report
- **URL:** `/analyze-batch`
- **Method:** `POST`
- **Description:** Uploads multiple images, gets ML data, and generates a Gemini AI report.
- **Body:** `multipart/form-data` with multiple `files`.

---

## Reports (`/api/reports`)

### List All Reports
- **URL:** `/`
- **Method:** `GET`
- **Description:** Retrieves all generated AI flight reports, sorted by newest first.
- **Response:**
  ```json
  [
    {
      "_id": "65b...",
      "content": "# Markdown Report...",
      "mlResults": { ... },
      "images": ["/uploads/..."],
      "createdAt": "2024-..."
    }
  ]
  ```

### Get Report by ID
- **URL:** `/:id`
- **Method:** `GET`
- **Description:** Retrieves details of a specific report.
- **Response:** A single report object.

---

## AI Chat (`/api/chat`)

### Chat with Sky Scout
- **URL:** `/`
- **Method:** `POST`
- **Description:** Sends a message to the Gemini-powered agricultural assistant.
- **Body:** `{ "message": "..." }`
