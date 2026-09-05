import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report


# Load dataset
data = pd.read_csv("Backend/dataset.csv")


X = data["text"]
y = data["label"]


# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# Build model
model = Pipeline([

    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            min_df=1
        )
    ),

    (
        "classifier",
        LogisticRegression(
            max_iter=1000
        )
    )

])


# Train
model.fit(
    X_train,
    y_train
)


# Evaluate
predictions = model.predict(X_test)

print(
    classification_report(
        y_test,
        predictions
    )
)


# Save
joblib.dump(
    model,
    "model.pkl"
)


print("Model saved as model.pkl")