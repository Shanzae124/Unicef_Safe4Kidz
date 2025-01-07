import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

const CustomBox = ({ onPress, children,disabled,style}) => {
  return (
    <TouchableOpacity
    disabled={disabled}
     onPress={onPress}>
      <View style={[styles.container,style]}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    // marginVertical: 10,
   
  },
});

export default CustomBox;
