import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get('screen');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#bedef8', 
  },
  formContainer: {
    paddingTop: height * 0.04,
    justifyContent: 'center',
    width: '90%',
  },
  errorText: {
    color: 'red',
    fontSize: width * 0.04,
    paddingLeft: width * 0.05,
    marginTop: height * 0.005,
    marginBottom: height * 0.005,
  },
  createContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  createText: {
    fontWeight: 'bold',
    fontSize: width * 0.038,
    
  },
  button: {
    width: width * 0.35,
    justifyContent: 'center',
    margin: height * 0.01,
    backgroundColor: '#115c94',
    borderRadius: width * 0.06,
    height: height * 0.07,
    alignSelf: 'center',
    marginTop: height * 0.06,
    alignItems:'center'
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff', // Dark text for contrast
    fontSize: height * 0.023,
    lineHeight: height * 0.05,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    backgroundColor: '#F1F0E8', 
    borderRadius: width * 0.04,
    height: height * 0.06,
    marginVertical: height * 0.01, 
    alignSelf: 'center',
  },
  passwordInput: {
    flex: 1,
    color: '#000', // Dark text for readability in inputs
    height: '100%',
    textAlign: 'left',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginLeft: width * 0.5,
    color: '#532b88', // Accent color for icons
  },
});
