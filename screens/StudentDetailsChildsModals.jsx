import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Animated 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar, Edit, X, PlusCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllClassAndSectionsData } from "../redux/slices/globalSlice";

const getThemedColors = (theme) => ({
  background: theme === "dark" ? "#121212" : "#F5F7FA",
  cardBackground: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
  textPrimary: theme === "dark" ? "#FFFFFF" : "#333333",
  textSecondary: theme === "dark" ? "#AAAAAA" : "#666666",
  border: theme === "dark" ? "#333333" : "#E1E4E8",
  accent: "#4A6FFF",
  success: "#4CAF50",
  warning: "#FFC107",
  danger: "#F44336",
  accentLight: "#E6EAFA"
});

// Fee Record Modal Component
const FeeRecordModal = ({ isVisible, onClose, studentId }) => {
  const { theme } = useTheme();
  const colors = getThemedColors(theme);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(300);

  const [feeDetails, setFeeDetails] = useState({
    feeAmount: '',
    status: 'unpaid',
    nextPaymentDate: '',
    academicYear: '',
    term: ''
  });

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [isVisible]);

  const handleSaveFeeRecord = () => {
    // Implement fee record saving logic
    console.log('Saving Fee Record:', feeDetails);
    onClose();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalContainer: {
      width: '90%',
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 15
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.accentLight
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textPrimary,
      flex: 1
    },
    formContainer: {
      padding: 20
    },
    inputGroup: {
      marginBottom: 15
    },
    inputLabel: {
      fontSize: 14,
      marginBottom: 8,
      color: colors.textSecondary,
      fontWeight: '600'
    },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      borderColor: colors.border,
      backgroundColor: colors.accentLight
    },
    pickerContainer: {
      borderWidth: 1,
      borderRadius: 10,
      borderColor: colors.border,
      backgroundColor: colors.accentLight
    },
    saveButton: {
      backgroundColor: colors.accent,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5
    },
    saveButtonText: {
      color: 'white',
      fontWeight: 'bold',
      marginLeft: 10
    }
  });

  return (
    <Modal 
      visible={isVisible} 
      transparent={true} 
      animationType="fade"
    >
      <Animated.View 
        style={[
          styles.modalOverlay, 
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContainer, 
            { 
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Fee Record</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={colors.textPrimary} size={24} />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fee Amount</Text>
              <TextInput 
                value={feeDetails.feeAmount}
                onChangeText={(text) => setFeeDetails({...feeDetails, feeAmount: text})}
                placeholder="Enter Fee Amount"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Status</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={feeDetails.status}
                  onValueChange={(itemValue) => setFeeDetails({...feeDetails, status: itemValue})}
                >
                  <Picker.Item label="Unpaid" value="unpaid" />
                  <Picker.Item label="Partial" value="partial" />
                  <Picker.Item label="Paid" value="paid" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Next Payment Date</Text>
              <TextInput 
                value={feeDetails.nextPaymentDate}
                onChangeText={(text) => setFeeDetails({...feeDetails, nextPaymentDate: text})}
                placeholder="DD/MM/YYYY"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Academic Year</Text>
              <TextInput 
                value={feeDetails.academicYear}
                onChangeText={(text) => setFeeDetails({...feeDetails, academicYear: text})}
                placeholder="e.g. 2023-2024"
                style={styles.input}
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveFeeRecord}
            >
              <PlusCircle color="white" size={20} />
              <Text style={styles.saveButtonText}>Save Fee Record</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Change Class Modal Component
const ChangeClassModal = ({ 
    isVisible, 
    onClose, 
    currentClass, 
    currentSection 
  }) => {
    const { theme } = useTheme();
    const colors = getThemedColors(theme);
  
    // Animation values
    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(300);
  
    const [selectedClass, setSelectedClass] = useState(currentClass);
    const [selectedSection, setSelectedSection] = useState(currentSection);
    
    const { allClassAndSections } = useSelector(
      (state) => state.global
    );
    const dispatch = useDispatch();
  
    useEffect(() => {
      dispatch(fetchAllClassAndSectionsData());
    }, [dispatch]);
  
    // Initialize selected class and section when modal opens
    // useEffect(() => {
    //   if (isVisible) {
    //     setSelectedClass(currentClass?.id || null);
    //     setSelectedSection(currentSection?.id || null);
    //   }
    // }, [isVisible, currentClass, currentSection]);
  
    useEffect(() => {
      if (isVisible) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          })
        ]).start();
      }
    }, [isVisible]);
  
    const handleClassChange = () => {
      console.log('Changing class to:', selectedClass);
      console.log('Changing section to:', selectedSection);
      onClose();
    };
  
    // Find sections for the selected class
    const getSectionsForSelectedClass = () => {
      const selectedClassObj = allClassAndSections.find(c => c.id === selectedClass);
      return selectedClassObj ? selectedClassObj.sections : [];
    };
  
    const styles = StyleSheet.create({
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center'
      },
      modalContainer: {
        width: '90%',
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 15
      },
      modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.accentLight
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        flex: 1
      },
      formContainer: {
        padding: 20
      },
      inputGroup: {
        marginBottom: 15
      },
      inputLabel: {
        fontSize: 14,
        marginBottom: 8,
        color: colors.textSecondary,
        fontWeight: '600'
      },
      pickerContainer: {
        borderWidth: 1,
        borderRadius: 10,
        borderColor: colors.border,
        backgroundColor: colors.accentLight,
        marginBottom: 10
      },
      saveButton: {
        backgroundColor: colors.accent,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5
      },
      saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 10
      },
      currentClassInfo: {
        backgroundColor: colors.accentLight,
        padding: 15,
        borderRadius: 10,
        marginBottom: 15
      },
      currentClassText: {
        color: colors.textSecondary,
        fontSize: 14
      }
    });
  
    return (
      <Modal 
        visible={isVisible} 
        transparent={true} 
        animationType="fade"
        onRequestClose={onClose}
      >
        <Animated.View 
          style={[
            styles.modalOverlay, 
            { opacity: fadeAnim }
          ]}
        >
          <Animated.View 
            style={[
              styles.modalContainer, 
              { 
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Class & Section</Text>
              <TouchableOpacity onPress={onClose}>
                <X color={colors.textPrimary} size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              contentContainerStyle={styles.formContainer}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.currentClassInfo}>
                <Text style={styles.currentClassText}>
                  Current Class: {currentClass?.name || 'N/A'}
                </Text>
                <Text style={styles.currentClassText}>
                  Current Section: {currentSection?.name || 'N/A'}
                </Text>
              </View>
  
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Class</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedClass}
                    onValueChange={(itemValue) => {
                      setSelectedClass(itemValue);
                      console.log(itemValue);
                      // Reset section when class changes
                      setSelectedSection(null);
                    }}
                    mode="dropdown" // Add this to prevent modal closing
                  >
                    <Picker.Item label="Select a Class" value={null} />
                    {allClassAndSections.map((classItem) => (
                      <Picker.Item 
                        key={classItem.id} 
                        label={classItem.name} 
                        value={classItem.id} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>
  
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Section</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedSection}
                    onValueChange={(itemValue) => setSelectedSection(itemValue)}
                    enabled={selectedClass !== null}
                    mode="dropdown" // Add this to prevent modal closing
                  >
                    {selectedClass === null ? (
                      <Picker.Item label="Select a Class First" value={null} />
                    ) : getSectionsForSelectedClass().length > 0 ? (
                      getSectionsForSelectedClass().map(section => (
                        <Picker.Item 
                          key={section.id} 
                          label={section.name} 
                          value={section.id} 
                        />
                      ))
                    ) : (
                      <Picker.Item label="No sections available" value={null} />
                    )}
                  </Picker>
                </View>
              </View>
  
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleClassChange}
                disabled={!selectedClass || !selectedSection}
              >
                <Edit color="white" size={20} />
                <Text style={styles.saveButtonText}>Update Class</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

export { FeeRecordModal, ChangeClassModal };