import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { Dropdown } from 'react-native-element-dropdown';
import { useForm, Controller } from 'react-hook-form';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('window');

const SignUpForm = ({ navigation }) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      role: null,
      name: '',
      email: '',
      password: '',
      contact: '',
    },
  });

  const handleSignUp = async (data) => {
    const { role, name, email, password, contact } = data;

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await user.sendEmailVerification();

      await firestore().collection('users').doc(user.uid).set({
        name,
        email,
        contact,
        role,
      });

      Alert.alert('Success', 'Account created successfully! Please verify your email.');
      reset();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during signup:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const data = [
    { label: 'Parent', value: 'parent' },
    { label: 'Myself', value: 'myself' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar backgroundColor="#f4effa" />
      <CustomHeader
        title="SAFE 4 KIDZ"
        titleStyle={{
          flexShrink: 1,
          fontSize: height * 0.05,
          paddingTop: height * 0.2,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Controller
            control={control}
            name="role"
            rules={{ required: 'Role is required!' }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <Dropdown
                  data={data}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Role"
                  value={value}
                  onChange={(item) => onChange(item.value)}
                  style={styles.text}
                  placeholderStyle={{ color: '#115c94' }}
                  showsVerticalScrollIndicator={true}
                  itemTextStyle={{ color: '#999' }}
                  selectedTextStyle={{ color: '#115c94' }}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />

          <Controller
            control={control}
            name="name"
            rules={{
              required: 'Name is required!',
              minLength: { value: 3, message: 'Name must be at least 3 characters long!' },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Enter your name"
                  style={styles.text}
                  placeholderTextColor="#115c94"
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required!',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email!' },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Enter Your Email"
                  style={styles.text}
                  placeholderTextColor="#115c94"
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required!',
              minLength: { value: 6, message: 'Password must be at least 6 characters long!' },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Password"
                  style={styles.text}
                  placeholderTextColor="#115c94"
                  secureTextEntry={true}
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />

          <Controller
            control={control}
            name="contact"
            rules={{
              required: 'Contact number is required!',
              pattern: { value: /^[0-9-\s]+$/, message: 'Enter a valid contact number!' },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Contact No"
                  style={styles.text}
                  placeholderTextColor="#115c94"
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit(handleSignUp)}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.createContainer}>
            <Text style={[styles.createText, { color: '#56a2de' }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={[styles.createText, { color: '#115c94' }]}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bedef8',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  formContainer: {
    paddingTop: height * 0.04,
    justifyContent: 'center',
    width: '90%',
  },
  text: {
    alignSelf: 'center',
    color: '#115c94',
    fontSize: 16,
    marginVertical: height * 0.01,
    width: '90%',
    paddingLeft: 18,
    backgroundColor: '#F1F0E8',
    borderRadius: width * 0.04,
    height: height * 0.06,
  },
  button: {
    width: width * 0.3,
    justifyContent: 'center',
    padding: 12,
    margin: height * 0.01,
    backgroundColor: '#115c94',
    borderRadius: width * 0.1,
    height: height * 0.09,
    alignSelf: 'center',
    marginTop: height * 0.06,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: height * 0.023,
    lineHeight: height * 0.05,
  },
  createContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  createText: {
    fontWeight: '900',
    fontSize: width * 0.037,
  },
  errorText: {
    color: 'red',
    alignSelf: 'center',
    marginTop: 4,
  },
});

export default SignUpForm;
