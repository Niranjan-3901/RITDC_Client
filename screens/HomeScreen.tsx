import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnalyticsChart from '../components/AnalyticsChart';
import DashboardCard from '../components/DashboardCard';
import RecentActivityCard from '../components/RecentActivityCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getStats } from '../services/apiService';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    newAdmissions: 0,
    feesCollected: 0,
    pendingFees: 0,
    attendanceToday: 0,
    recentActivities: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from your API
        const response = await getStats();
        setStats(response);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const colors = {
    textPrimary: theme === 'dark' ? '#FFFFFF' : '#333333',
    background: theme === 'dark' ? '#121212' : '#F5F7FA',
    cardBackground: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    accent: '#4A6FFF',
    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#F44336',
  };

  const modules = [
    { id: 1, title: 'Students', icon: 'school', screen: 'Students', color: '#4A6FFF', iconType: 'MaterialIcons' },
    { id: 2, title: 'Admissions', icon: 'person-add', screen: 'Admissions', color: '#4CAF50', iconType: 'Ionicons' },
    { id: 3, title: 'Fees', icon: 'attach-money', screen: 'Fees', color: '#FFC107', iconType: 'MaterialIcons' },
    { id: 4, title: 'Attendance', icon: 'user-check', screen: 'Attendance', color: '#F44336', iconType: 'FontAwesome5' },
    { id: 5, title: 'Results', icon: 'grading', screen: 'Results', color: '#9C27B0', iconType: 'MaterialIcons' },
    { id: 6, title: 'Reports', icon: 'bar-chart', screen: 'Reports', color: '#FF5722', iconType: 'Ionicons' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.nameText, { color: colors.textPrimary }]}>
            {user?.name || 'Admin'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: colors.cardBackground }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <DashboardCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon="people" 
          iconColor="#4A6FFF"
          theme={theme}
        />
        <DashboardCard 
          title="New Admissions" 
          value={stats.newAdmissions} 
          icon="person-add" 
          iconColor="#4CAF50"
          theme={theme}
        />
        <DashboardCard 
          title="Fees Collected" 
          value={`₹${stats.feesCollected.toLocaleString()}`} 
          icon="cash" 
          iconColor="#FFC107"
          theme={theme}
        />
        <DashboardCard 
          title="Pending Fees" 
          value={`₹${stats.pendingFees.toLocaleString()}`} 
          icon="time" 
          iconColor="#F44336"
          theme={theme}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Access</Text>
      <View style={styles.modulesContainer}>
        {modules.map((module) => (
          <TouchableOpacity 
            key={module.id} 
            style={[styles.moduleCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => navigation.navigate(module.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: module.color + '20' }]}>
              {module.iconType === 'Ionicons' && <Ionicons name={module.icon} size={24} color={module.color} />}
              {module.iconType === 'MaterialIcons' && <MaterialIcons name={module.icon} size={24} color={module.color} />}
              {module.iconType === 'FontAwesome5' && <FontAwesome5 name={module.icon} size={22} color={module.color} />}
            </View>
            <Text style={[styles.moduleTitle, { color: colors.textPrimary }]}>{module.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartSection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Attendance Overview</Text>
        <View style={[styles.chartContainer, { backgroundColor: colors.cardBackground }]}>
          <AnalyticsChart theme={theme} />
        </View>
      </View>

      <View style={styles.activitySection}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activities</Text>
        <View style={[styles.activityContainer, { backgroundColor: colors.cardBackground }]}>
          {stats.recentActivities.map((activity, index) => (
            <RecentActivityCard key={index} activity={activity} theme={theme} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moduleCard: {
    width: '30%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  chartSection: {
    marginBottom: 20,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activitySection: {
    marginBottom: 20,
  },
  activityContainer: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});