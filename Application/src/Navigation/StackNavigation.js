import { createStackNavigator } from '@react-navigation/stack';
import LogInForm from '../LogIn/LogInForm';
import SignUpForm from '../SignUp/SignUp';
import Home from '../Dashboard/Home';
import Result from '../Result';
import ResultScreen from '../Result';

const Stack = createStackNavigator();

export function MyStack() {
  return (
    <Stack.Navigator
    screenOptions={{
        headerShown:false
    }}
    >
      <Stack.Screen name="Login" component={LogInForm} />
      <Stack.Screen name="Signup" component={SignUpForm} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
}