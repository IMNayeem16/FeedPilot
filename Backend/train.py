import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET = os.path.join(BASE_DIR, "dataset.csv")
MODEL = os.path.join(BASE_DIR, "model.pkl")

data = pd.read_csv(DATASET)
data["text"] = data["text"].fillna("").astype(str)
data["label"] = data["label"].astype(str).str.upper()

X_train, X_test, y_train, y_test = train_test_split(
    data["text"], data["label"],
    test_size=0.25,
    random_state=42,
    stratify=data["label"]
)

model = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True,
        strip_accents="unicode",
        ngram_range=(1, 2),
        sublinear_tf=True
    )),
    ("classifier", LogisticRegression(
        max_iter=2000,
        class_weight="balanced"
    ))
])

model.fit(X_train, y_train)
predictions = model.predict(X_test)

print(classification_report(y_test, predictions, zero_division=0))
joblib.dump(model, MODEL)
print(f"\nModel saved to: {MODEL}")
