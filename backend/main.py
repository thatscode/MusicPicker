from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import requests
from analysis import analyze_audio
from recommendation import get_recommendations

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UrlRequest(BaseModel):
    url: str

@app.get("/")
async def root():
    return {"message": "Music Picker API is running"}

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    temp_file_path = f"temp_{file.filename}"
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        result = analyze_audio(temp_file_path)
        
        if result is None:
            raise HTTPException(status_code=500, detail="Analysis failed")
            
        return result
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/analyze-url")
async def analyze_url(request: UrlRequest):
    url = request.url
    filename = url.split("/")[-1] or "downloaded_audio.mp3"
    # Basic sanitization
    filename = "".join(c for c in filename if c.isalnum() or c in "._-")
    temp_file_path = f"temp_url_{filename}"
    
    print(f"Downloading from URL: {url}")
    
    try:
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        # Check content type if possible, but rely on librosa to fail if invalid
        
        with open(temp_file_path, "wb") as buffer:
            for chunk in response.iter_content(chunk_size=8192):
                buffer.write(chunk)
                
        print(f"Download complete: {temp_file_path}")
        
        result = analyze_audio(temp_file_path)
        
        if result is None:
            raise HTTPException(status_code=500, detail="Analysis failed. The file might not be a valid audio file.")
            
        return result
        
    except requests.RequestException as e:
        print(f"Download failed: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to download file: {str(e)}")
    except Exception as e:
        print(f"Error processing URL: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.get("/recommend")
async def recommend_endpoint(genre: str = None):
    return get_recommendations(genre)
