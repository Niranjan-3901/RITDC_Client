// // FeeManagementScreen.tsx
// import { addDays, addMonths, format } from 'date-fns';
// import * as DocumentPicker from 'expo-document-picker';
// import * as FileSystem from 'expo-file-system';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   Alert,
//   FlatList,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import * as XLSX from 'xlsx';
// import { useTheme } from '../../context/ThemeContext';

// import EmptyState from './components/EmptyState';
// import FeeFilters from './components/FeeFilters';
// import Loader from './components/Loader';
// import NoteModal from './components/NoteModal';
// import PaymentFormModal from './components/PaymentFormModal';
// import PaymentHistoryModal from './components/PaymentHistoryModal';
// import StudentCard from './components/StudentCard';

// // Types
// import { FilterType, Payment, Student, StudentNote } from './types';

// const FeeManagementScreen = () => {
//   const {theme } = useTheme();
//   const colors = {
//     background: theme === "dark" ? "#121212" : "#F5F7FA",
//     cardBackground: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
//     textPrimary: theme === "dark" ? "#FFFFFF" : "#333333",
//     textSecondary: theme === "dark" ? "#AAAAAA" : "#666666",
//     border: theme === "dark" ? "#333333" : "#E1E4E8",
//     accent: "#4A6FFF",
//     success: "#4CAF50",
//     warning: "#FFC107",
//     danger: "#F44336",
//   };
//   const styles = createStyles(colors);

//   const [students, setStudents] = useState<Student[]>([]);
//   const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
//   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
//   const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
  
//   // Modal states
//   const [showPaymentHistory, setShowPaymentHistory] = useState(false);
//   const [showPaymentForm, setShowPaymentForm] = useState(false);
//   const [showNoteModal, setShowNoteModal] = useState(false);

//   // Memoized callbacks
//   const handleStudentPress = useCallback((student: Student) => {
//     setSelectedStudent(student);
//     setShowPaymentHistory(true);
//   }, []);

//   const handleAddPayment = useCallback((student: Student) => {
//     setSelectedStudent(student);
//     setShowPaymentForm(true);
//   }, []);

//   const handleStudentNote = useCallback((student: Student) => {
//     setSelectedStudent(student);
//     setShowNoteModal(true);
//   }, []);

//   const keyExtractor = useCallback((item: Student) => item.student._id, []);

//   useEffect(() => {
//     if (!students.length) return;
    
//     let result = [...students];
//     // Apply search filter
//     if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase();
//       result = result.filter(
//         student => 
//           student.student.firstName.toLowerCase().includes(query) || 
//           student.student.lastName.toLowerCase().includes(query) || 
//           student.student.admissionNumber.toLowerCase().includes(query)
//       );
//     }
    
//     // Apply status filter
//     switch (currentFilter) {
//       case 'paid':
//         result = result.filter(student => student.status === 'paid');
//         break;
//       case 'unpaid':
//         result = result.filter(student => student.status === 'unpaid');
//         break;
//       case 'partial':
//         result = result.filter(student => student.status === 'partial');
//         break;
//       case 'overdue':
//         result = result.filter(student => student.status === 'overdue');
//         break;
//       default:
//         break;
//     }
    
//     setFilteredStudents(result);
//   }, [students, currentFilter, searchQuery]);

//   // Function to parse Excel file and extract student data
//   const handleFileUpload = async () => {
//     try {
//       setIsProcessing(true);
      
//       const result = await DocumentPicker.getDocumentAsync({
//         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         copyToCacheDirectory: true
//       });
      
//       if (result.canceled) {
//         setIsProcessing(false);
//         return;
//       }
      
//       const fileUri = result.assets[0].uri;
//       const fileContent = await FileSystem.readAsStringAsync(fileUri, {
//         encoding: FileSystem.EncodingType.Base64
//       });
      
//       const workbook = XLSX.read(fileContent, { type: 'base64' });
//       const sheetName = workbook.SheetNames[0];
//       // console.log("sheetName: " + sheetName);
//       const worksheet = workbook.Sheets[sheetName];
//       // console.log("worksheet: " + worksheet)
//       const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
//       // Process the data
//       const processedStudents = jsonData.map((row: any, index) => {
//         // Convert Excel serial number to JavaScript Date
//         let admissionDate;
//         try {
//           if (typeof row['Admission Date'] === 'number') {
//             // Excel date serial number to JS Date
//             const excelEpoch = new Date(1899, 11, 30); // Excel's epoch is 12/30/1899
//             const millisecondsPerDay = 24 * 60 * 60 * 1000;
//             admissionDate = new Date(excelEpoch.getTime() + (row['Admission Date'] * millisecondsPerDay));
//           } else {
//             // If it's already a string, parse it normally
//             const [month, day, year] = (row['Admission Date'] || '').split('/');
//             admissionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//           }

//           // Validate the date
//           if (isNaN(admissionDate.getTime())) {
//             throw new Error(`Invalid date for student at row ${index + 1}`);
//           }

//           const nextPaymentDate = addMonths(admissionDate, 1);
//           const dueDate = addDays(nextPaymentDate, 15);
          
//           // Fix: Type the status properly
//           const statuses = ['paid', 'unpaid', 'partial', 'overdue'] as const;
//           const randomStatus = statuses[Math.floor(Math.random() * statuses.length)] as Student['status'];
          
//           return {
//             student: {
//               _id: String(index + 1),
//               admissionNumber: row['Roll Number']?.toString() || `ADM${index + 1}`,
//               firstName: (row['Student Name'] || `Student ${index + 1}`).split(' ')[0],
//               lastName: (row['Student Name'] || `Student ${index + 1}`).split(' ')[1] || ''
//             },
//             serialNumber: row['Serial Number']?.toString() || `SN${index + 1}`,
//             feeAmount: 10000,
//             status: randomStatus,
//             nextPaymentDate: format(new Date(nextPaymentDate), 'yyyy-MM-dd'),
//             dueDate: format(new Date(dueDate), 'yyyy-MM-dd'),
//             payments: [],
//             notes: [],
//             academicYear: new Date().getFullYear().toString(),
//             term: 'Annual'
//           } as Student;
//         } catch (error:any) {
//           console.error(`Error processing row ${index + 1}:`, error);
//           throw new Error(`Failed to process student at row ${index + 1}: ${error.message}`);
//         }
//       });
      
//       setStudents(processedStudents);
//       setFilteredStudents(processedStudents);
//       setIsProcessing(false);
      
//       Alert.alert(
//         'Success',
//         `${processedStudents.length} students imported successfully.`,
//         [{ text: 'OK' }]
//       );
//     } catch (error) {
//       setIsProcessing(false);
//       console.error('Error uploading file:', error);
//       Alert.alert(
//         'Error',
//         'Failed to process the Excel file. Please check the format and try again.',
//         [{ text: 'OK' }]
//       );
//     }
//   };

//   // Function to record a payment
//   const handlePayment = (payment: Payment) => {
//     if (!selectedStudent) return;
    
//     const updatedStudents = students.map(student => {
//       if (student.id === selectedStudent.id) {
//         const updatedPayments = [...student.payments, payment];
        
//         // Calculate the total paid amount
//         const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        
//         // Determine the new status
//         let newStatus: Student['status'] = 'unpaid';  // Type the status properly
//         if (totalPaid >= student.feeAmount) {
//           newStatus = 'paid';
//         } else if (totalPaid > 0) {
//           newStatus = 'partial';
//         }
        
//         // Check if overdue
//         const today = new Date();
//         const dueDate = new Date(student.dueDate);
//         if (today > dueDate && newStatus !== 'paid') {
//           newStatus = 'overdue';
//         }
        
//         return {
//           ...student,
//           payments: updatedPayments,
//           status: newStatus,
//         };
//       }
//       return student;
//     });
    
//     setStudents(updatedStudents);
//     setShowPaymentForm(false);
    
//     // Update selected student for the modal
//     const updatedStudent = updatedStudents.find(s => s.id === selectedStudent.id);
//     if (updatedStudent) {
//       setSelectedStudent(updatedStudent);
//     }
    
//     Alert.alert('Success', 'Payment recorded successfully.');
//   };

//   // Function to add a note to a student
//   const handleAddNote = (note: StudentNote) => {
//     if (!selectedStudent) return;
    
//     const updatedStudents = students.map(student => {
//       if (student.student._id === selectedStudent.student._id) {
//         return {
//           ...student,
//           notes: [...student.notes, note]
//         };
//       }
//       return student;
//     });
    
//     setStudents(updatedStudents);
//     setShowNoteModal(false);
    
//     // Update selected student for the modal
//     const updatedStudent = updatedStudents.find(s => s.student._id === selectedStudent.student._id);
//     if (updatedStudent) {
//       setSelectedStudent(updatedStudent);
//     }
    
//     Alert.alert('Success', 'Note added successfully.');
//   };

import { format } from 'date-fns';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as XLSX from 'xlsx';
import { useTheme } from '../../context/ThemeContext';

import {
  addNote,
  addPayment,
  fetchAllFeeRecords,
  fetchFeeRecordsByStatus,
  importFeeRecordsFromExcel
} from '../../services/apiService';

import EmptyState from './components/EmptyState';
import FeeFilters from './components/FeeFilters';
import Loader from './components/Loader';
import NoteModal from './components/NoteModal';
import PaymentFormModal from './components/PaymentFormModal';
import PaymentHistoryModal from './components/PaymentHistoryModal';
import StudentCard from './components/StudentCard';

// Types
import { FilterType, Payment, Student, StudentNote } from './types';

const FeeManagementScreen = () => {
  const {theme } = useTheme();
  const colors = {
    background: theme === "dark" ? "#121212" : "#F5F7FA",
    cardBackground: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
    textPrimary: theme === "dark" ? "#FFFFFF" : "#333333",
    textSecondary: theme === "dark" ? "#AAAAAA" : "#666666",
    border: theme === "dark" ? "#333333" : "#E1E4E8",
    accent: "#4A6FFF",
    success: "#4CAF50",
    warning: "#FFC107",
    danger: "#F44336",
  };
  const styles = createStyles(colors);

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal states
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Fetch initial fee records
  useEffect(() => {
    const loadFeeRecords = async () => {
      try {
        setIsLoading(true);
        const records = await fetchAllFeeRecords()
        setStudents(records?.data);
        setFilteredStudents(records?.data);
      } catch (error) {
        console.error('Error fetching fee records:', error);
        Alert.alert('Error', 'Failed to load fee records.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeeRecords();
  }, []);

  // Memoized callbacks
  const handleStudentPress = useCallback((student: Student) => {
    setSelectedStudent(student);
    setShowPaymentHistory(true);
  }, []);

  const handleAddPayment = useCallback((student: Student) => {
    setSelectedStudent(student);
    setShowPaymentForm(true);
  }, []);

  const handleStudentNote = useCallback((student: Student) => {
    setSelectedStudent(student);
    setShowNoteModal(true);
  }, []);

  const keyExtractor = useCallback((item: Student) => item._id || item.student._id, []);

  useEffect(() => {
    if (!students.length) return;
    
    let result = [...students];
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        student => 
          student.student.firstName.toLowerCase().includes(query) ||
          student.student.lastName.toLowerCase().includes(query) ||
          student.student.admissionNumber.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    switch (currentFilter) {
      case 'paid':
        result = result.filter(student => student.status === 'paid');
        break;
      case 'unpaid':
        result = result.filter(student => student.status === 'unpaid');
        break;
      case 'partial':
        result = result.filter(student => student.status === 'partial');
        break;
      case 'overdue':
        result = result.filter(student => student.status === 'overdue');
        break;
      default:
        break;
    }
    
    setFilteredStudents(result);
  }, [students, currentFilter, searchQuery]);

  // Function to parse Excel file and extract student data
  const handleFileUpload = async () => {
    try {
      setIsProcessing(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        setIsProcessing(false);
        return;
      }
      
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      const workbook = XLSX.read(fileContent, { type: 'base64' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Process the data and send to backend
      // const processedStudents = await importFeeRecordsFromExcel(jsonData);
      const studentRecord = await importFeeRecordsFromExcel(jsonData);
      let processedStudents = studentRecord?.data?.feeRecords;

      
      setStudents(processedStudents);
      setFilteredStudents(processedStudents);
      setIsProcessing(false);
      
      Alert.alert(
        'Success',
        `${processedStudents.length} students imported successfully.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      setIsProcessing(false);
      console.error('Error uploading file:', error);
      Alert.alert(
        'Error',
        'Failed to process the Excel file. Please check the format and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Function to record a payment
  const handlePayment = async (payment: Payment) => {
    if (!selectedStudent) return;
    
    try {
      setIsLoading(true);
      const updatedStudent = await addPayment(selectedStudent._id!, payment);
      
      const updatedStudents = students.map(student => 
        student._id === updatedStudent._id ? updatedStudent : student
      );
    
    setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      setSelectedStudent(updatedStudent);
      setShowPaymentForm(false);
    
    Alert.alert('Success', 'Payment recorded successfully.');
    } catch (error) {
      console.error('Error recording payment:', error);
      Alert.alert('Error', 'Failed to record payment.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a note to a student
  const handleAddNote = async (note: StudentNote) => {
    if (!selectedStudent) return;
    
    try {
      setIsLoading(true);
      const updatedStudent = await addNote(selectedStudent._id!, note);
      
      const updatedStudents = students.map(student => 
        student._id === updatedStudent._id ? updatedStudent : student
      );
    
    setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      setSelectedStudent(updatedStudent);
      setShowNoteModal(false);
      
      Alert.alert('Success', 'Note added successfully.');
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to apply status filter
  const handleFilterChange = async (filter: FilterType) => {
    setCurrentFilter(filter);
    
    try {
      setIsLoading(true);
      let records;
      if (filter === 'all') {
        records = await fetchAllFeeRecords();
      } else {
        records = await fetchFeeRecordsByStatus(filter);
      }
      
      setStudents(records?.data);
      setFilteredStudents(records?.data);
    } catch (error) {
      console.error('Error fetching filtered records:', error);
      Alert.alert('Error', 'Failed to fetch filtered records.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to print student details
  const handlePrintStudent = useCallback(async (student: Student) => {
    try {
      setIsLoading(true);
      
      // Generate HTML content for PDF
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica'; padding: 20px; }
              h1 { color: #4A6FFF; }
              .header { margin-bottom: 20px; }
              .section { margin-bottom: 15px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background-color: #f0f2f5; }
              .paid { color: #4CAF50; }
              .unpaid { color: #FFA500; }
              .overdue { color: #FF4C4C; }
              .partial { color: #FFA500; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Student Fee Details</h1>
              <p>Generated on: ${format(new Date(), 'MMMM dd, yyyy')}</p>
            </div>
            
            <div class="section">
              <h2>Student Information</h2>
              <table>
                <tr>
                  <th>Admission Number</th>
                  <td>${student.student.admissionNumber}</td>
                </tr>
                <tr>
                  <th>Name</th>
                  <td>${student.student.firstName} ${student.student.lastName}</td>
                </tr>
                <tr>
                  <th>Admission Date</th>
                  <td>${student.admissionDate}</td>
                </tr>
                <tr>
                  <th>Fee Amount</th>
                  <td>₹${student.feeAmount.toLocaleString()}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td class="${student.status}">${student.status.toUpperCase()}</td>
                </tr>
                <tr>
                  <th>Next Payment Date</th>
                  <td>${format(new Date(student.nextPaymentDate), 'MMMM dd, yyyy')}</td>
                </tr>
                <tr>
                  <th>Due Date</th>
                  <td>${format(new Date(student.dueDate), 'MMMM dd, yyyy')}</td>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <h2>Payment History</h2>
              ${student.payments.length > 0 ? `
                <table>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                  </tr>
                  ${student.payments.map(payment => `
                    <tr>
                      <td>${format(new Date(payment.date), 'MMMM dd, yyyy')}</td>
                      <td>₹${payment.amount.toLocaleString()}</td>
                      <td>${payment.method}</td>
                      <td>${payment.reference || '-'}</td>
                    </tr>
                  `).join('')}
                </table>
              ` : '<p>No payment history available.</p>'}
            </div>
            
            <div class="section">
              <h2>Notes</h2>
              ${student.notes.length > 0 ? `
                <table>
                  <tr>
                    <th>Date</th>
                    <th>Note</th>
                  </tr>
                  ${student.notes.map(note => `
                    <tr>
                      <td>${format(new Date(note.date), 'MMMM dd, yyyy')}</td>
                      <td>${note.text}</td>
                    </tr>
                  `).join('')}
                </table>
              ` : '<p>No notes available.</p>'}
            </div>
          </body>
        </html>
      `;
      
      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Share the PDF
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        await Sharing.shareAsync(uri);
      }
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF.');
    }
  },[]);

  // Render student item
  const renderItem = useCallback(({ item }: { item: Student }) => (
    <StudentCard
      student={item}
      colors={colors}
      onPress={() => handleStudentPress(item)}
      onAddPayment={() => handleAddPayment(item)}
      onAddNote={() => handleStudentNote(item)}
      onPrint={() => handlePrintStudent(item)}
    />
  ), [colors, handleStudentPress, handleAddPayment, handleStudentNote, handlePrintStudent]);

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
              Fee Management
            </Text>
            <Text
              style={[styles.studentCount, { color: colors.textSecondary }]}
            >
              Total: {filteredStudents.length}
            </Text>
          </View>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={[
              styles.searchBar,
              { backgroundColor: colors.cardBackground },
            ]}>
          <Icon name="magnify" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by name or admission number"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity
          style={[styles.uploadButton, { marginLeft: 10 }]}
          onPress={handleFileUpload}
          disabled={isProcessing}
        >
          <Icon name="file-upload" size={20} color="#fff" />
          <Text style={styles.uploadButtonText}>
            {isProcessing ? 'Processing...' : 'Upload Excel'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <FeeFilters
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        colors={colors}
      />
      
      {isProcessing ? (
        <Loader colors={colors} message="Processing Excel file..." />
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState 
              colors={colors} 
              message={students.length ? "No students match your filters" : "Upload an Excel file to get started"} 
              icon={students.length ? "filter-remove" : "file-upload"}
            />
          }
        />
      )}
      
      {/* Payment History Modal */}
      <PaymentHistoryModal
        visible={showPaymentHistory}
        onClose={() => setShowPaymentHistory(false)}
        student={selectedStudent}
        colors={colors}
      />
      
      {/* Payment Form Modal */}
      <PaymentFormModal
        visible={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        onSubmit={handlePayment}
        student={selectedStudent}
        colors={colors}
      />
      
      {/* Note Modal */}
      <NoteModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSubmit={handleAddNote}
        student={selectedStudent}
        colors={colors}
      />
      
      {/* Loading overlay */}
      {isLoading && <Loader colors={colors} />}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer:{
    flex: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  studentCount: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    borderRadius: 50,
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
  },
  listContent: {
    padding: 10,
    paddingBottom: 50,
  },
});

export default FeeManagementScreen;