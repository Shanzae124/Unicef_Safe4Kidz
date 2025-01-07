import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ResultScreen = ({ route }) => {
  const { predictionResult } = route.params; // Get the prediction result passed from Home

  return (
    <ScrollView style={styles.container}>
      <View style={styles.resultContainer}>
        <Text style={styles.resultHeading}>
          {predictionResult.text_prediction
            ? 'Text Prediction Result:'
            : 'Image Prediction Result:'}
        </Text>

        {predictionResult.text_prediction ? (
          Object.entries(predictionResult.text_prediction).map(([key, value]) => (
            <Text style={styles.resultText} key={key}>
              {key.replace('_', ' ')}: {value}
            </Text>
          ))
        ) : (
          <>
            {predictionResult.wound_detection?.class && (
              <Text style={styles.resultText}>
                Wound: {predictionResult.wound_detection.class} (
                {predictionResult.wound_detection.confidence.toFixed(2)}%)
              </Text>
            )}
            {predictionResult.emotion_detection?.class && (
              <Text style={styles.resultText}>
                Emotion: {predictionResult.emotion_detection.class} (
                {predictionResult.emotion_detection.confidence.toFixed(2)}%)
              </Text>
            )}
            <Text style={styles.resultText}>
              Final Result: {predictionResult.result}
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3C8CF',
    padding: 20,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    color: '#F5F5F5',
    marginBottom: 5,
  },
});

export default ResultScreen;
