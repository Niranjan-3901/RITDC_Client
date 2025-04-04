import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from '../context/ThemeContext';
import {
    fetchAllClassAndSectionsData
} from "../redux/slices/globalSlice";

const statusOptions = ["Active", "Inactive"];

const AddStudentModal = ({
    isVisible,
    onClose,
    onAddStudents,
    editStatus = {
        editMode: false,
        editableStudentData: null,
        setEditingUserData: () => { }
    }
}) => {
    const theme = useTheme();
    const isEditing = editStatus.editMode && editStatus.editableStudentData;

    const initialStudent = {
        admissionNumber: '',
        firstName: '',
        lastName: '',
        dateOfBirth: new Date(),
        class: { id: '', name: "" },
        section: { id: '', name: "" },
        admissionDate: new Date(),
        profileImage: null,
        contactNumber: '',
        email: '',
        address: '',
        parentName: '',
        parentContact: '',
        status: 'Active',
        notes: ''
    };

    const [student, setStudent] = useState(initialStudent);

    const [classModalVisible, setClassModalVisible] = useState(false);
    const [sectionModalVisible, setSectionModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showAdmissionDatePicker, setShowAdmissionDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('date');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { allClassAndSections } = useSelector(
        (state) => state.global
    );
    const dispatch = useDispatch();

    // Set up theme colors
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
        purple: '#7E57C2',
        backgroundLight: theme === 'dark' ? '#2A2A2A' : '#F8F9FB',
    };

    // Add this helper function to find class and section objects
    const findClassAndSection = (classValue, sectionValue) => {
        const classObj = allClassAndSections.find(c => c.name === classValue);
        if (!classObj) return { class: null, section: null };

        const sectionObj = classObj.sections.find(s => s.name === sectionValue);
        return {
            class: { id: classObj.id, name: classObj.name },
            section: sectionObj ? { id: sectionObj.id, name: sectionObj.name } : null
        };
    };

    // Modify the useEffect for editing
    useEffect(() => {
        if (isEditing) {
            const { class: classValue, section: sectionValue } = editStatus.editableStudentData;
            const { class: classObj, section: sectionObj } = findClassAndSection(classValue, sectionValue);

            const editData = {
                ...editStatus.editableStudentData,
                class: classObj,
                section: sectionObj,
                dateOfBirth: editStatus.editableStudentData.dateOfBirth
                    ? new Date(editStatus.editableStudentData.dateOfBirth)
                    : new Date(),
                admissionDate: editStatus.editableStudentData.admissionDate
                    ? new Date(editStatus.editableStudentData.admissionDate)
                    : new Date()
            };
            setStudent(editData);
            // console.log("Editing Student Data:", JSON.stringify(editData, null, 2));
        }
    }, [isEditing, editStatus.editableStudentData, allClassAndSections]);

    useEffect(() => {
        dispatch(fetchAllClassAndSectionsData());
    }, [dispatch]);

    const updateStudentField = (field, value) => {
        setStudent(prev => ({
            ...prev,
            [field]: typeof value === 'string' ? value : { ...value }
        }));

        // Clear error for this field if it exists
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const handleDateChange = (event, selectedDate, index, isAdmissionDate = false) => {

        const currentDate = selectedDate ||
            (isAdmissionDate ? student.admissionDate : student.dateOfBirth);

        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            setShowAdmissionDatePicker(false);
        }

        if (selectedDate) {
            const newStudent = { ...student };
            if (isAdmissionDate) {
                newStudent.admissionDate = currentDate;
            } else {
                newStudent.dateOfBirth = currentDate;
            }
            setStudent(newStudent);
        }
    };

    const selectClass = (selectedClass) => {
        updateStudentField('class', selectedClass);
        setClassModalVisible(false);
    };

    const selectSection = (selectedSection) => {
        updateStudentField('section', selectedSection);
        setSectionModalVisible(false);
    };

    const selectStatus = (selectedStatus) => {
        updateStudentField('status', selectedStatus);
        setStatusModalVisible(false);
    };

    const handlePickImage = async (index) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert(
                "Permission Required",
                "You need to allow access to your photos to add an image."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            updateStudentField('profileImage', result.assets[0].uri);
        }
    };

    const handleTakePhoto = async (index) => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert(
                "Permission Required",
                "You need to allow access to your camera to take a photo."
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            updateStudentField('profileImage', result.assets[0].uri);
        }
    };

    const validateStudent = () => {
        const newErrors = {};
        let isValid = true;

        // Required fields validation
        if (!student.admissionNumber?.trim()) {
            newErrors.admissionNumber = "Admission number is required";
            isValid = false;
        }

        if (!student.firstName?.trim()) {
            newErrors.firstName = "First name is required";
            isValid = false;
        }

        if (!student.lastName?.trim()) {
            newErrors.lastName = "Last name is required";
            isValid = false;
        }

        const today = new Date();
        const dob = new Date(student.dateOfBirth);

        // ✅ Compare only year, month, and day
        if (
            !student.dateOfBirth ||
            (dob.getFullYear() === today.getFullYear() &&
                dob.getMonth() === today.getMonth() &&
                dob.getDate() === today.getDate())
        ) {
            newErrors.dateOfBirth = "Date of birth is required and cannot be today";
            isValid = false;
        }

        if (!student.class?.name?.trim()) {
            newErrors.class = "Class is required";
            isValid = false;
        }

        if (!student.section?.name?.trim()) {
            newErrors.section = "Section is required";
            isValid = false;
        }

        if (!student.profileImage) {
            newErrors.profileImage = "Profile image is required";
            isValid = false;
        }

        // Email validation
        if (student.email && !/\S+@\S+\.\S+/.test(student.email)) {
            newErrors.email = "Email format is invalid";
            isValid = false;
        }

        // Phone number validation
        if (student.contactNumber && !/^\d{10}$/.test(student.contactNumber.replace(/[^0-9]/g, ''))) {
            newErrors.contactNumber = "Contact number should be 10 digits";
            isValid = false;
        }

        if (student.parentContact && !/^\d{10}$/.test(student.parentContact.replace(/[^0-9]/g, ''))) {
            newErrors.parentContact = "Parent contact should be 10 digits";
            isValid = false;
        }

        if (!student.parentName?.trim()) {
            newErrors.parentName = "Parent name is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (mode) => {
        if (validateStudent()) {
            setLoading(true);

            // Format data for submission
            const formattedStudent = {
                ...student,
                dateOfBirth: student.dateOfBirth.toISOString(),
                admissionDate: student.admissionDate.toISOString(),
                classId: student.class?.id,
                sectionId: student.section?.id
            };

            onAddStudents([formattedStudent], mode);
            setLoading(false);
            resetForm();
            editStatus.setEditingUserData({
                editMode: false,
                editableStudentData: null,
                setEditingUserData: () => { }
            });
            onClose();
        }
    };

    const resetForm = () => {
        setStudent(initialStudent);
        setErrors({});
    };

    const formatDate = (date) => {
        if (!date || !(date instanceof Date)) return 'DD/MM/YYYY';
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const renderClassModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={classModalVisible}
            onRequestClose={() => setClassModalVisible(false)}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[
                    styles.pickerModalContent,
                    { backgroundColor: colors.cardBackground }
                ]}>
                    <View style={styles.pickerModalHeader}>
                        <Text style={[styles.pickerModalTitle, { color: colors.textPrimary }]}>
                            Select Class
                        </Text>
                        <TouchableOpacity onPress={() => setClassModalVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.pickerList}>
                        {allClassAndSections.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.pickerItem,
                                    student?.class?.id === item?.id && {
                                        backgroundColor: `${colors.accent}20`,
                                    }
                                ]}
                                onPress={() => selectClass(item)}
                            >
                                <Text
                                    style={[
                                        styles.pickerItemText,
                                        { color: colors.textPrimary },
                                        student?.class?.id === item?.id && {
                                            color: colors.accent,
                                            fontWeight: 'bold',
                                        }
                                    ]}
                                >
                                    {item?.name}
                                </Text>
                                {student?.class?.id === item?.id && (
                                    <Ionicons name="checkmark" size={24} color={colors.accent} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderSectionModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={sectionModalVisible}
            onRequestClose={() => setSectionModalVisible(false)}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[
                    styles.pickerModalContent,
                    { backgroundColor: colors.cardBackground }
                ]}>
                    <View style={styles.pickerModalHeader}>
                        <Text style={[styles.pickerModalTitle, { color: colors.textPrimary }]}>
                            Select Section
                        </Text>
                        <TouchableOpacity onPress={() => setSectionModalVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pickerGrid}>
                        {/* {console.log("Sections: ", allClassAndSections.filter(cls => cls.id === students[currentIndex]?.class?.id)[0]?.sections)} */}
                        {allClassAndSections.filter(cls => cls.id === student?.class?.id)[0]?.sections?.map((item, index) => (
                            <TouchableOpacity
                                key={item?.id}
                                style={[
                                    styles.sectionItem,
                                    { borderColor: colors.border },
                                    student?.section?.id === item?.id && {
                                        backgroundColor: colors.accent,
                                        borderColor: colors.accent,
                                    }
                                ]}
                                onPress={() => selectSection(item)}
                            >
                                <Text
                                    style={[
                                        styles.sectionItemText,
                                        { color: colors.textPrimary },
                                        student?.section?.id === item?.id && {
                                            color: '#FFFFFF',
                                        }
                                    ]}
                                >
                                    {item?.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderStatusModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={statusModalVisible}
            onRequestClose={() => setStatusModalVisible(false)}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[
                    styles.pickerModalContent,
                    { backgroundColor: colors.cardBackground }
                ]}>
                    <View style={styles.pickerModalHeader}>
                        <Text style={[styles.pickerModalTitle, { color: colors.textPrimary }]}>
                            Select Status
                        </Text>
                        <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statusOptions}>
                        {statusOptions.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.statusItem,
                                    {
                                        backgroundColor: item === 'Active' ?
                                            `${colors.success}20` :
                                            `${colors.warning}20`,
                                        borderColor: item === 'Active' ?
                                            colors.success :
                                            colors.warning
                                    },
                                    student?.status === item && {
                                        backgroundColor: item === 'Active' ?
                                            colors.success :
                                            colors.warning,
                                    }
                                ]}
                                onPress={() => selectStatus(item)}
                            >
                                <Ionicons
                                    name={item === 'Active' ? "checkmark-circle" : "alert-circle"}
                                    size={24}
                                    color={
                                        student?.status === item
                                            ? '#FFFFFF'
                                            : item === 'Active'
                                                ? colors.success
                                                : colors.warning
                                    }
                                />
                                <Text
                                    style={[
                                        styles.statusItemText,
                                        {
                                            color: student?.status === item
                                                ? '#FFFFFF'
                                                : item === 'Active'
                                                    ? colors.success
                                                    : colors.warning
                                        },
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );

    const getClassNameById = (cId) => {
        if (cId) {
            return allClassAndSections.find(cls => cls.id === cId)?.name;
        }
        else {
            return null;
        }
    }

    const getSectionNameById = (sId) => {
        if (sId) {
            let filterd = allClassAndSections.filter(cas => cas.sections?.find(sec => sec?.id === sId)?.name)
            if (filterd.length > 0) {
                return filterd[0].sections?.find(sec => sec?.id === sId)?.name;
            }
        }
        else {
            return null;
        }
    }

    const renderStudentForm = (student) => (
        <View
            style={[
                styles.studentCard,
                {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                }
            ]}
        >
            {!isEditing && (
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => resetForm()}
                >
                    <MaterialIcons
                        name="restart-alt"
                        size={24}
                        color={colors.textPrimary}
                    />
                    <Text>RESET</Text>
                </TouchableOpacity>
            )}

            {/* Card Title */}
            <View style={styles.cardTitleContainer}>
                <Ionicons name="school" size={24} color={colors.accent} />
                <Text style={[styles.cardTitle, { color: colors.accent }]}>
                    {isEditing ? "Edit Student" : "Student"}
                </Text>
            </View>

            {/* Profile Image Section */}
            <View style={styles.imageSection}>
                {student.profileImage ? (
                    <Image
                        source={{ uri: student.profileImage }}
                        style={styles.profileImage}
                    />
                ) : (
                    <View
                        style={[
                            styles.profileImagePlaceholder,
                            { backgroundColor: `${colors.accent}20` }
                        ]}
                    >
                        <FontAwesome5
                            name="user-graduate"
                            size={40}
                            color={colors.accent}
                        />
                    </View>
                )}

                <View style={styles.imageButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.imageButton, { backgroundColor: colors.purple }]}
                        onPress={() => handlePickImage()}
                    >
                        <Ionicons name="images" size={18} color="#FFFFFF" />
                        <Text style={styles.imageButtonText}>Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.imageButton, { backgroundColor: colors.accent }]}
                        onPress={() => handleTakePhoto()}
                    >
                        <Ionicons name="camera" size={18} color="#FFFFFF" />
                        <Text style={styles.imageButtonText}>Camera</Text>
                    </TouchableOpacity>
                </View>

                {errors.profileImage && (
                    <Text style={[styles.errorText, { color: colors.danger }]}>
                        {errors.profileImage}
                    </Text>
                )}
            </View>

            {/* Admission Number */}
            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.accent }]}>
                    Admission Number*
                </Text>
                <View
                    style={[
                        styles.inputWithIcon,
                        {
                            backgroundColor: colors.backgroundLight,
                            borderColor: errors.admissionNumber ? colors.danger : colors.border
                        }
                    ]}
                >
                    <TextInput
                        placeholder="Admission Number"
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.inputText, { color: colors.textPrimary }]}
                        value={student.admissionNumber}
                        onChangeText={(text) => {
                            if (!isEditing || !student.admissionNumber) {
                                updateStudentField('admissionNumber', text);
                            }
                        }}
                    />
                    <MaterialIcons name="badge" size={22} color={colors.textSecondary} />
                </View>
                {errors.admissionNumber && (
                    <Text style={[styles.errorText, { color: colors.danger }]}>
                        {errors.admissionNumber}
                    </Text>
                )}
            </View>

            {/* Student Name (First and Last) */}
            <View style={styles.rowContainer}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.inputLabel, { color: colors.accent }]}>
                        First Name*
                    </Text>
                    <View
                        style={[
                            styles.inputWithIcon,
                            {
                                backgroundColor: colors.backgroundLight,
                                borderColor: errors.firstName ? colors.danger : colors.border
                            }
                        ]}
                    >
                        <TextInput
                            placeholder="First Name"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.inputText, { color: colors.textPrimary }]}
                            value={student.firstName}
                            onChangeText={(text) => updateStudentField('firstName', text)}
                        />
                        <Ionicons name="person" size={22} color={colors.textSecondary} />
                    </View>
                    {errors.firstName && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>
                            {errors.firstName}
                        </Text>
                    )}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: colors.accent }]}>
                        Last Name*
                    </Text>
                    <View
                        style={[
                            styles.inputWithIcon,
                            {
                                backgroundColor: colors.backgroundLight,
                                borderColor: errors.lastName ? colors.danger : colors.border
                            }
                        ]}
                    >
                        <TextInput
                            placeholder="Last Name"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.inputText, { color: colors.textPrimary }]}
                            value={student.lastName}
                            onChangeText={(text) => updateStudentField('lastName', text)}
                        />
                        <Ionicons name="person" size={22} color={colors.textSecondary} />
                    </View>
                    {errors.lastName && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>
                            {errors.lastName}
                        </Text>
                    )}
                </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.accent }]}>
                    Date of Birth
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        setCurrentIndex(0);
                        setDatePickerMode('date');
                        setShowDatePicker(true);
                    }}
                    style={[
                        styles.inputWithIcon,
                        { backgroundColor: colors.backgroundLight }
                    ]}
                >
                    <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                        {formatDate(student.dateOfBirth)}
                    </Text>
                    <MaterialIcons name="cake" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Class & Section */}
            <View style={styles.rowContainer}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.inputLabel, { color: colors.accent }]}>
                        Class*
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            setCurrentIndex(0);
                            setClassModalVisible(true);
                        }}
                        style={[
                            styles.inputWithIcon,
                            {
                                backgroundColor: colors.backgroundLight,
                                borderColor: errors.class ? colors.danger : colors.border
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.inputText,
                                { color: student?.class ? colors.textPrimary : colors.textSecondary }
                            ]}
                        >
                            {student?.class?.name || "Select Class"}
                        </Text>
                        <Ionicons name="chevron-down" size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {errors.class && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>
                            {errors.class}
                        </Text>
                    )}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: colors.accent }]}>
                        Section*
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            setCurrentIndex(0);
                            setSectionModalVisible(true);
                        }}
                        style={[
                            styles.inputWithIcon,
                            {
                                backgroundColor: colors.backgroundLight,
                                borderColor: errors.section ? colors.danger : colors.border
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.inputText,
                                { color: student?.section ? colors.textPrimary : colors.textSecondary }
                            ]}
                        >
                            {student?.section?.name || "Select Section"}
                        </Text>
                        <Ionicons name="chevron-down" size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {errors.section && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>
                            {errors.section}
                        </Text>
                    )}
                </View>
            </View>

            {/* <View style={styles.rowContainer}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.inputLabel, { color: colors.accent }]}>Class*</Text>
                    <View style={[styles.pickerContainer, { borderColor: errors.class ? colors.danger : colors.border }]}>
                        <Picker
                            selectedValue={student?.class?.id || ""}
                            onValueChange={(itemValue) => {
                                const selectedClass = allClassAndSections?.find(cls => cls.id === itemValue);
                                selectClass(selectedClass);
                            }}
                            style={{ color: colors.textPrimary }}
                        >
                            <Picker.Item label="Select Class" value="" />
                            {allClassAndSections?.map((cls) => (
                                <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
                            ))}
                        </Picker>
                    </View>
                    {errors.class && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>{errors.class}</Text>
                    )}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: colors.accent }]}>Section*</Text>
                    <View style={[styles.pickerContainer, { borderColor: errors.section ? colors.danger : colors.border }]}>
                        <Picker
                            selectedValue={student?.section?.id || ""}
                            onValueChange={(itemValue) => {
                                const selectedSection = allClassAndSections
                                    ?.find(cls => cls.id === student?.class?.id)
                                    ?.sections.find(sec => sec.id === itemValue);
                                selectSection(selectedSection);
                            }}
                            enabled={!!student?.class?.id} // Disable if class not selected
                            style={{ color: colors.textPrimary }}
                        >
                            <Picker.Item label="Select Section" value="" />
                            {student?.class?.id &&
                                allClassAndSections
                                    ?.find(cls => cls.id === student?.class?.id)
                                    ?.sections.map((sec) => (
                                        <Picker.Item key={sec.id} label={sec.name} value={sec.id} />
                                    ))}
                        </Picker>
                    </View>
                    {errors.section && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>{errors.section}</Text>
                    )}
                </View>
            </View> */}

            {/* Admission Date */}
            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.accent }]}>
                    Admission Date
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        setCurrentIndex(0);
                        setDatePickerMode('date');
                        setShowAdmissionDatePicker(true);
                    }}
                    style={[
                        styles.inputWithIcon,
                        { backgroundColor: colors.backgroundLight }
                    ]}
                >
                    <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                        {formatDate(student.admissionDate)}
                    </Text>
                    <MaterialIcons name="event" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Status Selection */}
            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.accent }]}>
                    Status
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        setCurrentIndex(0);
                        setStatusModalVisible(true);
                    }}
                    style={[
                        styles.inputWithIcon,
                        { backgroundColor: colors.backgroundLight }
                    ]}
                >
                    <View style={styles.statusIndicator}>
                        <View style={[
                            styles.statusDot,
                            {
                                backgroundColor: student.status === 'Active'
                                    ? colors.success
                                    : colors.warning
                            }
                        ]} />
                        <Text style={[styles.inputText, { color: colors.textPrimary }]}>
                            {student.status}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Contact Information Section */}
            <View style={styles.sectionHeader}>
                <Ionicons name="call" size={22} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Contact Information
                </Text>
            </View>

            {/* Contact Number & Email */}
            <View style={styles.rowContainer}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.inputLabel, { color: colors.accent }]}>
                        Contact Number
                    </Text>
                    <View
                        style={[
                            styles.inputWithIcon,
                            {
                                backgroundColor: colors.backgroundLight,
                                borderColor: errors.contactNumber ? colors.danger : colors.border
                            }
                        ]}
                    >
                        <TextInput
                            placeholder="Phone Number"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.inputText, { color: colors.textPrimary }]}
                            value={student.contactNumber}
                            onChangeText={(text) => updateStudentField('contactNumber', text)}
                            keyboardType="phone-pad"
                        />
                        <MaterialIcons name="phone" size={22} color={colors.textSecondary} />
                    </View>
                    {errors.contactNumber && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>
                            {errors.contactNumber}
                        </Text>
                    )}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: colors.accent }]}>
                        Email
                    </Text>
                    <View
                        style={[
                            styles.inputWithIcon,
                            {
                                backgroundColor: colors.backgroundLight,
                                borderColor: errors.email ? colors.danger : colors.border
                            }
                        ]}
                    >
                        <TextInput
                            placeholder="Email Address"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.inputText, { color: colors.textPrimary }]}
                            value={student.email}
                            onChangeText={(text) => updateStudentField('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <MaterialIcons name="email" size={22} color={colors.textSecondary} />
                    </View>
                    {errors.email && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>
                            {errors.email}
                        </Text>
                    )}
                </View>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.accent }]}>
                    Address
                </Text>
                <View
                    style={[
                        styles.inputWithIcon,
                        { backgroundColor: colors.backgroundLight, height: 80 }
                    ]}
                >
                    <TextInput
                        placeholder="Street Address"
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.inputText, { color: colors.textPrimary, height: 80, textAlignVertical: 'top' }]}
                        value={student.address}
                        onChangeText={(text) => updateStudentField('address', text)}
                        multiline={true}
                        numberOfLines={3}
                    />
                    <MaterialIcons
                        name="home"
                        size={22}
                        color={colors.textSecondary}
                        style={{ alignSelf: 'flex-start', marginTop: 12 }}
                    />
                </View>
            </View>

            {/* Parent Information Section */}
            <View style={styles.sectionHeader}>
                <FontAwesome5 name="user-friends" size={20} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    Parent Information
                </Text>
            </View>

            {/* Parent Name & Contact */}
            <View style={styles.rowContainer}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.inputLabel, { color: colors.accent }]}>
                        Parent Name
                    </Text>
                    <View
                        style={[
                            styles.inputWithIcon,
                            { backgroundColor: colors.backgroundLight }
                        ]}
                    >
                        <TextInput
                            placeholder="Parent/Guardian Name"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.inputText, { color: colors.textPrimary }]}
                            value={student.parentName}
                            onChangeText={(text) => updateStudentField('parentName', text)}
                        />
                        <Ionicons name="person" size={22} color={colors.textSecondary} />
                    </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: colors.accent }]}>
                        Parent Contact
                    </Text>
                    <View
                        style={[
                            styles.inputWithIcon,
                            {
                                backgroundColor: colors.backgroundLight,
                                borderColor: errors.parentContact ? colors.danger : colors.border
                            }
                        ]}
                    >
                        <TextInput
                            placeholder="Parent Phone"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.inputText, { color: colors.textPrimary }]}
                            value={student.parentContact}
                            onChangeText={(text) => updateStudentField('parentContact', text)}
                            keyboardType="phone-pad"
                        />
                        <MaterialIcons name="phone" size={22} color={colors.textSecondary} />
                    </View>
                    {errors.parentContact && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>
                            {errors.parentContact}
                        </Text>
                    )}
                </View>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.accent }]}>
                    Notes
                </Text>
                <View
                    style={[
                        styles.inputWithIcon,
                        { backgroundColor: colors.backgroundLight, height: 100 }
                    ]}
                >
                    <TextInput
                        placeholder="Additional notes or comments"
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.inputText, { color: colors.textPrimary, height: 100, textAlignVertical: 'top' }]}
                        value={student.notes}
                        onChangeText={(text) => updateStudentField('notes', text)}
                        multiline={true}
                        numberOfLines={4}
                    />
                    <MaterialIcons
                        name="note"
                        size={22}
                        color={colors.textSecondary}
                        style={{ alignSelf: 'flex-start', marginTop: 12 }}
                    />
                </View>
            </View>
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoiding}
            >
                <View style={[
                    styles.modalOverlay,
                    { backgroundColor: 'rgba(0,0,0,0.5)' }
                ]}>
                    <View style={[
                        styles.modalContent,
                        { backgroundColor: colors.background }
                    ]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                                {isEditing ? "Edit Student" : "Add New Student"}
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* Modal Body - Scrollable Content */}
                        <ScrollView style={styles.scrollView}>
                            {renderStudentForm(student)}
                        </ScrollView>

                        {/* Modal Footer - Action Buttons */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[
                                    styles.cancelButton,
                                    { backgroundColor: `${colors.danger}20`, borderColor: colors.danger }
                                ]}
                                onPress={onClose}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.danger }]}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    { backgroundColor: colors.accent }
                                ]}
                                onPress={() => handleSubmit(!isEditing ? "create" : "update")}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveButtonText}>
                                        {isEditing ? "Update" : "Save"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Modals for selection */}
            {renderClassModal()}
            {renderSectionModal()}
            {renderStatusModal()}

            {/* Date Pickers */}
            {(Platform.OS === 'ios' && showDatePicker) && (
                <View style={[styles.datePickerContainer, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.datePickerHeader}>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <Text style={{ color: colors.danger }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                        >
                            <Text style={{ color: colors.accent }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={student.dateOfBirth}
                        mode={datePickerMode}
                        display="spinner"
                        onChange={(event, date) => handleDateChange(event, date, 0)}
                        style={{ backgroundColor: colors.cardBackground }}
                        textColor={colors.textPrimary}
                    />
                </View>
            )}

            {(Platform.OS === 'ios' && showAdmissionDatePicker) && (
                <View style={[styles.datePickerContainer, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.datePickerHeader}>
                        <TouchableOpacity onPress={() => setShowAdmissionDatePicker(false)}>
                            <Text style={{ color: colors.danger }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowAdmissionDatePicker(false)}
                        >
                            <Text style={{ color: colors.accent }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={student.admissionDate}
                        mode={datePickerMode}
                        display="spinner"
                        onChange={(event, date) => handleDateChange(event, date, 0, true)}
                        style={{ backgroundColor: colors.cardBackground }}
                        textColor={colors.textPrimary}
                    />
                </View>
            )}

            {(Platform.OS === 'android' && showDatePicker) && (
                <DateTimePicker
                    value={student.dateOfBirth}
                    mode={datePickerMode}
                    is24Hour={true}
                    display="default"
                    onChange={(event, date) => handleDateChange(event, date, 0)}
                />
            )}

            {(Platform.OS === 'android' && showAdmissionDatePicker) && (
                <DateTimePicker
                    value={student.admissionDate}
                    mode={datePickerMode}
                    is24Hour={true}
                    display="default"
                    onChange={(event, date) => handleDateChange(event, date, 0, true)}
                />
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    keyboardAvoiding: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '95%',
        maxHeight: '90%',
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        elevation: 10,
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollView: {
        padding: 16,
    },
    studentCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
    },
    removeButton: {
        position: 'absolute',
        top: 12,
        right: 15,
        zIndex: 10,
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F44336',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderWidth: 1,
        gap: 0
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 12,
    },
    profileImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    imageButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginHorizontal: 6,
    },
    pickerContainer: {
        // backgroundColor: colors.backgroundLight,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    imageButtonText: {
        color: '#FFFFFF',
        marginLeft: 6,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    inputText: {
        display: "flex",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: '100%',
    },
    dateText: {
        flex: 1,
        paddingVertical: 12,
    },
    rowContainer: {
        flexDirection: 'row',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    pickerModalContent: {
        width: '80%',
        maxHeight: '70%',
        borderRadius: 16,
        padding: 16,
    },
    pickerModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    pickerModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    pickerList: {
        maxHeight: 400,
    },
    pickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    pickerItemText: {
        fontSize: 16,
    },
    pickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    sectionItem: {
        width: '18%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 6,
        borderWidth: 1,
    },
    sectionItemText: {
        fontSize: 16,
        fontWeight: '600',
    },
    statusOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        width: '45%',
        borderWidth: 1,
    },
    statusItemText: {
        marginLeft: 8,
        fontWeight: '600',
    },
    datePickerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E1E4E8',
    },
    cancelButton: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginLeft: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default AddStudentModal;