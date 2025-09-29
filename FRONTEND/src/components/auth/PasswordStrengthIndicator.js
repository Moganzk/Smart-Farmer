import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const PasswordStrengthIndicator = ({ password }) => {
  const { theme } = useTheme();
  
  // Calculate password strength
  const calculateStrength = () => {
    if (!password) return 0;
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character type checks
    if (/[a-z]/.test(password)) score += 1; // lowercase
    if (/[A-Z]/.test(password)) score += 1; // uppercase
    if (/[0-9]/.test(password)) score += 1; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score += 1; // special chars
    
    // Return score as percentage (max 6 points)
    return Math.min(Math.floor((score / 6) * 100), 100);
  };

  const getStrengthLevel = () => {
    const strength = calculateStrength();
    
    if (strength < 30) return 'weak';
    if (strength < 70) return 'medium';
    return 'strong';
  };
  
  const getStrengthColor = () => {
    const level = getStrengthLevel();
    
    switch (level) {
      case 'weak':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'strong':
        return theme.colors.success;
      default:
        return theme.colors.border;
    }
  };

  const strength = calculateStrength();
  
  return (
    <View style={styles.container}>
      <View style={styles.trackContainer}>
        <View 
          style={[
            styles.strengthIndicator, 
            { 
              width: `${strength}%`,
              backgroundColor: getStrengthColor()
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  trackContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthIndicator: {
    height: '100%',
  },
});

export default PasswordStrengthIndicator;