import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomBox from '../../components/CustomBox';
import CustomHeader from '../../components/CustomHeader';
import getCurrentUserData from './GetUser';
import {useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

const {height, width} = Dimensions.get('screen');

const Home = ({navigation}) => {
  const [imgPath, setImgPath] = useState(null);
  const [imageSize, setImageSize] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(null);
  const [showTextInput, setShowTextInput] = useState(null);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [isTextInputVisible, setIsTextInputVisible] = useState(false);
  const [userData, setUserData] = useState(null);

  const toggleImagePicker = () =>
    setIsImagePickerVisible(!isImagePickerVisible);

  const handleLogout = async () => {
    try {
      await auth().signOut(); // Firebase sign-out
      Alert.alert('Success', 'You have successfully logged out.');
      navigation.replace('Login'); // Redirect to login screen
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };
  const toggleTextInput = () => setIsTextInputVisible(!isTextInputVisible);
  
  const toggleProfileVisibility = () => setIsProfileVisible(!isProfileVisible);

  const handleImagePicker = type => {
    const options = {
      width: 300,
      height: 400,
      cropping: true, // Allows cropping
    };

    if (type === 'gallery') {
      ImagePicker.openPicker(options)
        .then(image => {
          setImgPath(image.path);
          setImageSize({width: image.width, height: image.height});
          console.log('Image Selected:', image.width, image.height);
        })
        .catch(error => {
          if (error.code === 'E_PICKER_CANCELLED') {
            Alert.alert('Error', 'You cancelled the image selection.');
          } else {
            console.error('Error selecting image:', error);
          }
        });
    } else if (type === 'camera') {
      ImagePicker.openCamera(options)
        .then(image => {
          setImgPath(image.path);
          setImageSize({width: image.width, height: image.height});
          console.log('Image Captured:', image.width, image.height);
        })
        .catch(error => {
          if (error.code === 'E_PICKER_CANCELLED') {
            Alert.alert('Error', 'You cancelled the image capture.');
          } else {
            console.error('Error capturing image:', error);
          }
        });
    }
  };
  const resetAll = () => {
    setImgPath(null);
    setImageSize(null);
    setTextInput('');
    setPredictionResult(null);
    setIsImagePickerVisible(false);
    setIsTextInputVisible(false);
  };
  const handlePrediction = async () => {
    const user = auth().currentUser; // Get the currently logged-in user
    if (!user) {
      Alert.alert('Error', 'No authorized user found. Please log in.');
      return;
    }
  
    const uid = user.uid; // Get the unique ID of the logged-in user
  
    if (!imgPath && !textInput) {
      Alert.alert('Error', 'Please select an image or enter text first.');
      return;
    }
  
    setLoading(true); // Show loader while making API call
  
    try {
      let predictionData = {}; // Object to hold the prediction result
  
      if (imgPath) {
        // Image Prediction API Call
        let formData = new FormData();
        formData.append('file', {
          uri: imgPath,
          type: 'image/jpeg',
          name: 'image.jpg',
        });
  
        const imageResponse = await fetch(
          'http://192.168.147.46:8000/predict_image/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          },
        );
  
        if (imageResponse.ok) {
          const result = await imageResponse.json();
          predictionData = result;
          setPredictionResult(result);
  
          // // Upload image to Firebase Storage
          // const imageRef = storage().ref(
          //   `/users/${uid}/predictions/images/${Date.now()}.jpg`,
          // );
          // await imageRef.putFile(imgPath); // Upload image
          // const downloadURL = await imageRef.getDownloadURL(); // Get download URL
  
          // // Save result and image URL to Firestore
          await firestore()
            .collection('users')
            .doc(uid)
            .collection('predictions')
            .add({
              type: 'image',
              // imageURL: downloadURL,
              result: result,
              timestamp: firestore.FieldValue.serverTimestamp(),
            });
  
            
        } else {
          const error = await imageResponse.text();
          console.error('Error in image prediction:', error);
          Alert.alert('Error', 'Image prediction failed. Please try again.');
        }
      } else if (textInput) {
        // Text Prediction API Call
        const textResponse = await fetch(
          'http://192.168.147.46:8000/predict_text/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({input_text: textInput}),
          },
        );
  
        if (textResponse.ok) {
          const result = await textResponse.json();
          predictionData = result;
          setPredictionResult(result);
          // Save text result to Firestore
          await firestore()
            .collection('users')
            .doc(uid)
            .collection('predictions')
            .add({
              type: 'text',
              text: textInput,
              result: result.text_prediction,
              timestamp: firestore.FieldValue.serverTimestamp(),
            });
  
      
        } else {
          const error = await textResponse.text();
          console.error('Error in text prediction:', error);
          Alert.alert('Error', 'Text prediction failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong while predicting.');
    } finally {
      setLoading(false); // Hide loader after API call
    }
  };
  

  useEffect(() => {
    // Fetch user data when the component mounts
    const fetchUserData = async () => {
      try {
        const data = await getCurrentUserData(); // Call the function
        setUserData(data); // Update state with fetched data
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUserData();
  }, []);

  // if (loading) {
  //   return (
  //     <View style={styles.loaderContainer}>
  //       <ActivityIndicator size="large" color="#0000ff" />
  //       <Text>Loading user data...</Text>
  //     </View>
  //   );
  // }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}}>
      <StatusBar backgroundColor="#9b72cf" barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
          <View style={{flexDirection: 'row'}}>
            {/* {dummyUser?.img && (
              <Image
                source={{uri: dummyUser.img}}
                style={{
                  width: 70,
                  height: 70,
                  marginRight: 10,
                  borderRadius: 50,
                }}
                resizeMode="contain"
              />
            )} */}
            <Text style={styles.welcomeText}>
              Welcome {'\n'}
              {userData?.name || 'User'}
            </Text>
          </View>
          <Icon
            name={'account-edit'}
            size={30}
            style={{marginTop: width * 0.07, marginLeft: 50}}
            onPress={() => navigation.navigate('EditProfile')}
          />
          
        </View>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={styles.button}
            onPress={toggleProfileVisibility}>
            <Text style={styles.buttonText}>
              {isProfileVisible ? 'Hide Profile' : 'View Profile'}
            </Text>
          </TouchableOpacity>
        
        </View>
        {isProfileVisible &&
          (userData ? (
            <View style={styles.userProfile}>
              <Text>Email: {userData.email}</Text>
              <Text>Phone: {userData.contact}</Text>
              <Text>Role:{userData.role}</Text>
            </View>
          ) : (
            <Text>No user data available. Please log in.</Text>
          ))}
      </View>

      <View style={styles.subContainer}>
        {/* If no image is selected, show the upload button */}
        {!imgPath ? (
          <>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={toggleImagePicker}>
              <Text style={styles.uploadButtonText}>
                {isImagePickerVisible ? 'Hide Image Picker' : 'Upload Image'}
              </Text>
            </TouchableOpacity>

            {isImagePickerVisible && (
              <View>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleImagePicker('gallery')}>
                  <Text style={styles.uploadButtonText}>
                    Select from Gallery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleImagePicker('camera')}>
                  <Text style={styles.uploadButtonText}>
                    Capture with Camera
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Show the selected image */}
            <View style={styles.imagePreviewContainer}>
              <Image source={{uri: imgPath}} style={styles.imagePreview} />
              <Text style={styles.imageSizeText}>
                Image Size: {imageSize?.width} x {imageSize?.height}
              </Text>
            </View>

            {/* Button to allow changing the image */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => {
                setImgPath(null); // Clear the current image
                toggleImagePicker(); // Show the image picker again
              }}>
              <Text style={styles.uploadButtonText}>Change Image</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Toggle for Text Input */}
        <TouchableOpacity style={styles.uploadButton} onPress={toggleTextInput}>
          <Text style={styles.uploadButtonText}>
            {isTextInputVisible ? 'Hide Text Input' : 'Enter Text'}
          </Text>
        </TouchableOpacity>

        {isTextInputVisible && (
          <TextInput
            style={styles.textInput}
            placeholder="Type here..."
            placeholderTextColor="#aaa"
            value={textInput}
            onChangeText={setTextInput}
          />
        )}

        <TouchableOpacity
          style={styles.predictButton}
          onPress={handlePrediction}>
          <Text style={styles.predictButtonText}>Detect</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#532b88" />}

        {predictionResult && (
  <View style={styles.resultContainer}>
    <TouchableOpacity onPress={resetAll} style={styles.refreshButton}>
            <Icon name="refresh" size={30} color="white" />
          </TouchableOpacity>
    {/* Render results based on image or text prediction */}
    {predictionResult.text_prediction ? (
      <>
        <Text style={styles.resultHeading}>Text Prediction Result:</Text>
        {Object.entries(predictionResult.text_prediction).map(
          ([key, value]) => (
            <Text style={styles.resultText} key={key}>
              {key.replace('_', ' ')}: {value}
            </Text>
          )
        )}
      </>
    ) : predictionResult.wound_detection && predictionResult.emotion_detection ? (
      <>
        <Text style={styles.resultHeading}>Image Prediction Result:</Text>
        {predictionResult.wound_detection?.class && (
          <Text style={styles.resultText}>
            Wound: {predictionResult.wound_detection.class} ({predictionResult.wound_detection.confidence.toFixed(2)}%)
          </Text>
        )}
        {predictionResult.emotion_detection?.class && (
          <Text style={styles.resultText}>
            Emotion: {predictionResult.emotion_detection.class} ({predictionResult.emotion_detection.confidence.toFixed(2)}%)
          </Text>
        )}
        <Text style={styles.resultText}>
          Final Result: {predictionResult.result}
        </Text>
      </>
    ) : (
      <Text style={styles.resultText}>No valid prediction result.</Text>
    )}
  </View>
)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3C8CF',
  },
  headerContainer: {
    width: '100%',
    paddingTop: height * 0.03,
    paddingBottom: height * 0.02,
    backgroundColor: '#5C6D77',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 70,
    height: 70,
    marginRight: 15,
    borderRadius: 50,
  },
  welcomeText: {
    color: '#F5F5F5',
    fontWeight: 'bold',
    fontSize: 18,
  },
  subContainer: {
    padding: 20,
    marginTop: 10,
  },
  uploadButton: {
    width: '70%',
    height: 45,
    backgroundColor: '#5C6D77',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    alignSelf: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#F5F5F5',
  },
  imagePreviewContainer: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  imageSizeText: {
    color: '#F5F5F5',
    fontSize: 12,
    marginTop: 5,
  },
  predictButton: {
    width: '50%',
    height: 45,
    backgroundColor: '#89A8B2',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  predictButtonText: {
    fontSize: 16,
    color: '#E5E1DA',
  },
  button: {
    width: width * 0.34,
    justifyContent: 'center',
    backgroundColor: '#89A8B2',
    borderRadius: width * 0.035,
    height: width * 0.11,
    marginLeft: width * 0.1,
    marginBottom: width * 0.03,
    marginTop: width * 0.03,
  },
  buttonText: {
    textAlign: 'center',
    color: '#FFF',
    fontSize: 16,
  },

  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#F5F5F5',
    marginBottom: 5,
  },
  userProfile:{
    marginLeft:width*0.1
  },
  logoutButton: {
    backgroundColor: '#E5E1DA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#5C6D77',
    fontWeight: 'bold',
  },
});

export default Home;
