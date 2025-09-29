import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

/**
 * Button component - Web compatible version
 * This is a simplified version that doesn't rely on ThemeContext
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
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? '#E0E0E0' : '#4CAF50',
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? '#E0E0E0' : '#2196F3',
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? '#9E9E9E' : '#4CAF50',
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
          backgroundColor: disabled ? '#E0E0E0' : '#4CAF50',
          borderWidth: 0,
        };
    }
  };
  
  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          color: '#FFFFFF',
        };
      case 'outline':
        return {
          color: disabled ? '#9E9E9E' : '#4CAF50',
        };
      case 'text':
        return {
          color: disabled ? '#9E9E9E' : '#4CAF50',
        };
      default:
        return {
          color: '#FFFFFF',
        };
    }
  };
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 4,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 8,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
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
              ? '#4CAF50' 
              : '#FFFFFF'
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