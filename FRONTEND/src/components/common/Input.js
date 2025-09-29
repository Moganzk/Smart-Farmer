import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Input component with different variants and states
 * 
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.value - Input value
 * @param {Function} props.onChangeText - Text change handler
 * @param {boolean} props.secure - Whether input is for password
 * @param {string} props.error - Error message
 * @param {string} props.helper - Helper text
 * @param {boolean} props.disabled - Disable the input
 * @param {boolean} props.multiline - Whether input is multiline
 * @param {string} props.leftIcon - Left icon component
 * @param {string} props.rightIcon - Right icon component
 */
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  onFocus,
  secure = false,
  error,
  helper,
  disabled = false,
  multiline = false,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  keyboardType,
  autoCapitalize = 'none',
  autoCorrect = false,
  maxLength,
  ...rest
}) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [secureText, setSecureText] = useState(secure);

  const handleFocus = (e) => {
    setFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) onBlur(e);
  };

  const toggleSecure = () => {
    setSecureText(!secureText);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? theme.colors.error
              : focused
              ? theme.colors.primary
              : theme.colors.border,
            backgroundColor: theme.colors.inputBackground,
            borderRadius: theme.borderRadius.s,
          },
          disabled && { backgroundColor: theme.colors.disabledBg },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            { 
              color: disabled ? theme.colors.disabledText : theme.colors.text,
              height: multiline ? 100 : 50, 
            },
            leftIcon && { paddingLeft: 8 },
            rightIcon && { paddingRight: 8 },
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          secureTextEntry={secureText}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          {...rest}
        />

        {secure && (
          <TouchableOpacity style={styles.rightIcon} onPress={toggleSecure}>
            <Text style={{ color: theme.colors.primary }}>
              {secureText ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && !secure && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      <View style={styles.bottomTextContainer}>
        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}

        {!error && helper && (
          <Text style={[styles.helper, { color: theme.colors.placeholder }]}>
            {helper}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  leftIcon: {
    paddingLeft: 16,
  },
  rightIcon: {
    paddingRight: 16,
  },
  bottomTextContainer: {
    minHeight: 20,
    marginTop: 4,
  },
  error: {
    fontSize: 12,
  },
  helper: {
    fontSize: 12,
  },
});

export default Input;