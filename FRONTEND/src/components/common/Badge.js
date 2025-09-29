import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Badge component for displaying notifications or status
 * 
 * @param {Object} props
 * @param {string|number} props.content - Content to display
 * @param {string} props.variant - 'standard', 'dot'
 * @param {string} props.color - 'primary', 'secondary', 'error', 'success', 'warning', 'info'
 * @param {node} props.children - Child element to attach badge to
 * @param {boolean} props.showZero - Whether to display when count is zero
 * @param {boolean} props.standalone - Whether badge should be rendered without children
 */
const Badge = ({ 
  content, 
  variant = 'standard',
  color = 'primary',
  children,
  showZero = false,
  standalone = false,
  style,
  ...rest 
}) => {
  const { theme } = useTheme();
  
  const getColorStyles = () => {
    switch (color) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'error':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.primary;
    }
  };
  
  // Don't render if content is 0 and showZero is false
  if (content === 0 && !showZero && !variant === 'dot') {
    return children || null;
  }
  
  const renderBadge = () => {
    const backgroundColor = getColorStyles();
    
    if (variant === 'dot') {
      return (
        <View 
          style={[
            styles.dot,
            { backgroundColor },
            style
          ]}
          {...rest}
        />
      );
    }
    
    const isSmall = typeof content === 'number' && content < 10;
    
    return (
      <View 
        style={[
          styles.badge,
          isSmall && styles.badgeSmall,
          { backgroundColor },
          style
        ]}
        {...rest}
      >
        <Text style={styles.text}>
          {typeof content === 'number' && content > 99 ? '99+' : content}
        </Text>
      </View>
    );
  };
  
  if (standalone) {
    return renderBadge();
  }
  
  return (
    <View style={styles.container}>
      {children}
      <View style={styles.badgeContainer}>
        {renderBadge()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Badge;