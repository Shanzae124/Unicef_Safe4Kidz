import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LogInForm from './src/LogIn/LogInForm'
import SignUpForm from './src/SignUp/SignUp'
import { NavigationContainer } from '@react-navigation/native'
import { MyStack } from './src/Navigation/StackNavigation'
import Test from './test'
import Home from './src/Dashboard/Home'

const App = () => {
  return (
    <NavigationContainer>
<MyStack/>
    </NavigationContainer>

)
}

export default App

const styles = StyleSheet.create({
  container:
{
  flex:1
}
})