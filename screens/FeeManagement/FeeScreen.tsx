import { format } from "date-fns";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as XLSX from "xlsx";
import Pagination from "../../components/Pagination";
import { useTheme } from "../../context/ThemeContext";
import {
  addNote,
  addPayment,
  fetchFeeRecordsByStatus,
  importFeeRecordsFromExcel,
} from "../../services/apiService";

import EmptyState from "./components/EmptyState";
import FeeFilters from "./components/FeeFilters";
import Loader from "./components/Loader";
import NoteModal from "./components/NoteModal";
import PaymentFormModal from "./components/PaymentFormModal";
import PaymentHistoryModal from "./components/PaymentHistoryModal";
import StudentCard from "./components/StudentCard";

// Types
import { Ionicons } from "@expo/vector-icons";
import { useAlert } from "../../utils/Alert/AlertManager";
import { FilterType, Payment, Student, StudentNote } from "./types";

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const FeeManagementScreen = () => {
  const { theme } = useTheme();
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
  const { showAlert } = useAlert();
  const styles = createStyles(colors);

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal states
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const loadFeeRecords = async (
    page: number = paginationMeta.currentPage,
    limit: number = paginationMeta.itemsPerPage,
    applySearch: boolean = true,
    statusFilter: FilterType = currentFilter
  ) => {
    try {
      setIsLoading(true);
      const records = await fetchFeeRecordsByStatus(statusFilter, page, limit);
      if (records && records.data) {
        setStudents(records.data);
        if (applySearch && searchQuery) {
          const query = searchQuery.toLowerCase();
          const filteredRecords = records.data.filter(
            (student: Student) =>
              student.student.firstName.toLowerCase().includes(query) ||
              student.student.lastName.toLowerCase().includes(query) ||
              student.student.admissionNumber.toLowerCase().includes(query)
          );
          setFilteredStudents(filteredRecords);
        } else {
          setFilteredStudents(records.data);
        }
      } else {
        console.error("Invalid response structure:", records);
      }
      setPaginationMeta({
        currentPage: records?.pagination?.currentPage,
        totalPages: records?.pagination?.totalPages,
        totalItems: records?.pagination?.totalItems,
        itemsPerPage: records?.pagination?.itemsPerPage,
      });
    } catch (error) {
      // console.error("Error fetching fee records:", error);
      // Alert.alert("Error", "Failed to load fee records.");
      showAlert({title: "Error", message: "Failed to load fee records"});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeeRecords(1, paginationMeta.itemsPerPage, true, currentFilter);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeeRecords(
      paginationMeta.currentPage,
      paginationMeta.itemsPerPage,
      true,
      currentFilter
    );
    setRefreshing(false);
  };

  const handlePageChange = (page: number) => {
    loadFeeRecords(page, paginationMeta.itemsPerPage, true, currentFilter);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    loadFeeRecords(1, newLimit, true, currentFilter);
  };

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

  const keyExtractor = useCallback(
    (item: Student) => item._id || item.student._id,
    []
  );

  useEffect(() => {
    loadFeeRecords(1, paginationMeta.itemsPerPage, true, currentFilter);
  }, [currentFilter]);

  useEffect(() => {
    if (!students?.length) return;

    let result = [...students];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (student) =>
          student.student.firstName.toLowerCase().includes(query) ||
          student.student.lastName.toLowerCase().includes(query) ||
          student.student.admissionNumber.toLowerCase().includes(query)
      );
    }
    setFilteredStudents(result);
  }, [students, searchQuery]);

  // Function to parse Excel file and extract student data
  const handleFileUpload = async () => {
    try {
      setIsProcessing(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsProcessing(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook = XLSX.read(fileContent, { type: "base64" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const studentRecord = await importFeeRecordsFromExcel(jsonData);
      let processedStudents = studentRecord?.data?.feeRecords;
      setStudents(processedStudents);
      setFilteredStudents(processedStudents);

      setPaginationMeta({
        currentPage: studentRecord?.pagination?.currentPage,
        totalPages: studentRecord?.pagination?.totalPages,
        totalItems: studentRecord?.pagination?.totalItems,
        itemsPerPage: studentRecord?.pagination?.itemsPerPage,
      });
      setIsProcessing(false);

      // Alert.alert(
      //   "Success",
      //   studentRecord?.message,
      //   [{ text: "OK" }]
      // );
      showAlert({title: "Success", message: studentRecord?.message});
    } catch (error) {
      setIsProcessing(false);
      console.error("Error uploading file:", error);
      // Alert.alert(
      //   "Error",
      //   "Failed to process the Excel file. Please check the format and try again.",
      //   [{ text: "OK" }]
      // );
      showAlert({title: "Error", message: "Failed to process the Excel file. Please check the format and try again."});
    }
  };

  // Function to record a payment
  const handlePayment = async (payment: Payment) => {
    if (!selectedStudent) return;

    try {
      setIsLoading(true);
      setShowPaymentForm(false);
      const updatedStudent = await addPayment(selectedStudent._id!, payment);

      const updatedStudents = students.map((student) =>
        student._id === updatedStudent._id ? updatedStudent : student
      );

      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      setSelectedStudent(updatedStudent);

      // Alert.alert("Success", "Payment recorded successfully.");
      showAlert({ title: "Success", message: "Payment recorded successfully." });
    } catch (error) {
      // console.error("Error recording payment:", error);
      // Alert.alert("Error", "Failed to record payment.");
      showAlert({ title: "Error", message: "Failed to record payment." });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to add a note to a student
  const handleAddNote = async (note: StudentNote) => {
    if (!selectedStudent) return;

    try {
      setIsLoading(true);
      setShowNoteModal(false);
      const updatedStudent = await addNote(selectedStudent._id!, note);

      const updatedStudents = students.map((student) =>
        student._id === updatedStudent?.data?._id ? updatedStudent?.data : student
      );

      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      setSelectedStudent(updatedStudent);

      showAlert({ type: "Success", message: "Note added successfully." });
    } catch (error) {
      console.error("Error adding note:", error);
      // Alert.alert("Error", "Failed to add note.");
      showAlert({ title: "Error", message: "Failed to add note." });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to apply status filter
  const handleFilterChange = async (filter: FilterType) => {
    setCurrentFilter(filter);
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
              <p>Generated on: ${format(new Date(), "MMMM dd, yyyy")}</p>
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
                  <td>${student.student.firstName} ${
        student.student.lastName
      }</td>
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
                  <td class="${
                    student.status
                  }">${student.status.toUpperCase()}</td>
                </tr>
                <tr>
                  <th>Next Payment Date</th>
                  <td>${format(
                    new Date(student.nextPaymentDate),
                    "MMMM dd, yyyy"
                  )}</td>
                </tr>
                <tr>
                  <th>Due Date</th>
                  <td>${format(new Date(student.dueDate), "MMMM dd, yyyy")}</td>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <h2>Payment History</h2>
              ${
                student.payments?.length > 0
                  ? `
                <table>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                  </tr>
                  ${student.payments
                    .map(
                      (payment) => `
                    <tr>
                      <td>${format(
                        new Date(payment.date),
                        "MMMM dd, yyyy"
                      )}</td>
                      <td>₹${payment.amount.toLocaleString()}</td>
                      <td>${payment.method}</td>
                      <td>${payment.reference || "-"}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </table>
              `
                  : "<p>No payment history available.</p>"
              }
            </div>
            
            <div class="section">
              <h2>Notes</h2>
              ${
                student.notes?.length > 0
                  ? `
                <table>
                  <tr>
                    <th>Date</th>
                    <th>Note</th>
                  </tr>
                  ${student.notes
                    .map(
                      (note) => `
                    <tr>
                      <td>${format(new Date(note.date), "MMMM dd, yyyy")}</td>
                      <td>${note.text}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </table>
              `
                  : "<p>No notes available.</p>"
              }
            </div>
          </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Share the PDF
      if (Platform.OS === "ios") {
        await Sharing.shareAsync(uri);
      } else {
        await Sharing.shareAsync(uri);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      // console.error("Error generating PDF:", error);
      // Alert.alert("Error", "Failed to generate PDF.");
      showAlert({title: "Error", message:"Failed to generate PDF."})
    }
  }, []);

  // Render student item
  const renderItem = useCallback(
    ({ item }: { item: Student }) => (
      <StudentCard
        student={item}
        colors={colors}
        onPress={() => handleStudentPress(item)}
        onAddPayment={() => handleAddPayment(item)}
        onAddNote={() => handleStudentNote(item)}
        onPrint={() => handlePrintStudent(item)}
      />
    ),
    [
      colors,
      handleStudentPress,
      handleAddPayment,
      handleStudentNote,
      handlePrintStudent,
    ]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
            Fee Management
          </Text>
          <Text style={[styles.studentCount, { color: colors.textSecondary }]}>
            Total: {paginationMeta.totalItems}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={() =>
            loadFeeRecords(
              paginationMeta.currentPage,
              paginationMeta.itemsPerPage,
              true,
              currentFilter
            )
          }
        >
          <Ionicons name="reload" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View
          style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}
        >
          <Icon
            name="magnify"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by name or admission number"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon
                name="close-circle"
                size={20}
                color={colors.textSecondary}
              />
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
            {isProcessing ? "Processing..." : "Upload Excel"}
          </Text>
        </TouchableOpacity>
      </View>

      <FeeFilters
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        colors={colors}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Loader colors={colors} message="Fetching Fee Records..." />
        </View>
      ) : isProcessing ? (
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              colors={colors}
              message={
                students?.length
                  ? "No students match your filters"
                  : "Upload an Excel file to get started"
              }
              icon={students?.length ? "filter-remove" : "file-upload"}
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

      {filteredStudents.length > 0 && (
        <Pagination
          currentPage={paginationMeta.currentPage}
          totalPages={paginationMeta.totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={paginationMeta.itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={paginationMeta.totalItems}
          theme={theme === "dark" ? "dark" : "light"}
        />
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
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
    titleContainer: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    screenTitle: {
      fontSize: 24,
      fontWeight: "bold",
    },
    studentCount: {
      fontSize: 14,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    searchContainer: {
      flexDirection: "row",
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
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.accent,
      paddingHorizontal: 10,
      borderRadius: 50,
      justifyContent: "center",
    },
    uploadButtonText: {
      color: "#fff",
      marginLeft: 5,
      fontWeight: "500",
    },
    listContent: {
      padding: 10,
      paddingBottom: 50,
    },
  });

export default FeeManagementScreen;
