import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import adminProfile from "../assets/adminProfile.jpg";
import { useTheme } from '../context/ThemeContext';
import { logout } from "../redux/slices/authSlice";

export default function ProfileScreen({ navigation }) {
  const { theme, toggleTheme } = useTheme();
  // const { logout, user } = useAuth();
  const dispatch = useDispatch()
  const {user} = useSelector((state) => state.auth)
  
  const colors = {
    background: theme === 'dark' ? '#121212' : '#F5F7FA',
    cardBackground: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    textPrimary: theme === 'dark' ? '#FFFFFF' : '#333333',
    textSecondary: theme === 'dark' ? '#AAAAAA' : '#666666',
    border: theme === 'dark' ? '#333333' : '#E1E4E8',
    accent: '#4A6FFF',
    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#F44336',
  };

  const profileMenuItems = [
    { 
      icon: 'person', 
      title: 'Personal Info', 
      onPress: () => navigation.navigate('PersonalInfo') 
    },
    { 
      icon: 'security', 
      title: 'Security', 
      onPress: () => navigation.navigate('Security') 
    },
    { 
      icon: 'notifications', 
      title: 'Notifications', 
      onPress: () => navigation.navigate('Notifications') 
    },
    { 
      icon: 'help', 
      title: 'Help & Support', 
      onPress: () => navigation.navigate('Support') 
    },
  ];

  const handleLogout = ()=>{
    dispatch(logout());
    // navigation.navigate('Login');
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
            Settings
          </Text>
        </View>
        
        <View style={[styles.profileCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.profileHeader}>
            <Image 
              source={user?.profilePicture ? { uri: user.profilePicture } : adminProfile}
              defaultSource={adminProfile}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text 
                style={[
                  styles.profileName, 
                  { color: colors.textPrimary }
                ]}
              >
                {user?.name || 'Admin User'}
              </Text>
              <Text 
                style={[
                  styles.profileRole, 
                  { color: colors.textSecondary }
                ]}
              >
                {user?.role || 'System Administrator'}
              </Text>
            </View>
          </View>
        </View>
        
        <View 
          style={[
            styles.settingsSection, 
            { backgroundColor: colors.cardBackground }
          ]}
        >
          <Text 
            style={[
              styles.sectionTitle, 
              { color: colors.textPrimary }
            ]}
          >
            Preferences
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <MaterialIcons 
                name="dark-mode" 
                size={24} 
                color={colors.textPrimary} 
              />
              <Text 
                style={[
                  styles.settingItemText, 
                  { color: colors.textPrimary }
                ]}
              >
                Dark Mode
              </Text>
            </View>
            <Switch
              trackColor={{ 
                false: colors.border, 
                true: colors.accent 
              }}
              thumbColor={theme === 'dark' ? colors.accent : colors.border}
              onValueChange={toggleTheme}
              value={theme === 'dark'}
            />
          </View>
        </View>
        
        <View 
          style={[
            styles.menuSection, 
            { backgroundColor: colors.cardBackground }
          ]}
        >
          <Text 
            style={[
              styles.sectionTitle, 
              { color: colors.textPrimary }
            ]}
          >
            Account Settings
          </Text>
          
          {profileMenuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <MaterialIcons 
                  name={item.icon} 
                  size={24} 
                  color={colors.textPrimary} 
                />
                <Text 
                  style={[
                    styles.menuItemText, 
                    { color: colors.textPrimary }
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.logoutButton, 
            { backgroundColor: colors.danger }
          ]}
          onPress={handleLogout}
        >
          <MaterialIcons 
            name="logout" 
            size={24} 
            color="white" 
          />
          <Text style={styles.logoutButtonText}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    paddingVertical: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileRole: {
    fontSize: 14,
    marginTop: 5,
  },
  settingsSection: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    marginLeft: 15,
    fontSize: 16,
  },
  menuSection: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});