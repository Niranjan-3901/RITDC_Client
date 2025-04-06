import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { renderIcon } from "../utils/utils"; // You'll need to create this service
import { useTheme } from '../context/ThemeContext';
import {
    generateAttendanceReport,
    generateFeeReport,
    generateResultReport,
    generateStudentReport
} from '../services/reportService';
import { useAlert } from '../utils/Alert/AlertManager';

export default function ReportsScreen({ navigation }) {
  const {showAlert} = useAlert();
  const [loading, setLoading] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [recentReports, setRecentReports] = useState([]);
  
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

  const reportTypes = [
    { 
      id: 'students', 
      title: 'Student Reports', 
      icon: 'people', 
      color: colors.accent,
      description: 'Student enrollment, demographics and contact information',
      options: ['All Students', 'By Class', 'By Section', 'New Admissions'],
      library: "MaterialIcons"
    },
    { 
      id: 'attendance', 
      title: 'Attendance Reports', 
      icon: 'user-check',
      color: colors.success,
      description: 'Daily, weekly and monthly attendance statistics',
      options: ['Daily Attendance', 'Monthly Summary', 'Absentee Report', 'Attendance Percentage'],
      library: "FontAwesome5",
    },
    { 
      id: 'fees', 
      title: 'Fee Reports', 
      icon: 'attach-money', 
      color: colors.warning,
      description: 'Fee collection, pending fees and financial summaries',
      options: ['Collection Summary', 'Pending Fees', 'Fee Defaulters', 'Payment History'],
      library: "MaterialIcons"
    },
    { 
      id: 'results', 
      title: 'Result Reports', 
      icon: 'grading', 
      color: colors.danger,
      description: 'Exam results, class performance and subject analysis',
      options: ['Result Summary', 'Top Performers', 'Subject-wise Analysis', 'Class Comparison'],
      library: "MaterialIcons"
    },
  ];

  useEffect(() => {
    // Load recent reports from AsyncStorage or API
    loadRecentReports();
  }, []);

  const loadRecentReports = async () => {
    try {
      // Implement logic to fetch recent reports
      // This could be from AsyncStorage or an API call
      const reports = [
        { 
          id: 'students-all', 
          type: 'students', 
          name: 'All Students', 
          date: '2024-03-05',
          icon: 'people',
          color: colors.accent,
          library: "MaterialIcons"
        },
        { 
          id: 'attendance-monthly', 
          type: 'attendance', 
          name: 'Monthly Attendance', 
          date: '2024-03-01',
          icon: 'user-clock',
          color: colors.success,
          library: "FontAwesome5"
        }
      ];
      setRecentReports(reports);
    } catch (error) {
      console.error('Failed to load recent reports:', error);
    }
  };

  const handleExportReport = (reportType) => {
    setSelectedReportType(reportType);
    setExportModalVisible(true);
  };

  const generateReport = async (option) => {
    setLoading(true);
    
    try {
      let reportData;
      switch (selectedReportType) {
        case 'students':
          reportData = await generateStudentReport(option);
          break;
        case 'attendance':
          reportData = await generateAttendanceReport(option);
          break;
        case 'fees':
          reportData = await generateFeeReport(option);
          break;
        case 'results':
          reportData = await generateResultReport(option);
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Share or save the report
      await shareReport(reportData);
    } catch (error) {
      console.error('Report generation failed:', error);
      // alert('Failed to generate report');
      showAlert({title: "Error", message: "Failed to generate report."})
    } finally {
      setLoading(false);
      setExportModalVisible(false);
    }
  };

  const shareReport = async (reportData) => {
    try {
      const result = await Share.share({
        title: 'School Management Report',
        message: JSON.stringify(reportData),
        // In a real app, you might want to share an actual file
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      // alert(error.message);
      showAlert({title: "Error", message: error.message});
    }
  };

  const renderExportModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={exportModalVisible}
      onRequestClose={() => setExportModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {reportTypes.find(r => r.id === selectedReportType)?.title || 'Export Report'}
            </Text>
            <TouchableOpacity 
              onPress={() => setExportModalVisible(false)}
              disabled={loading}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textPrimary }]}>
                Generating report...
              </Text>
            </View>
          ) : (
            <ScrollView>
              {reportTypes.find(r => r.id === selectedReportType)?.options.map((option, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[styles.optionItem, { borderBottomColor: colors.border }]}
                  onPress={() => generateReport(option)}
                >
                  <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                    {option}
                  </Text>
                  <MaterialIcons 
                    name="chevron-right" 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Reports</Text>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
          onPress={() => navigation.navigate('CustomReport')}
        >
          <MaterialIcons 
            name="build" 
            size={20} 
            color={colors.textPrimary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Report Types Grid */}
        <View style={styles.reportsGrid}>
          {reportTypes.map(reportType => (
            <TouchableOpacity 
              key={reportType.id}
              style={[styles.reportCard, { backgroundColor: colors.cardBackground }]}
              onPress={() => handleExportReport(reportType.id)}
            >
              <View style={[
                styles.reportIconContainer, 
                { backgroundColor: reportType.color + '20' }
              ]}>
                {/* <MaterialIcons 
                  name={reportType.icon} 
                  size={24} 
                  color={reportType.color} 
                /> */}
                {renderIcon({library:reportType.library, iconName:reportType.icon})}
              </View>
              <Text style={[styles.reportTitle, { color: colors.textPrimary }]}>
                {reportType.title}
              </Text>
              <Text 
                style={[styles.reportDescription, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {reportType.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={[styles.quickActions, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActionsGrid}>
            {[
              { 
                icon: 'file-chart-outline', 
                title: 'Dashboard Report', 
                color: colors.accent,
                onPress: () => navigation.navigate('DashboardReport')
              },
              { 
                icon: 'wrench-outline',
                title: 'Custom Report', 
                color: colors.warning,
                onPress: () => navigation.navigate('CustomReport')
              },
              { 
                icon: 'wrench-clock',
                title: 'Scheduled Reports', 
                color: colors.success,
                onPress: () => navigation.navigate('ScheduledReports')
              },
              { 
                icon: 'cogs', 
                title: 'Report Settings', 
                color: colors.danger,
                onPress: () => navigation.navigate('ReportSettings')
              }
            ].map((action, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.quickActionItem, { borderColor: colors.border }]}
                onPress={action.onPress}
              >
                <MaterialCommunityIcons 
                  name={action.icon}
                  size={24} 
                  color={action.color} 
                />
                <Text 
                  style={[
                    styles.quickActionText, 
                    { color: colors.textPrimary }
                  ]}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Reports */}
        <View style={[styles.recentReports, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Recent Reports
          </Text>
          
          {recentReports.map((report, index) => (
            <TouchableOpacity 
              key={report.id} 
              style={[
                styles.recentReportItem, 
                { 
                  borderBottomColor: colors.border,
                  borderBottomWidth: index === recentReports.length - 1 ? 0 : 1 
                }
              ]}
            >
              <View style={styles.recentReportInfo}>
                <View 
                  style={[
                    styles.recentReportIcon, 
                    { backgroundColor: report.color + '20' }
                  ]}
                >
                  {/* <MaterialIcons 
                    name={report.icon} 
                    size={18} 
                    color={report.color} 
                  /> */}
                  {renderIcon({library:report?.library, iconName:report?.icon, color:report?.color})}
                </View>
                <View>
                  <Text 
                    style={[
                      styles.recentReportTitle, 
                      { color: colors.textPrimary }
                    ]}
                  >
                    {report.name}
                  </Text>
                  <Text 
                    style={[
                      styles.recentReportDate, 
                      { color: colors.textSecondary }
                    ]}
                  >
                    Generated on {report.date}
                  </Text>
                </View>
              </View>
              <TouchableOpacity>
                <MaterialIcons 
                  name="file-download" 
                  size={20} 
                  color={report.color} 
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {renderExportModal()}
    </View>
  );
}

// [Previous code remains the same]

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
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reportCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  quickActions: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  quickActionText: {
    marginLeft: 8,
    fontSize: 14,
  },
  recentReports: {
    borderRadius: 12,
    padding: 16,
  },
  recentReportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  // [Previous styles continue]
  recentReportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentReportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentReportTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recentReportDate: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  exportFormatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  exportFormatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  exportFormatText: {
    marginLeft: 8,
    fontSize: 14,
  },
});


  // Additional Export Formats Component
  const ExportFormatsComponent = ({ colors, onSelectFormat }) => {
    const exportFormats = [
      { 
        name: 'PDF', 
        icon: 'file-pdf-box', 
        color: colors.danger 
      },
      { 
        name: 'Excel', 
        icon: 'file-excel-box', 
        color: colors.success 
      },
      { 
        name: 'CSV', 
        icon: 'file-delimited', 
        color: colors.accent 
      }
    ];
  
    return (
      <View style={styles.exportFormatContainer}>
        {exportFormats.map((format, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.exportFormatButton,
              { backgroundColor: format.color + '20' }
            ]}
            onPress={() => onSelectFormat(format.name)}
          >
            <MaterialCommunityIcons 
              name={format.icon} 
              size={24} 
              color={format.color} 
            />
            <Text 
              style={[
                styles.exportFormatText, 
                { color: format.color }
              ]}
            >
              {format.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
