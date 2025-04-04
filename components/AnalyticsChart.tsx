import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface AnalyticsChartProps {
  theme: 'light' | 'dark';
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ theme }) => {
  const colors = {
    textPrimary: theme === 'dark' ? '#FFFFFF' : '#333333',
    textSecondary: theme === 'dark' ? '#AAAAAA' : '#666666',
    accent: '#4A6FFF',
    barBackground: theme === 'dark' ? '#333333' : '#EEEEEE',
  };

  // Mock data for attendance chart
  const attendanceData = [
    { day: 'Mon', value: 92 },
    { day: 'Tue', value: 88 },
    { day: 'Wed', value: 95 },
    { day: 'Thu', value: 85 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 92 },
  ];

  const maxValue = 100; // 100%

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Weekly Attendance (%)</Text>
      
      <View style={styles.chartContainer}>
        {attendanceData.map((item, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barLabels}>
              <Text style={[styles.barValue, { color: colors.textPrimary }]}>
                {item.value}%
              </Text>
            </View>
            <View style={[styles.barBackground, { backgroundColor: colors.barBackground }]}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: colors.accent
                  }
                ]} 
              />
            </View>
            <Text style={[styles.barDay, { color: colors.textSecondary }]}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barLabels: {
    alignItems: 'center',
    marginBottom: 8,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  barBackground: {
    width: 20,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 10,
  },
  barDay: {
    marginTop: 8,
    fontSize: 12,
  },
});

export default AnalyticsChart;