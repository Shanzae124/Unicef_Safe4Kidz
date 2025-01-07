from fastapi import FastAPI, File, UploadFile
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from PIL import Image
import numpy as np
import pickle
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the models for image prediction
WOUND_MODEL_PATH = "wound_classification_model_vgg16.keras"
EMOTION_MODEL_PATH = "trained_emotion_model.keras"
wound_model = load_model(WOUND_MODEL_PATH)
emotion_model = load_model(EMOTION_MODEL_PATH)

# Load the tokenizer for text prediction
TEXT_MODEL_PATH = "final_toxic_comment_model.keras"
text_model = load_model(TEXT_MODEL_PATH)  # Add this line to load the text model

with open("tokenizer.pkl", "rb") as file:
    tokenizer = pickle.load(file)

# Define class labels for image predictions
wound_classes = ['Abrasions', 'Bruises', 'Burns', 'Cut', 'Diabetic Wounds', 'Laseration', 'Normal']
emotion_classes = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

def preprocess_image(image_file, model):
    """
    Preprocess an uploaded image to match the input shape of a model.
    """
    # Open the image and preprocess it
    image = Image.open(image_file).convert("RGB")  # Convert to RGB
    target_size = model.input_shape[1:3]  # Extract target size from model
    image = image.resize(target_size)  # Resize to match model input shape
    image_array = np.array(image) / 255.0  # Normalize pixel values to [0, 1]
    image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
    return image_array

@app.post("/predict_image/")
async def predict_image(file: UploadFile = File(...)):
    try:
        # Preprocess the image for both models
        wound_input = preprocess_image(file.file, wound_model)
        emotion_input = preprocess_image(file.file, emotion_model)

        # Wound detection prediction
        wound_pred = wound_model.predict(wound_input)
        wound_class_index = np.argmax(wound_pred)
        wound_class = wound_classes[wound_class_index]
        wound_confidence = float(np.max(wound_pred)) * 100

        # Emotion detection prediction
        emotion_pred = emotion_model.predict(emotion_input)
        emotion_class_index = np.argmax(emotion_pred)
        emotion_class = emotion_classes[emotion_class_index]
        emotion_confidence = float(np.max(emotion_pred)) * 100

        # Combine predictions to determine the scenario
        if wound_class in ['Bruises', 'Cuts', 'Burns'] and emotion_class in ['Fear', 'Sad', 'Angry']:
            result = "Bullying"
        elif wound_class in ['Abrasions', 'Cuts'] and emotion_class in ['Sad', 'Neutral']:
            result = "Child Labor"
        else:
            result = "Normal"

        return {
            "wound_detection": {
                "class": wound_class,
                "confidence": wound_confidence
            },
            "emotion_detection": {
                "class": emotion_class,
                "confidence": emotion_confidence
            },
            "result": result
        }

    except Exception as e:
        return {"error": str(e)}

from pydantic import BaseModel

# Define a Pydantic model for the request body
class TextRequest(BaseModel):
    input_text: str

# Use the model in the POST endpoint
@app.post("/predict_text/")
async def predict_text(request: TextRequest):
    try:
        input_text = request.input_text  # Access input_text from the body

        # Check if the input is empty
        if not input_text or not input_text.strip():
            return {"error": "Input text cannot be empty"}

        # Preprocess the input text for prediction
        sequence = tokenizer.texts_to_sequences([input_text])
        padded_sequence = pad_sequences(sequence, maxlen=200)

        # Make the prediction
        prediction = text_model.predict(padded_sequence)[0]

        # Define labels for text toxicity
        labels = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']

        # Display predictions with confidence
        result = {label: f"{confidence:.2%} confidence" for label, confidence in zip(labels, prediction)}

        # Determine overall toxicity
        overall_toxicity = any(prediction > 0.5)
        result["overall_toxicity"] = "Toxic" if overall_toxicity else "Non-Toxic"

        return {"text_prediction": result}

    except Exception as e:
        return {"error": str(e)}


@app.get("/")
async def read_root():
    return {"message": "Wound and Emotions Detection API with Text Toxicity Prediction is running!"}
