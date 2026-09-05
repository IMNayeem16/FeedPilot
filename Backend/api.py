import os
import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
model = joblib.load(MODEL_PATH)

app = FastAPI(title="FeedPilot AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Video(BaseModel):
    title: str
    channel: str = ""

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/classify")
def classify(video: Video):
    text = f"{video.title} {video.channel}".strip()
    probabilities = model.predict_proba([text])[0]
    classes = model.classes_
    scores = dict(zip(classes, probabilities))
    label = max(scores, key=scores.get)

    return {
        "label": label,
        "confidence": float(scores[label]),
        "probabilities": {k: float(v) for k, v in scores.items()}
    }
