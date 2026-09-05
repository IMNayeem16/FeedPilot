import os
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
model = joblib.load(MODEL_PATH)

def classify(text):
    probabilities = model.predict_proba([text])[0]
    classes = model.classes_
    scores = dict(zip(classes, probabilities))
    label = max(scores, key=scores.get)
    return {
        "label": label,
        "confidence": float(scores[label]),
        "probabilities": {k: float(v) for k, v in scores.items()}
    }

if __name__ == "__main__":
    while True:
        text = input("\nVideo title (or 'exit'): ").strip()
        if text.lower() == "exit":
            break
        print(classify(text))
