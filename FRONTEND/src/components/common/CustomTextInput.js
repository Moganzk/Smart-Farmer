import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const CustomTextInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry,
  rightIcon,
  onRightIconPress,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  autoFocus = false,
  editable = true,
  textContentType,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? theme.colors.error
              : theme.colors.border,
            backgroundColor: theme.colors.inputBackground,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? theme.colors.error : theme.colors.textSecondary}
            style={styles.iconLeft}
          />
        )}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              flex: 1,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          autoFocus={autoFocus}
          editable={editable}
          textContentType={textContentType}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconContainer}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
  },
  iconLeft: {
    marginLeft: 15,
    marginRight: 5,
  },
  input: {
    paddingHorizontal: 10,
    fontSize: 16,
    height: '100%',
  },
  rightIconContainer: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});

export default CustomTextInput;