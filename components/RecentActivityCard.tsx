import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
}

interface RecentActivityCardProps {
  activity: Activity;
  theme: string;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activity, theme }) => {
  const colors = {
    textPrimary: theme === 'dark' ? '#FFFFFF' : '#333333',
    textSecondary: theme === 'dark' ? '#AAAAAA' : '#666666',
    borderColor: theme === 'dark' ? '#333333' : '#EEEEEE',
  };

  // Define icon type based on activity type
  const getIconDetails = (type: string) => {
    switch (type) {
      case 'admission':
        return { name: 'person-add', color: '#4CAF50' };
      case 'payment':
        return { name: 'cash', color: '#FFC107' };
      case 'result':
        return { name: 'ribbon', color: '#9C27B0' };
      case 'attendance':
        return { name: 'calendar', color: '#F44336' };
      default:
        return { name: 'information-circle', color: '#4A6FFF' };
    }
  };

  const iconDetails = getIconDetails(activity.type);

  return (
    <View style={[styles.container, { borderBottomColor: colors.borderColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconDetails.color + '20' }]}>
        <Ionicons name={iconDetails.name} size={22} color={iconDetails.color} />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{activity.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {activity.description}
        </Text>
      </View>
      
      <Text style={[styles.time, { color: colors.textSecondary }]}>{activity.time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
  },
  time: {
    fontSize: 12,
    marginLeft: 8,
  },
});

export default RecentActivityCard;