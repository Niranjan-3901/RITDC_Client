import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AddStudentModal from "../components/AddStudentModal";
import { useTheme } from "../context/ThemeContext";

import {
  createStudent,
  getStudents,
  updateStudent,
} from "../services/apiService";
import { ClassSectionCreationModal } from "./ClassSectionHandleModal";
import StudentDetailsModal from "./StudentDetailsModal";

interface Student {
  _id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date | string;
  class: string;
  section: string;
  admissionDate?: Date | string;
  profileImage?: string | null;
  contactNumber?: string;
  email?: string;
  address?: string;
  parentName?: string;
  parentContact?: string;
  status: "Active" | "Inactive";
  notes?: string;
}

type RootStackParamList = {
  StudentDetails: { studentId: string };
};

export default function StudentsScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    null
  );
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    editMode: boolean;
    editableStudentData: Student | null;
    setEditingUserData: () => void;
  }>({
    editMode: false,
    editableStudentData: null,
    setEditingUserData: () => {},
  });

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
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

  const fetchStudents = async (classFilter = "", sectionFilter = "") => {
    try {
      const studentData: any = await getStudents();
      setStudents(studentData.data);
      setFilteredStudents(studentData.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents(classFilter, sectionFilter);
    setRefreshing(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchStudents();
    setLoading(false);
  }, []);

  useEffect(() => {
    // Apply filters when search query, class or section changes
    let results = students;

    if (searchQuery) {
      results = results.filter(
        (student) =>
          student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.admissionNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (classFilter) {
      results = results.filter((student) => student.class === classFilter);
    }

    if (sectionFilter) {
      results = results.filter((student) => student.section === sectionFilter);
    }

    setFilteredStudents(results);
  }, [searchQuery, classFilter, sectionFilter, students]);

  const handleImportStudents = async () => {
    // This would open a file picker in a real app
    alert(
      "In a real app, this would open a file picker to select CSV/Excel file"
    );
    setImportModalVisible(false);
  };

  const handleExportStudents = async () => {
    // This would trigger the export in a real app
    alert(
      "In a real app, this would export the current student list to CSV/Excel"
    );
    setShowActions(false);
  };

  const handleAddStudents = async (studentData: any, mode: String) => {
    setLoading(true);
    try {
      if (mode === "create") await createStudent(studentData);
      if (mode === "update" && editingUser.editableStudentData?._id) {
        await updateStudent(editingUser.editableStudentData._id, studentData);
      }
      await fetchStudents();
    } catch (err) {
      console.error("Error adding student:", err);
      alert("Failed to add student. Please try again later.");
    } finally {
      setLoading(false);
      setIsAddModalVisible(false);
    }
  };

  const handleAddClassAndSection = () => {
    setShowActions(false);
    setShowAddClassModal(true);
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    // Create full name from firstName and lastName
    const fullName = `${item.firstName} ${item.lastName}`;

    // Format date of birth to a readable format
    const formatDate = (date: any) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    // Get student age from date of birth
    const getAge = (dateOfBirth: any) => {
      if (!dateOfBirth) return "";
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    };

    const studentAge = getAge(item.dateOfBirth);

    return (
      <TouchableOpacity
        style={[styles.studentCard, { backgroundColor: colors.cardBackground }]}
        onPress={() =>
          navigation.navigate("StudentDetails", { studentId: item._id })
        }
      >
        <View style={styles.avatarContainer}>
          {item.profileImage ? (
            <Image
              source={{ uri: item.profileImage }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.accent + "30" },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.accent }]}>
                {`${item.firstName.charAt(0)}${item.lastName.charAt(0)}`}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  item.status === "Active"
                    ? colors.success
                    : colors.textSecondary,
              },
            ]}
          />
        </View>

        <View style={styles.studentInfo}>
          <Text style={[styles.studentName, { color: colors.textPrimary }]}>
            {fullName}
          </Text>

          <View style={styles.studentMeta}>
            <View style={styles.metaItem}>
              <Ionicons
                name="school-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.studentDetail, { color: colors.textSecondary }]}
              >
                {item.admissionNumber}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons
                name="bookmark-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.studentDetail, { color: colors.textSecondary }]}
              >
                Class {item.class}-{item.section}
              </Text>
            </View>

            {item.dateOfBirth && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.studentDetail,
                    { color: colors.textSecondary },
                  ]}
                >
                  {studentAge} years
                </Text>
              </View>
            )}

            {item.contactNumber && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="call-outline"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.studentDetail,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.contactNumber}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.accent + "20" },
            ]}
            onPress={() => {
              setSelectedStudent(item);
              setShowStudentDetail(true);
            }}
          >
            <Ionicons name="person" size={18} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: colors.warning + "20" },
            ]}
            onPress={() => {
              setIsAddModalVisible(true);
              setEditingUser({
                editMode: true,
                editableStudentData: item,
                setEditingUserData: () =>
                  setEditingUser({
                    editMode: false,
                    editableStudentData: null,
                    setEditingUserData: () => {},
                  }),
              });
            }}
          >
            <Ionicons name="pencil" size={18} color={colors.warning} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
              Students
            </Text>
            <Text
              style={[styles.studentCount, { color: colors.textSecondary }]}
            >
              Total: {filteredStudents.length}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: colors.cardBackground },
              ]}
              onPress={() => setShowActions(!showActions)}
            >
              <MaterialIcons
                name="more-vert"
                size={22}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.accent }]}
              onPress={() => {
                setIsAddModalVisible(true);
              }}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Student</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isAddModalVisible && (
          <AddStudentModal
            isVisible={isAddModalVisible}
            onClose={() => {
              setIsAddModalVisible(false);
              setEditingUser({
                editMode: false,
                editableStudentData: null,
                setEditingUserData: () => {},
              });
            }}
            onAddStudents={handleAddStudents}
            editStatus={editingUser}
          />
        )}

        {showActions && (
          <View
            style={[
              styles.actionsDropdown,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowActions(false);
                setImportModalVisible(true);
              }}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={20}
                color={colors.accent}
              />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>
                Import Students
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleExportStudents}
            >
              <Ionicons
                name="cloud-download-outline"
                size={20}
                color={colors.accent}
              />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>
                Export Students
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleAddClassAndSection}
            >
              <Ionicons name="add" size={20} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>
                Add Class and Sections
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {showAddClassModal && (
          <ClassSectionCreationModal
            visible={showAddClassModal}
            onClose={() => setShowAddClassModal(false)}
          />
        )}

        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search by name, roll no or email"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== "" && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: colors.cardBackground },
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="filter"
              size={20}
              color={
                showFilters || classFilter || sectionFilter
                  ? colors.accent
                  : colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View
            style={[
              styles.filtersContainer,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.filterItem}>
              <Text
                style={[styles.filterLabel, { color: colors.textSecondary }]}
              >
                Class
              </Text>
              <View style={styles.filterOptions}>
                {["IX", "X", "XI", "XII"].map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    style={[
                      styles.filterOption,
                      classFilter === cls && {
                        backgroundColor: colors.accent + "20",
                        borderColor: colors.accent,
                      },
                    ]}
                    onPress={() =>
                      setClassFilter(classFilter === cls ? "" : cls)
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        classFilter === cls && { color: colors.accent },
                      ]}
                    >
                      {cls}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text
                style={[styles.filterLabel, { color: colors.textSecondary }]}
              >
                Section
              </Text>
              <View style={styles.filterOptions}>
                {["A", "B", "C", "D"].map((section) => (
                  <TouchableOpacity
                    key={section}
                    style={[
                      styles.filterOption,
                      sectionFilter === section && {
                        backgroundColor: colors.accent + "20",
                        borderColor: colors.accent,
                      },
                    ]}
                    onPress={() =>
                      setSectionFilter(sectionFilter === section ? "" : section)
                    }
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        sectionFilter === section && { color: colors.accent },
                      ]}
                    >
                      {section}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : filteredStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No students found
            </Text>
            <Text
              style={[styles.emptySubtext, { color: colors.textSecondary }]}
            >
              Try different search criteria or clear filters
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        {showStudentDetail && (
          <StudentDetailsModal
            isVisible={showStudentDetail}
            onClose={() => {
              setShowStudentDetail(false);
              setSelectedStudent(null);
            }}
            studentId={selectedStudent?._id}
            onEditPressed = {()=>{
              setIsAddModalVisible(true);
              setEditingUser({
                editMode: true,
                editableStudentData: selectedStudent,
                setEditingUserData: () =>
                  setEditingUser({
                    editMode: false,
                    editableStudentData: null,
                    setEditingUserData: () => {},
                  }),
              });
            }}
          />
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={importModalVisible}
          onRequestClose={() => setImportModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.cardBackground },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[styles.modalTitle, { color: colors.textPrimary }]}
                >
                  Import Students
                </Text>
                <TouchableOpacity onPress={() => setImportModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.modalDescription,
                  { color: colors.textSecondary },
                ]}
              >
                You can import students from a CSV or Excel file. The file
                should have the following columns:
              </Text>

              <View
                style={[
                  styles.formatInfo,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text
                  style={[styles.formatText, { color: colors.textPrimary }]}
                >
                  name, roll_number, class, section, contact_number, email,
                  admission_date
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.accent },
                  ]}
                  onPress={handleImportStudents}
                >
                  <Text style={styles.modalButtonText}>Choose File</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={() => setImportModalVisible(false)}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      { color: colors.textPrimary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  studentCount: {
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addButton: {
    flexDirection: "row",
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  actionsDropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    zIndex: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 8,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
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
  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 8,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterItem: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    borderWidth: 1,
    borderColor: "#E1E4E8",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  studentCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
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
    fontWeight: "600",
    marginBottom: 4,
  },
  studentMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  // studentDetail: {
  //   fontSize: 12,
  //   marginRight: 12,
  // },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  formatInfo: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  formatText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cancelButtonText: {
    fontWeight: "600",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  studentDetail: {
    fontSize: 12,
    marginLeft: 4,
  },
});
