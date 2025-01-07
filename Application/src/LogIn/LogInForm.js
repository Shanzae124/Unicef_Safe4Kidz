import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { styles } from '../../components/Style';
import { handleLogin, handleForgotPassword } from './LogInHandling';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Material Icons

const { width, height } = Dimensions.get('window');

const LogInForm = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State to toggle password visibility
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleSignIn = async () => {
    const result = await handleLogin(
      email,
      password,
      navigation,
      setIsAuthenticated,
      setUserData
    );

    if (typeof result === 'string') {
      Alert.alert('Login Failed', result);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('Signup');
  };

  const handleForgotPasswordPress = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address to reset your password.');
      return;
    }

    const result = await handleForgotPassword(email);

    if (result === 'Password reset email sent.') {
      Alert.alert('Success', result);
    } else {
      Alert.alert('Error', result);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#B3C8CF" />
      <View style={{
             alignItems:'center',
        paddingTop: height * 0.2,
      }}>
      <Image
      source={require('../../assets/Img/AppIcon.png')}
      style={{
        height:100,
        width:100
      }}
      resizeMode='contain'
      />
      <CustomHeader
        title="SAFE 4 KIDZ"
        titleStyle={{
          // flexShrink: 1,
          fontSize: height * 0.05,
          
        }}
      />
      </View>
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.text}
          placeholderTextColor="#115c94"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
            style={[styles.text, styles.passwordInput]}
            placeholderTextColor="#115c94"
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Icon
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={24}
              color="#115c94"
              style={{paddingRight:10}}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.createContainer}>
          <Text style={[styles.createText, { color: '#56a2de' }]}>
            Don't Have Account?{' '}
          </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={[styles.createText, { color: '#115c94' }]}>
              Create an Account
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSignIn} style={styles.button}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForgotPasswordPress}>
          <Text
            style={[styles.createText, { color: '#115c94', textAlign: 'center' }]}
          >
            Forgot Password
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LogInForm;
