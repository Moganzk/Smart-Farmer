import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const CustomButton = ({
  title,
  onPress,
  type = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.disabledButton;
    
    switch (type) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
        return 'transparent';
      case 'text':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textSecondary;
    
    switch (type) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'text':
        return theme.colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.disabledButton;
    
    switch (type) {
      case 'outline':
        return theme.colors.primary;
      default:
        return 'transparent';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: type === 'outline' ? 1 : 0,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                marginLeft: icon ? 10 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomButton;