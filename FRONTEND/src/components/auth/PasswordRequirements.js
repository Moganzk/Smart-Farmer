import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const PasswordRequirements = ({ password }) => {
  const { theme } = useTheme();
  
  const requirements = [
    {
      id: 'length',
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8,
    },
    {
      id: 'letter',
      label: 'Contains a letter (a-z or A-Z)',
      test: (pwd) => /[A-Za-z]/.test(pwd),
    },
    {
      id: 'number',
      label: 'Contains a number (0-9)',
      test: (pwd) => /[0-9]/.test(pwd),
    },
    {
      id: 'special',
      label: 'Contains a special character (@$!%*#?&)',
      test: (pwd) => /[@$!%*#?&]/.test(pwd),
    },
  ];

  if (!password) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
        Password Requirements:
      </Text>
      {requirements.map((req) => {
        const isMet = req.test(password);
        return (
          <View key={req.id} style={styles.requirement}>
            <Ionicons
              name={isMet ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={isMet ? theme.colors.success : theme.colors.error}
              style={styles.icon}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isMet ? theme.colors.success : theme.colors.textSecondary,
                },
              ]}
            >
              {req.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 12,
  },
});

export default PasswordRequirements;
