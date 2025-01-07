import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../Backend/FirebaseConfig';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const auth = getAuth();

// In AuthProvider.js
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) {
      const userId = user.uid;
      const userRef = database.ref(`users/${userId}`);
      userRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log('User data fetched:', data);
          setIsAuthenticated(true);
          setUserData(data);
           // Optionally store userData in AsyncStorage
           AsyncStorage.setItem('userData', JSON.stringify(data));
        }
      });
    } else {
      console.log('User not authenticated or email not verified');
      setIsAuthenticated(false);
      setUserData(null);
      AsyncStorage.removeItem('userData');
    }
    
  });

  return () => {
    unsubscribe();
    if (auth.currentUser) {
      database.ref(`users/${auth.currentUser.uid}`).off('value');
    }
  };
}, []);
  
  
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userData,setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
