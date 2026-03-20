from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/download")
async def download_file():
    return FileResponse(
        "/app/frontend/build/myapp.zip",
        media_type="application/zip",
        filename="cronos-gangsters-dex.zip"
    )

@app.get("/api/health")
async def health():
    return {"status": "ok"}
