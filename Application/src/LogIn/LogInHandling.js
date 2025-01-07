import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

const handleLogin = async (email, password, navigation, setIsAuthenticated, setUserData) => {
  if (!password) {
    return 'Password should not be empty.';
  }

  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Check if the email is verified
    if (!user.emailVerified) {
      Alert.alert('Verify Email', 'Please verify your email before logging in.');
      await auth().signOut();
      return 'Email not verified. Please verify your email.';
    }

    const userId = user.uid;

    // Retrieve user data from Firestore
    const userDoc = await firestore().collection('users').doc(userId).get();

    if (userDoc.exists) {
      const userData = userDoc.data();

      // Update authentication state
      setIsAuthenticated(true);
      setUserData(userData);

      console.log('User data:', userData);

      // Navigate to the Home screen
      navigation.navigate('Home', { userData });
    } else if (user.email === 'shanzaeorangzaib08@gmail.com') {
      console.log('User is admin');
      // Handle admin logic if needed
    } else {
      Alert.alert('Error', 'User data not found.');
      return 'User data not found.';
    }
  } catch (e) {
    console.error('Login Error: ', e);
    return handleAuthError(e);
  }
};

// Handle authentication errors
const handleAuthError = (e) => {
  if (e.code === 'auth/invalid-email') {
    return 'Invalid email address.';
  } else if (e.code === 'auth/user-not-found') {
    return 'User not found. Please sign up or try again.';
  } else if (e.code === 'auth/wrong-password') {
    return 'Incorrect password.';
  } else {
    return 'An unexpected error occurred. Kindly check your internet connection.';
  }
};

// Handle forgot password
const handleForgotPassword = async (email) => {
  if (!email) {
    Alert.alert('Error', 'Please enter your email address to reset your password.');
    return;
  }

  try {
    // Check if email is valid and exists
    const signInMethods = await auth().fetchSignInMethodsForEmail(email);

    if (signInMethods.length === 0) {
      Alert.alert('Error', 'No account found with this email address.');
      return;
    }

    // Send the password reset email
    // Note: Firebase does not allow checking email verification status here
    await auth().sendPasswordResetEmail(email);
    Alert.alert(
      'Success',
      'Password reset email sent successfully. Please check your email.'
    );
  } catch (error) {
    if (error.code === 'auth/invalid-email') {
      Alert.alert('Error', 'Invalid email address. Please check and try again.');
    } else if (error.code === 'auth/user-not-found') {
      Alert.alert('Error', 'No account found with this email address.');
    } else if (error.code === 'auth/user-disabled') {
      Alert.alert('Error', 'Your account has been disabled. Please contact support.');
    } else {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
    console.error(error);
  }
};

const resendVerificationEmail = async (email) => {
  try {
    const signInMethods = await auth().fetchSignInMethodsForEmail(email);

    if (signInMethods.length === 0) {
      Alert.alert('Error', 'No account found with this email address.');
      return;
    }

    // Re-authenticate the user or create a temporary sign-in flow
    const userCredential = await auth().signInWithEmailAndPassword(email, 'dummy-password');
    const user = userCredential.user;

    if (!user.emailVerified) {
      await user.sendEmailVerification();
      Alert.alert(
        'Success',
        'Verification email sent successfully. Please check your email.'
      );
    } else {
      Alert.alert('Info', 'Your email is already verified.');
    }

    await auth().signOut(); // Log the user out after sending verification
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'An unexpected error occurred. Please try again.');
  }
};

export { handleLogin, handleForgotPassword };
