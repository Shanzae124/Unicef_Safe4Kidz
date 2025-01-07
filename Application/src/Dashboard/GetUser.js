import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const getCurrentUserData = async () => {
  try {
    const currentUser = auth().currentUser; // Get the logged-in user

    if (currentUser) {
      const userId = currentUser.uid; // Get user ID
      const userDocument = await firestore().collection('users').doc(userId).get();

      if (userDocument.exists) {
        return userDocument.data(); // Return user data
      } else {
        console.error('No user data found!');
        return null;
      }
    } else {
      console.error('No user is logged in!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error; // Throw error for handling in the calling component
  }
};

export default getCurrentUserData;
