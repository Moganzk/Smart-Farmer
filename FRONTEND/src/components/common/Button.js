import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Button component with different variants
 * 
 * @param {Object} props
 * @param {string} props.variant - 'primary', 'secondary', 'outline', 'text'
 * @param {string} props.size - 'small', 'medium', 'large'
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.loading - Show loading indicator
 * @param {boolean} props.disabled - Disable the button
 * @param {Function} props.onPress - Button press handler
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  style,
  textStyle,
  ...rest 
}) => {
  const { theme } = useTheme();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? theme.colors.disabledBg : theme.colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? theme.colors.disabledBg : theme.colors.secondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.colors.disabledText : theme.colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        };
      default:
        return {
          backgroundColor: disabled ? theme.colors.disabledBg : theme.colors.primary,
          borderWidth: 0,
        };
    }
  };
  
  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          color: theme.colors.buttonText,
        };
      case 'outline':
        return {
          color: disabled ? theme.colors.disabledText : theme.colors.primary,
        };
      case 'text':
        return {
          color: disabled ? theme.colors.disabledText : theme.colors.primary,
        };
      default:
        return {
          color: theme.colors.buttonText,
        };
    }
  };
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: theme.borderRadius.s,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: theme.borderRadius.m,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: theme.borderRadius.l,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: theme.borderRadius.m,
        };
    }
  };
  
  const getTextSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: 14,
        };
      case 'medium':
        return {
          fontSize: 16,
        };
      case 'large':
        return {
          fontSize: 18,
        };
      default:
        return {
          fontSize: 16,
        };
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.8}
      disabled={disabled || loading}
      {...rest}
    >
      <View style={styles.contentContainer}>
        {leftIcon && !loading && (
          <View style={styles.iconLeft}>
            {leftIcon}
          </View>
        )}
        
        {loading ? (
          <ActivityIndicator 
            color={variant === 'outline' || variant === 'text' 
              ? theme.colors.primary 
              : theme.colors.buttonText
            } 
            size="small" 
          />
        ) : (
          <Text 
            style={[
              styles.text, 
              getTextStyles(), 
              getTextSizeStyles(),
              textStyle
            ]}
          >
            {children}
          </Text>
        )}
        
        {rightIcon && !loading && (
          <View style={styles.iconRight}>
            {rightIcon}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;