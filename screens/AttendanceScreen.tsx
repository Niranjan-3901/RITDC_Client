import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  attendanceStatus?: 'present' | 'absent' | 'late' | '';
}

interface AttendanceRecord {
  date: string;
  class: string;
  section: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  students: Student[];
}

export default function AttendanceScreen() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('XI');
  const [selectedSection, setSelectedSection] = useState('A');
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

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

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, selectedClass, selectedSection]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // In a real app, you'd call the API
      // const response = await getAttendance(
      //   selectedDate.toISOString().split('T')[0],
      //   `${selectedClass}-${selectedSection}`
      // );
      
      // Mock data for demo purposes
      setTimeout(() => {
        const mockStudents = [
          { id: '1', name: 'Rahul Sharma', rollNumber: '2023001', class: selectedClass, section: selectedSection, attendanceStatus: 'present' },
          { id: '2', name: 'Priya Patel', rollNumber: '2023002', class: selectedClass, section: selectedSection, attendanceStatus: 'present' },
          { id: '3', name: 'Amit Kumar', rollNumber: '2023003', class: selectedClass, section: selectedSection, attendanceStatus: 'absent' },
          { id: '4', name: 'Sneha Gupta', rollNumber: '2023004', class: selectedClass, section: selectedSection, attendanceStatus: 'late' },
          { id: '5', name: 'Vikram Singh', rollNumber: '2023005', class: selectedClass, section: selectedSection, attendanceStatus: 'present' },
          { id: '6', name: 'Nisha Reddy', rollNumber: '2023006', class: selectedClass, section: selectedSection, attendanceStatus: 'present' },
          { id: '7', name: 'Raj Malhotra', rollNumber: '2023007', class: selectedClass, section: selectedSection, attendanceStatus: 'absent' },
          { id: '8', name: 'Ananya Verma', rollNumber: '2023008', class: selectedClass, section: selectedSection, attendanceStatus: 'present' },
        ];
        
        const presentCount = mockStudents.filter(s => s.attendanceStatus === 'present').length;
        const absentCount = mockStudents.filter(s => s.attendanceStatus === 'absent').length;
        const lateCount = mockStudents.filter(s => s.attendanceStatus === 'late').length;
        
        const mockRecord = {
          date: selectedDate.toISOString().split('T')[0],
          class: selectedClass,
          section: selectedSection,
          totalStudents: mockStudents.length,
          presentCount,
          absentCount,
          lateCount,
          students: mockStudents
        };
        
        setAttendanceRecord(mockRecord);
        setStudents(mockStudents);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setCalendarVisible(false);
  };

  const handleMarkAttendance = () => {
    setShowMarkModal(true);
  };

  const updateStudentAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return { ...student, attendanceStatus: status };
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      
      // In a real app, you'd call the API
      // await markAttendance({
      //   date: selectedDate.toISOString().split('T')[0],
      //   class: selectedClass,
      //   section: selectedSection,
      //   students: students.map(s => ({ id: s.id, status: s.attendanceStatus }))
      // });
      
      // Mock save for demo
      setTimeout(() => {
        // Calculate new counts
        const presentCount = students.filter(s => s.attendanceStatus === 'present').length;
        const absentCount = students.filter(s => s.attendanceStatus === 'absent').length;
        const lateCount = students.filter(s => s.attendanceStatus === 'late').length;
        
        // Update the attendance record
        setAttendanceRecord({
          ...attendanceRecord!,
          presentCount,
          absentCount,
          lateCount,
          students
        });
        
        setSaving(false);
        setShowMarkModal(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      setSaving(false);
    }
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getAttendanceIcon = (status?: string) => {
    switch (status) {
      case 'present':
        return { icon: 'checkmark-circle', color: colors.success };
      case 'absent':
        return { icon: 'close-circle', color: colors.danger };
      case 'late':
        return { icon: 'time', color: colors.warning };
      default:
        return { icon: 'ellipse-outline', color: colors.textSecondary };
    }
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    const attendanceIcon = getAttendanceIcon(item.attendanceStatus);
    
    return (
      <View style={[styles.studentCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: colors.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.rollNumber, { color: colors.textSecondary }]}>
            Roll No: {item.rollNumber}
          </Text>
        </View>
        
        <View style={[
          styles.attendanceStatus, 
          { 
            backgroundColor: attendanceIcon.color + '20',
            borderColor: attendanceIcon.color
          }
        ]}>
          <Ionicons name={attendanceIcon.icon} size={18} color={attendanceIcon.color} />
          <Text style={[styles.attendanceText, { color: attendanceIcon.color }]}>
            {item.attendanceStatus ? item.attendanceStatus.charAt(0).toUpperCase() + item.attendanceStatus.slice(1) : 'Not Marked'}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderStudentItemForModal = ({ item }: { item: Student }) => {
    return (
      <View style={[styles.modalStudentCard, { borderColor: colors.border }]}>
        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: colors.textPrimary }]}>{item.name}</Text>
          <Text style={[styles.rollNumber, { color: colors.textSecondary }]}>
            Roll No: {item.rollNumber}
          </Text>
        </View>
        
        <View style={styles.statusButtons}>
          <TouchableOpacity 
            style={[
              styles.statusButton, 
              item.attendanceStatus === 'present' ? { backgroundColor: colors.success } : { backgroundColor: colors.success + '20' }
            ]}
            onPress={() => updateStudentAttendance(item.id, 'present')}
          >
            <Ionicons 
              name="checkmark" 
              size={18} 
              color={item.attendanceStatus === 'present' ? '#FFFFFF' : colors.success} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statusButton, 
              item.attendanceStatus === 'absent' ? { backgroundColor: colors.danger } : { backgroundColor: colors.danger + '20' }
            ]}
            onPress={() => updateStudentAttendance(item.id, 'absent')}
          >
            <Ionicons 
              name="close" 
              size={18} 
              color={item.attendanceStatus === 'absent' ? '#FFFFFF' : colors.danger} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statusButton, 
              item.attendanceStatus === 'late' ? { backgroundColor: colors.warning } : { backgroundColor: colors.warning + '20' }
            ]}
            onPress={() => updateStudentAttendance(item.id, 'late')}
          >
            <Ionicons 
              name="time" 
              size={18} 
              color={item.attendanceStatus === 'late' ? '#FFFFFF' : colors.warning} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const AttendanceSummary = () => {
    if (!attendanceRecord) return null;
    
    const presentPercentage = Math.round((attendanceRecord.presentCount / attendanceRecord.totalStudents) * 100);
    
    return (
      <View style={[styles.summaryContainer, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.overallAttendance}>
          <View style={[styles.progressRing, { borderColor: colors.accent + '30' }]}>
            <View style={[styles.progressFill, { borderColor: colors.accent }]} />
            <Text style={[styles.progressText, { color: colors.textPrimary }]}>{presentPercentage}%</Text>
          </View>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Present</Text>
        </View>
        
        <View style={styles.detailedStats}>
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{attendanceRecord.presentCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Present</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.danger + '20' }]}>
              <Ionicons name="close-circle" size={18} color={colors.danger} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{attendanceRecord.absentCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Absent</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="time" size={18} color={colors.warning} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{attendanceRecord.lateCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Late</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Attendance</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.dateSelector, { backgroundColor: colors.cardBackground }]}
          onPress={() => setCalendarVisible(true)}
        >
          <Ionicons name="calendar" size={20} color={colors.accent} />
          <Text style={[styles.dateText, { color: colors.textPrimary }]}>
            {formatDate(selectedDate)}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={[styles.classSelector, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.classPickerContainer}>
            <Text style={[styles.classLabel, { color: colors.textSecondary }]}>Class</Text>
            <View style={styles.classPicker}>
              {['IX', 'X', 'XI', 'XII'].map(cls => (
                <TouchableOpacity 
                  key={cls}
                  style={[
                    styles.classOption,
                    selectedClass === cls && { backgroundColor: colors.accent }
                  ]}
                  onPress={() => setSelectedClass(cls)}
                >
                  <Text 
                    style={[
                      styles.classOptionText,
                      { color: selectedClass === cls ? '#FFFFFF' : colors.textPrimary }
                    ]}
                  >
                    {cls}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.sectionPickerContainer}>
            <Text style={[styles.classLabel, { color: colors.textSecondary }]}>Section</Text>
            <View style={styles.classPicker}>
              {['A', 'B', 'C', 'D'].map(section => (
                <TouchableOpacity 
                  key={section}
                  style={[
                    styles.classOption,
                    selectedSection === section && { backgroundColor: colors.accent }
                  ]}
                  onPress={() => setSelectedSection(section)}
                >
                  <Text 
                    style={[
                      styles.classOptionText,
                      { color: selectedSection === section ? '#FFFFFF' : colors.textPrimary }
                    ]}
                  >
                    {section}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <>
          <AttendanceSummary />
          
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: colors.textPrimary }]}>Student List</Text>
            <TouchableOpacity 
              style={[styles.markButton, { backgroundColor: colors.accent }]}
              onPress={handleMarkAttendance}
            >
              <MaterialIcons name="edit" size={16} color="#FFFFFF" />
              <Text style={styles.markButtonText}>Mark Attendance</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={attendanceRecord?.students || []}
            renderItem={renderStudentItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarModal, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Date</Text>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarContainer}>
              {/* This would be a real calendar component in a production app */}
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>
                A calendar component would be here in a real app
              </Text>
              
              <View style={styles.quickDates}>
                <TouchableOpacity 
                  style={[styles.quickDateOption, { backgroundColor: colors.accent + '20' }]}
                  onPress={() => handleDateChange(new Date())}
                >
                  <Text style={[styles.quickDateText, { color: colors.accent }]}>Today</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.quickDateOption, { backgroundColor: colors.accent + '20' }]}
                  onPress={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    handleDateChange(yesterday);
                  }}
                >
                  <Text style={[styles.quickDateText, { color: colors.accent }]}>Yesterday</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.quickDateOption, { backgroundColor: colors.accent + '20' }]}
                  onPress={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    handleDateChange(tomorrow);
                  }}
                >
                  <Text style={[styles.quickDateText, { color: colors.accent }]}>Tomorrow</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mark Attendance Modal */}
      <Modal
        visible={showMarkModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !saving && setShowMarkModal(false)}
      >
        <SafeAreaView style={[styles.markModalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.markModalHeader}>
            <TouchableOpacity 
              disabled={saving}
              onPress={() => setShowMarkModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.markModalTitle, { color: colors.textPrimary }]}>Mark Attendance</Text>
            <TouchableOpacity 
              style={[styles.saveButton, saving && { opacity: 0.7 }]}
              onPress={handleSaveAttendance}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.markModalContent}>
            <View style={styles.dateClassInfo}>
              <Text style={[styles.dateClassText, { color: colors.textPrimary }]}>
                {formatDate(selectedDate)}
              </Text>
              <Text style={[styles.dateClassText, { color: colors.textPrimary }]}>
                Class {selectedClass}-{selectedSection}
              </Text>
            </View>
            
            <View style={styles.bulkActions}>
              <TouchableOpacity 
                style={[styles.bulkActionButton, { backgroundColor: colors.success + '20' }]}
                onPress={() => {
                  const allPresent = students.map(s => ({ ...s, attendanceStatus: 'present' }));
                  setStudents(allPresent);
                }}
              >
                <Text style={[styles.bulkActionText, { color: colors.success }]}>Mark All Present</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.bulkActionButton, { backgroundColor: colors.danger + '20' }]}
                onPress={() => {
                  const allAbsent = students.map(s => ({ ...s, attendanceStatus: 'absent' }));
                  setStudents(allAbsent);
                }}
              >
                <Text style={[styles.bulkActionText, { color: colors.danger }]}>Mark All Absent</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.statusLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Present</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.danger }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Absent</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: colors.warning }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]}>Late</Text>
              </View>
            </View>
            
            <FlatList
              data={students}
              renderItem={renderStudentItemForModal}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.modalListContainer}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  controls: {
    marginBottom: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  classSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
  },
  classPickerContainer: {
    flex: 1,
  },
  classLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  classPicker: {
    flexDirection: 'row',
  },
  classOption: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    marginHorizontal: 2,
  },
  classOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    marginHorizontal: 12,
  },
  sectionPickerContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  overallAttendance: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressFill: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 14,
  },
  detailedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  markButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  markButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  listContainer: {
    paddingBottom: 16,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rollNumber: {
    fontSize: 12,
  },
  attendanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  attendanceText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModal: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarContainer: {
    padding: 10,
  },
  quickDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickDateOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickDateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  markModalContainer: {
    flex: 1,
  },
  markModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  markModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  markModalContent: {
    flex: 1,
    padding: 16,
  },
  dateClassInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateClassText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bulkActions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bulkActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  bulkActionText: {
    fontWeight: '600',
  },
  statusLegend: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
  modalListContainer: {
    paddingBottom: 20,
  },
  modalStudentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statusButtons: {
    flexDirection: 'row',
  },
  statusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});