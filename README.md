# LiveVibes
## Overview
LiveVibes is a live video streaming website where users can stream their webcam or screen, or both. The platform also includes a live chat feature for interactive communication.

## How to Run Locally
### Frontend
Navigate to the frontend directory.
Create a .env file with the following content:
```
VITE_SERVER_LINK=http://localhost:8000  

# Set to the port your backend is running on
```

Install dependencies:

npm install

Run the frontend:

npm run dev
### Backend
Navigate to the backend directory.
Create a .env file with the following content:
```
MONGODB_URI=your_mongodb_url
CORS_ORIGIN=http://localhost:your_frontend_port 
# Set to your frontend localhost link

ACCESS_TOKEN_SECRET=your_secret_key

ACCESS_TOKEN_EXPIRY=1d 
 # Set to your preferred token expiry time

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret


```
Install dependencies:

npm install

Run the backend:

npm start