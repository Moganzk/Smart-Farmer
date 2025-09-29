import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const OTPInputView = ({ code, setCode, codeLength = 6 }) => {
  const { theme } = useTheme();
  const inputRefs = React.useRef([]);

  // Prepare an array of empty strings with length = codeLength
  const codeDigitsArray = new Array(codeLength).fill('');

  // Handle text change for each digit
  const handleTextChange = (text, index) => {
    const newCode = code.split('');
    newCode[index] = text;
    setCode(newCode.join(''));
    
    // If user enters a digit, move to the next input field
    if (text && index < codeLength - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key press
  const handleKeyPress = ({ nativeEvent: { key } }, index) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        {codeDigitsArray.map((digit, index) => {
          const isEmpty = !code[index];
          const isCurrentDigit = index === code.length;
          const isDigitFocused = isCurrentDigit;
          
          return (
            <View
              key={index}
              style={[
                styles.inputContainer,
                {
                  borderColor: isEmpty
                    ? theme.colors.border
                    : isDigitFocused
                    ? theme.colors.primary
                    : theme.colors.border,
                  backgroundColor: theme.colors.cardBackground,
                },
              ]}
            >
              <TextInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[styles.input, { color: theme.colors.text }]}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(text) => handleTextChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                value={code[index] || ''}
              />
            </View>
          );
        })}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 20,
  },
  inputContainer: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    fontSize: 24,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
});

export default OTPInputView;