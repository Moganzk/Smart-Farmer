import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Typography component for consistent text styling
 * 
 * @param {Object} props
 * @param {string} props.variant - 'h1', 'h2', 'h3', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'overline'
 * @param {string} props.color - text color
 * @param {string} props.align - 'left', 'center', 'right', 'justify'
 * @param {boolean} props.bold - make text bold
 */
const Typography = ({ 
  children, 
  variant = 'body1', 
  color,
  align = 'left',
  bold = false,
  style,
  ...rest 
}) => {
  const { theme } = useTheme();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: 28,
          lineHeight: 34,
          fontWeight: '700',
          letterSpacing: 0.25,
        };
      case 'h2':
        return {
          fontSize: 24,
          lineHeight: 30,
          fontWeight: '700',
          letterSpacing: 0,
        };
      case 'h3':
        return {
          fontSize: 20,
          lineHeight: 26,
          fontWeight: '600',
          letterSpacing: 0.15,
        };
      case 'subtitle1':
        return {
          fontSize: 18,
          lineHeight: 24,
          fontWeight: '600',
          letterSpacing: 0.15,
        };
      case 'subtitle2':
        return {
          fontSize: 16,
          lineHeight: 22,
          fontWeight: '500',
          letterSpacing: 0.1,
        };
      case 'body1':
        return {
          fontSize: 16,
          lineHeight: 22,
          fontWeight: '400',
          letterSpacing: 0.5,
        };
      case 'body2':
        return {
          fontSize: 14,
          lineHeight: 20,
          fontWeight: '400',
          letterSpacing: 0.25,
        };
      case 'caption':
        return {
          fontSize: 12,
          lineHeight: 16,
          fontWeight: '400',
          letterSpacing: 0.4,
        };
      case 'overline':
        return {
          fontSize: 10,
          lineHeight: 14,
          fontWeight: '500',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        };
      default:
        return {
          fontSize: 16,
          lineHeight: 22,
          fontWeight: '400',
          letterSpacing: 0.5,
        };
    }
  };
  
  const getColorStyles = () => {
    if (color) {
      return { color };
    }
    
    return { color: theme.colors.text };
  };
  
  const getAlignStyles = () => {
    return { textAlign: align };
  };
  
  const getBoldStyles = () => {
    if (bold) {
      return { fontWeight: '700' };
    }
    
    return {};
  };
  
  return (
    <Text 
      style={[
        getVariantStyles(),
        getColorStyles(),
        getAlignStyles(),
        getBoldStyles(),
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Typography;