import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ResultsScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState('Term 1');
  const [selectedClass, setSelectedClass] = useState('XI');
  
  const navigation = useNavigation();
  const { theme } = useTheme();

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

  const exams = [
    { id: '1', name: 'Term 1' },
    { id: '2', name: 'Mid-Term' },
    { id: '3', name: 'Term 2' },
    { id: '4', name: 'Final' },
  ];

  const classes = ['IX', 'X', 'XI', 'XII'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Exam Results</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.filterCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>Select Exam</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examSelector}>
            {exams.map(exam => (
              <TouchableOpacity 
                key={exam.id}
                style={[
                  styles.examOption,
                  selectedExam === exam.name && { backgroundColor: colors.accent }
                ]}
                onPress={() => setSelectedExam(exam.name)}
              >
                <Text style={[
                  styles.examOptionText,
                  { color: selectedExam === exam.name ? '#FFFFFF' : colors.textPrimary }
                ]}>
                  {exam.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={[styles.filterTitle, { color: colors.textPrimary, marginTop: 16 }]}>Select Class</Text>
          <View style={styles.classSelector}>
            {classes.map(cls => (
              <TouchableOpacity 
                key={cls}
                style={[
                  styles.classOption,
                  selectedClass === cls && { backgroundColor: colors.accent }
                ]}
                onPress={() => setSelectedClass(cls)}
              >
                <Text style={[
                  styles.classOptionText,
                  { color: selectedClass === cls ? '#FFFFFF' : colors.textPrimary }
                ]}>
                  {cls}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actionCards}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => alert('This would open the result upload screen')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="cloud-upload-outline" size={28} color={colors.accent} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Upload Results</Text>
            <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
              Upload exam results from Excel or CSV
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => alert('This would open the result entry form')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="create-outline" size={28} color={colors.success} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Enter Results</Text>
            <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
              Manually enter results for students
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => alert('This would open the report card generation screen')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.warning + '20' }]}>
              <MaterialCommunityIcons name="file-certificate-outline" size={28} color={colors.warning} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Generate Report Cards</Text>
            <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
              Generate and download report cards
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => alert('This would open the results analysis screen')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.danger + '20' }]}>
              <Ionicons name="analytics-outline" size={28} color={colors.danger} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Results Analysis</Text>
            <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
              View analytics and performance data
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Student Lookup</Text>
          
          <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search by name or roll number"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: colors.accent }]}
            onPress={() => alert('This would search for the student result')}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  examSelector: {
    marginBottom: 8,
  },
  examOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  examOptionText: {
    fontWeight: '600',
  },
  classSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  classOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  classOptionText: {
    fontWeight: '600',
  },
  actionCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  searchContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
  },
  searchButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});