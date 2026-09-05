import joblib


model = joblib.load(
    "model.pkl"
)


while True:

    text = input(
        "\nEnter video title: "
    )

    if text.lower() == "exit":
        break


    prediction = model.predict([text])[0]


    probabilities = model.predict_proba([text])[0]


    confidence = max(probabilities)


    print(
        f"\nPrediction: {prediction}"
    )

    print(
        f"Confidence: {confidence:.2f}"
    )