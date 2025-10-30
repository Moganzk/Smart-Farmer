import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Avatar component with different variants
 * 
 * @param {Object} props
 * @param {string} props.source - Image source
 * @param {string} props.label - Initial letters (fallback if no image)
 * @param {string} props.size - 'small', 'medium', 'large'
 * @param {boolean} props.onPress - Makes avatar touchable and adds onPress handler
 */
const Avatar = ({ 
  source, 
  label,
  size = 'medium',
  onPress,
  style,
  ...rest 
}) => {
  const { theme } = useTheme();
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 32,
          height: 32,
          borderRadius: 16,
        };
      case 'medium':
        return {
          width: 48,
          height: 48,
          borderRadius: 24,
        };
      case 'large':
        return {
          width: 64,
          height: 64,
          borderRadius: 32,
        };
      case 'xlarge':
        return {
          width: 96,
          height: 96,
          borderRadius: 48,
        };
      default:
        return {
          width: 48,
          height: 48,
          borderRadius: 24,
        };
    }
  };
  
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: 12 };
      case 'medium':
        return { fontSize: 18 };
      case 'large':
        return { fontSize: 24 };
      case 'xlarge':
        return { fontSize: 36 };
      default:
        return { fontSize: 18 };
    }
  };
  
  const renderContent = () => {
    if (source) {
      return (
        <Image 
          source={typeof source === 'string' ? { uri: source } : source}
          style={[styles.image]} 
        />
      );
    }
    
    return (
      <Text style={[styles.label, getTextSize(), { color: '#FFFFFF' }]}>
        {label ? label.substring(0, 2).toUpperCase() : '?'}
      </Text>
    );
  };
  
  const avatarStyles = [
    styles.avatar,
    getSizeStyles(),
    !source && { backgroundColor: theme.colors.primary },
    style,
  ];
  
  if (onPress) {
    return (
      <TouchableOpacity 
        style={avatarStyles} 
        activeOpacity={0.8}
        onPress={onPress}
        {...rest}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={avatarStyles} {...rest}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontWeight: '600',
  },
});

export default Avatar;