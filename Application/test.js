import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

const Test = () => {
  const [imgPath, setImgPath] = useState(null); // Holds selected/captured image path
  const [loading, setLoading] = useState(false); // Loader state
  const [predictionResult, setPredictionResult] = useState(null); // Stores prediction result

  // Handle image picking from gallery or camera
  const handleImagePicker = (type) => {
    const options = {
      width: 300,
      height: 400,
      cropping: true,
    };

    if (type === 'gallery') {
      ImagePicker.openPicker(options)
        .then((image) => {
          setImgPath(image.path);
        })
        .catch((error) => {
          if (error.code === 'E_PICKER_CANCELLED') {
            Alert.alert('Error', 'Image selection cancelled.');
          } else {
            console.error('Error selecting image:', error);
          }
        });
    } else if (type === 'camera') {
      ImagePicker.openCamera(options)
        .then((image) => {
          setImgPath(image.path);
        })
        .catch((error) => {
          if (error.code === 'E_PICKER_CANCELLED') {
            Alert.alert('Error', 'Image capture cancelled.');
          } else {
            console.error('Error capturing image:', error);
          }
        });
    }
  };

  // Handle image prediction via FastAPI
  const handlePrediction = async () => {
    if (!imgPath) {
      Alert.alert('Error', 'Please select or capture an image first.');
      return;
    }

    setLoading(true); // Show loader during API call

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imgPath,
        type: 'image/jpeg',
        name: 'image.jpg',
      });
      console.log("Image path:", imgPath);
      console.log("Form data:", formData);
      
      const response = await fetch('http://192.168.147.46:8000/predict/', { // Replace with your FastAPI URL
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setPredictionResult(result); // Save result for display
        Alert.alert('Prediction Complete', `Result: ${result.result}`);
      } else {
        const error = await response.text();
        console.error('Prediction error:', error);
        Alert.alert('Error', 'Prediction failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during prediction:', error);
      Alert.alert('Error', 'Something went wrong during prediction.');
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Prediction</Text>

      {/* Image Picker Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleImagePicker('gallery')}
      >
        <Text style={styles.buttonText}>Select from Gallery</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleImagePicker('camera')}
      >
        <Text style={styles.buttonText}>Capture Image</Text>
      </TouchableOpacity>

      {/* Show selected image */}
      {imgPath && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imgPath }} style={styles.imagePreview} />
        </View>
      )}

      {/* Predict Button */}
      <TouchableOpacity style={styles.predictButton} onPress={handlePrediction}>
        <Text style={styles.predictButtonText}>Predict</Text>
      </TouchableOpacity>

      {/* Show Loader */}
      {loading && <ActivityIndicator size="large" color="#000" />}

      {/* Show Prediction Result */}
      {predictionResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            Wound: {predictionResult.wound_detection.class} (
            {predictionResult.wound_detection.confidence.toFixed(2)}%)
          </Text>
          <Text style={styles.resultText}>
            Emotion: {predictionResult.emotion_detection.class} (
            {predictionResult.emotion_detection.confidence.toFixed(2)}%)
          </Text>
          <Text style={styles.resultText}>
            Final Result: {predictionResult.result}
          </Text>
        </View>
      )}
    </View>
  );
};

export default Test;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  predictButton: {
    backgroundColor: '#03DAC5',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  predictButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    width: '100%',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
});
