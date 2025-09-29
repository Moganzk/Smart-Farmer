import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Card component with different variants
 * 
 * @param {Object} props
 * @param {string} props.variant - 'flat', 'elevated', 'outlined'
 * @param {string} props.padding - 'none', 'small', 'medium', 'large'
 * @param {boolean} props.onPress - Makes card touchable and adds onPress handler
 */
const Card = ({ 
  children, 
  variant = 'elevated',
  padding = 'medium',
  onPress,
  style,
  ...rest 
}) => {
  const { theme } = useTheme();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'flat':
        return {
          backgroundColor: theme.colors.cardBackground,
          borderRadius: theme.roundness.medium,
          elevation: 0,
          shadowOpacity: 0,
        };
      case 'elevated':
        return {
          backgroundColor: theme.colors.cardBackground,
          borderRadius: theme.roundness.medium,
          elevation: 2,
          shadowOpacity: 0.2,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.cardBackground,
          borderRadius: theme.roundness.medium,
          borderWidth: 1,
          borderColor: theme.colors.border,
          elevation: 0,
          shadowOpacity: 0,
        };
      default:
        return {
          backgroundColor: theme.colors.cardBackground,
          borderRadius: theme.roundness.medium,
          elevation: 2,
          shadowOpacity: 0.2,
        };
    }
  };
  
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return {
          padding: 0,
        };
      case 'small':
        return {
          padding: 8,
        };
      case 'medium':
        return {
          padding: 16,
        };
      case 'large':
        return {
          padding: 24,
        };
      default:
        return {
          padding: 16,
        };
    }
  };
  
  const cardStyles = [
    styles.card,
    getVariantStyles(),
    getPaddingStyles(),
    style,
  ];
  
  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyles} 
        activeOpacity={0.9}
        onPress={onPress}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={cardStyles} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    marginVertical: 8,
    overflow: 'hidden',
  },
});

export default Card;