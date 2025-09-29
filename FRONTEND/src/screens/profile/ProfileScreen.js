import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  // Mock user data if needed
  const userData = user || {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    profileImage: null,
    location: 'Nairobi, Kenya',
    joinedDate: '2023-06-15',
    farmSize: '5 acres',
    preferredCrops: ['Maize', 'Beans', 'Tomatoes'],
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          My Profile
        </Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('ProfileEdit')}
        >
          <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {userData.profileImage ? (
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View
              style={[
                styles.profileImagePlaceholder,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Text
                style={[
                  styles.profileImagePlaceholderText,
                  { color: theme.colors.primary },
                ]}
              >
                {userData.fullName
                  .split(' ')
                  .map((name) => name[0])
                  .join('')}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {userData.fullName}
        </Text>
        <Text style={[styles.userLocation, { color: theme.colors.textSecondary }]}>
          {userData.location}
        </Text>
      </View>

      <View
        style={[
          styles.infoCard,
          { backgroundColor: theme.colors.cardBackground },
        ]}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Email
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {userData.email}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="call-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Phone Number
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {userData.phone}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Joined
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {new Date(userData.joinedDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.infoCard,
          { backgroundColor: theme.colors.cardBackground },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Farm Information
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="resize-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Farm Size
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {userData.farmSize}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="leaf-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Preferred Crops
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {userData.preferredCrops.join(', ')}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.logoutButton,
          { backgroundColor: theme.colors.errorLight },
        ]}
        onPress={() => {/* Add logout functionality */}}
      >
        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
        <Text style={[styles.logoutText, { color: theme.colors.error }]}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 5,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userLocation: {
    fontSize: 16,
  },
  infoCard: {
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ProfileScreen;