import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { fetchAllClassAndSectionsData } from "../redux/slices/globalSlice";
import { showAlert, useAlert } from '../utils/Alert/AlertManager';
import { addSectionInAClass, createClass, deleteClass, deleteSection, updateClass, updateSection } from '../services/apiService';


export const ChangeStudentClassModal = ({
    visible,
    onClose,
    studentData,
    // onSave
}) => {
    // Theme colors
    const {showAlert} = useAlert()
    const theme = useTheme()
    const colors = getThemedColors(theme);

    // Form state
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [availableSections, setAvailableSections] = useState([]);

    const { allClassAndSections } = useSelector(
        (state) => state.global
    );
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAllClassAndSectionsData());
    }, [dispatch]);

    // Set initial values when student data changes
    useEffect(() => {
        if (studentData && allClassAndSections.length > 0) {
            const currentClass = allClassAndSections.find(c => c.id === studentData.class?.id);
            setSelectedClass(currentClass?.id || null);

            if (currentClass?.sections?.length > 0) {
                setAvailableSections(currentClass.sections);
                setSelectedSection(studentData.section?.id || null);
            } else {
                setAvailableSections([]);
                setSelectedSection(null);
            }
        }
    }, [studentData, visible]);

    // Update available sections when class changes
    useEffect(() => {
        if (selectedClass) {
            const classData = allClassAndSections.find(c => c.id === selectedClass);
            if (classData?.sections) {
                setAvailableSections(classData.sections);
                setSelectedSection(classData.sections.length > 0 ? classData.sections[0].id : null);
            } else {
                setAvailableSections([]);
                setSelectedSection(null);
            }
        }
    }, [selectedClass]);

    // Handle save
    const handleSave = () => {
        if (!selectedClass || !selectedSection) {
            showAlert({title: "Error", message:"Please select both a class and section"});
            return;
        }

        const classData = allClassAndSections.find(c => c.id === selectedClass);
        const sectionData = availableSections.find(s => s.id === selectedSection);

        // onSave({
        //     studentId: studentData.id,
        //     classId: selectedClass,
        //     sectionId: selectedSection,
        //     // Include class and section details for UI display
        //     className: classData?.name,
        //     sectionName: sectionData?.name
        // });

        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[styles.centeredView, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.modalView, { backgroundColor: colors.cardBackground }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Change Class/Section</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Student Info Banner */}
                    <View style={[styles.studentBanner, { backgroundColor: colors.accentLight }]}>
                        <Text style={[styles.studentName, { color: colors.textPrimary }]}>{studentData?.name || 'Student'}</Text>
                        <View style={styles.studentDetails}>
                            <Text style={[styles.studentDetail, { color: colors.textSecondary }]}>
                                Current Class: {studentData?.class?.name || 'None'}
                            </Text>
                            <Text style={[styles.studentDetail, { color: colors.textSecondary }]}>
                                Current Section: {studentData?.section?.name || 'None'}
                            </Text>
                        </View>
                    </View>

                    {/* Form Content */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>New Class</Text>
                            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                                <Picker
                                    selectedValue={selectedClass}
                                    onValueChange={(value) => setSelectedClass(value)}
                                    style={{ color: colors.textPrimary }}
                                    enabled={allClassAndSections.length > 0}
                                >
                                    <Picker.Item label="Select a class" value={null} />
                                    {allClassAndSections.map(classItem => (
                                        <Picker.Item
                                            key={classItem.id}
                                            label={classItem.name}
                                            value={classItem.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            {allClassAndSections.length === 0 && (
                                <Text style={[styles.errorText, { color: colors.danger }]}>
                                    No allClassAndSections available. Please create a class first.
                                </Text>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>New Section</Text>
                            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                                <Picker
                                    selectedValue={selectedSection}
                                    onValueChange={(value) => setSelectedSection(value)}
                                    style={{ color: colors.textPrimary }}
                                    enabled={availableSections.length > 0}
                                >
                                    <Picker.Item label="Select a section" value={null} />
                                    {availableSections.map(section => (
                                        <Picker.Item
                                            key={section.id}
                                            label={section.name}
                                            value={section.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            {selectedClass && availableSections.length === 0 && (
                                <Text style={[styles.errorText, { color: colors.danger }]}>
                                    No sections available for this class. Please add sections first.
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Footer with action buttons */}
                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { borderColor: colors.danger }]}
                            onPress={onClose}
                        >
                            <Text style={{ color: colors.danger }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.saveButton,
                                { backgroundColor: colors.accent },
                                (!selectedClass || !selectedSection) && { opacity: 0.5 }
                            ]}
                            onPress={handleSave}
                            disabled={!selectedClass || !selectedSection}
                        >
                            <Text style={{ color: "#FFFFFF" }}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export const ClassSectionCreationModal = ({
    visible,
    onClose
}) => {
    const theme = useTheme()
    const colors = getThemedColors(theme);

    const [activeTab, setActiveTab] = useState('class');
    const [className, setClassName] = useState('');
    const [sections, setSections] = useState([{ id: Date.now(), value: '' }]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);
    const [sectionToDelete, setSectionToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteStateLoader, setDeleteStateLoader] = useState(false);

    const { allClassAndSections } = useSelector(
        (state) => state.global
    );
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAllClassAndSectionsData());
    }, [dispatch]);

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            setClassName('');
            setSections([{ id: Date.now(), value: '' }]);
            setSelectedClass(allClassAndSections.length > 0 ? allClassAndSections[0].id : null);
            setIsEditing(false);
            setClassToDelete(null);
            setSectionToDelete(null);
        }
    }, [visible, allClassAndSections]);

    // Add a new section input field
    const addSectionField = () => {
        setSections([...sections, { id: Date.now(), value: '' }]);
    };

    // Remove a section input field
    const removeSectionField = (id) => {
        if (sections.length > 1) {
            setSections(sections.filter(section => section.id !== id));
        }
    };

    // Update section value
    const updateSectionValue = (id, value) => {
        setSections(sections.map(section =>
            section.id === id ? { ...section, value } : section
        ));
    };

    // Handle save class
    const handleSaveClass = async () => {
        if (!className.trim()) {
            showAlert({title: "Error", message:"Please enter a class name"});
            return;
        }
        setIsLoading(true);
        if (isEditing && classToDelete) {
            try {
                const res = await updateClass(classToDelete, { name: className });
                if (res.success) {
                    showAlert({title: "Success", message:"Class updated successfully"});
                    setIsEditing(false);
                    setClassToDelete(null);
                    setClassName('');
                    dispatch(fetchAllClassAndSectionsData());
                }
                else {
                    // Alert.alert("Error", "Failed to update class: " + res.message);
                    showAlert({title: "Error", message:`Failed to update class: ${res.message}`});
                }
            } catch (e) {
                // Alert.alert("Error", "Failed to update class: " + e.message);
                showAlert({title: "Error", message:`Failed to update class: ${e.message}`});
            }
            finally {
                setIsLoading(false);
            }
        } else {
            try {
                const res = await createClass(className);
                if (res.success) {
                    // Alert.alert("Success", "Class created successfully");
                    showAlert({title: "Success", message:`Class created successfully`});
                    setClassName('');
                    dispatch(fetchAllClassAndSectionsData());
                }
                else {
                    // Alert.alert("Error", "Failed to create class: " + res.message);
                    showAlert({title: "Error", message:`Failed to create class: ${res.message}`});
                }
            }
            catch (e) {
                // Alert.alert("Error", "Failed to create class: " + e.message);
                showAlert({title: "Error", message:`Failed to create class: ${res.message}`});
            }
            finally {
                setIsLoading(false);
            }
        }
    };

    // Handle save sections
    const handleSaveSections = async () => {
        const validSections = sections.filter(section => section.value.trim() !== '');

        if (validSections.length === 0) {
            // Alert.alert("Error", "Please enter at least one section name");
            showAlert({title: "Error", message:`Please enter at least one section name`});
            return;
        }

        if (!selectedClass) {
            // Alert.alert("Error", "Please select a class");
            showAlert({title: "Error", message:`Please select a class`});
            return;
        }
        setIsLoading(true);
        if (isEditing && sectionToDelete) {
            try {
                const res = await updateSection(sectionToDelete, { name: sections[0].value });
                if (res.success) {
                    // Alert.alert("Success", "Section updated successfully");
                    showAlert({title: "Success", message:`Section updated successfully`});
                    setIsEditing(false);
                    setSectionToDelete(null);
                }
                else {
                    // Alert.alert("Error", "Failed to update section: " + res.message);
                    showAlert({title: "Error", message:`Failed to update section: ${res.message}`});
                }
            }
            catch (e) {
                // Alert.alert("Error", "Failed to update section: " + e.message);
                showAlert({title: "Error", message:`Failed to update section: ${e.message}`});
            }
            finally {
                setIsLoading(false);
            }
        } else {
            try {
                const res = await addSectionInAClass(selectedClass, { sections: validSections.map(section => section.value) });
                if (res.success) {
                    // Alert.alert("Success", "Sections created successfully");
                    showAlert({title: "Success", message:`Sections created successfully`});
                }
                else {
                    // Alert.alert("Error", "Failed to create sections: " + res.message);
                    showAlert({title: "Error", message:`Failed to create sections: ${res.message}`});
                }
            } catch (error) {
                // Alert.alert("Error", "Failed to create sections: " + error.message);
                showAlert({title: "Error", message:`Failed to create sections: ${error.message}`});
            }
            finally {
                setIsLoading(false);
            }
        }

        setSections([{ id: Date.now(), value: '' }]);
        dispatch(fetchAllClassAndSectionsData());
    };

    // Handle delete class confirmation
    const confirmDeleteClass = (classId) => {
        Alert.alert(
            "Delete Class",
            "Are you sure you want to delete this class? This will also delete all sections in this class.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDeleteClass(classId)
                }
            ]
        );
    };

    const managerLoader = (status) => (
        status && (<View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={{ color: "#FFFFFF", marginTop: 10, fontWeight: '500' }}>Processing...</Text>
        </View>))

    // Handle delete class
    const handleDeleteClass = async (classId) => {
        setDeleteStateLoader(true);
        try {
            // This would need a proper API call to delete the class
            const res = await deleteClass(classId);
            if (res.success) {
                // Alert.alert("Success", "Class deleted successfully");
                showAlert({title: "Success", message:`Class deleted successfully`});
                dispatch(fetchAllClassAndSectionsData());
            } else {
                // Alert.alert("Error", res.message);
                showAlert({title: "Error", message:res.message});
            }
        } catch (error) {
            // Alert.alert("Error", "Failed to delete class: " + error.message);
            showAlert({title: "Error", message:`Failed to delete class: ${error.message}`});
        }
        finally {
            setDeleteStateLoader(false);
        }
    };

    // Handle edit class
    const handleEditClass = (classItem) => {
        setClassName(classItem.name);
        setClassToDelete(classItem.id);
        setIsEditing(true);
    };

    // Handle delete section confirmation
    const confirmDeleteSection = (classId, sectionId) => {
        Alert.alert(
            "Delete Section",
            "Are you sure you want to delete this section?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDeleteSection(sectionId)
                }
            ]
        );
    };

    // Handle delete section
    const handleDeleteSection = async (sectionId) => {
        setDeleteStateLoader(true);
        try {
            // This would need a proper API call to delete the section
            const res = await deleteSection(sectionId);
            if (res.success) {
                // Alert.alert("Success", "Section deleted successfully");
                showAlert({title: "Success", message:`Section deleted successfully`})
                dispatch(fetchAllClassAndSectionsData());
            } else {
                // Alert.alert("Error", res.message);
                showAlert({title: "Error", message: res.message});
            }
        } catch (error) {
            // Alert.alert("Error", "Failed to delete section: " + error.message);
            showAlert({title: "Error", message:`Failed to delete section: ${error.message}`});
        }
        finally {
            setDeleteStateLoader(false);
        }
    };

    // Handle edit section
    const handleEditSection = (section) => {
        setSelectedClass(section.classId);
        setSections([{ id: Date.now(), value: section.name }]);
        setSectionToDelete(section.id);
        setIsEditing(true);
        setActiveTab('section');
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            {managerLoader(deleteStateLoader)}
            <View style={[styles.centeredView, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.modalView, { backgroundColor: colors.cardBackground }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                            {isEditing ? 'Edit' : 'Create'} Class & Section
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Tab Navigation */}
                    <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'class' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }
                            ]}
                            onPress={() => {
                                setActiveTab('class');
                                setIsEditing(false);
                                setClassToDelete(null);
                                setClassName('');
                            }}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: activeTab === 'class' ? colors.accent : colors.textSecondary }
                            ]}>Class</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'section' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }
                            ]}
                            onPress={() => {
                                setActiveTab('section');
                                setIsEditing(false);
                                setSectionToDelete(null);
                                setSections([{ id: Date.now(), value: '' }]);
                            }}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: activeTab === 'section' ? colors.accent : colors.textSecondary }
                            ]}>Section</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Content */}
                    <View style={styles.formContainer}>
                        {activeTab === 'class' ? (
                            <View style={styles.tabContent}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Class Name</Text>
                                    <TextInput
                                        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
                                        value={className}
                                        onChangeText={setClassName}
                                        placeholder="Enter class name (e.g. 10th, 11th)"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>

                                <View style={styles.existingItemsList}>
                                    <Text style={[styles.listHeader, { color: colors.textPrimary }]}>
                                        Existing Classes
                                    </Text>
                                    {allClassAndSections.length > 0 ? (
                                        <ScrollView style={styles.list}>
                                            {allClassAndSections.map(classItem => (
                                                <View
                                                    key={classItem.id}
                                                    style={[styles.listItem, { borderBottomColor: colors.border }]}
                                                >
                                                    <Text style={{ color: colors.textPrimary }}>{classItem.name}</Text>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={{ color: colors.textSecondary, marginRight: 10 }}>
                                                            {classItem.sections?.length || 0} sections
                                                        </Text>
                                                        <TouchableOpacity
                                                            onPress={() => handleEditClass(classItem)}
                                                            style={{ marginRight: 10 }}
                                                        >
                                                            <Ionicons name="pencil" size={18} color={colors.accent} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => confirmDeleteClass(classItem.id)}
                                                        >
                                                            <Ionicons name="trash-outline" size={18} color={colors.danger} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    ) : (
                                        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                                            No classes created yet
                                        </Text>
                                    )}
                                </View>

                                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                                    <TouchableOpacity
                                        style={[styles.button, { borderColor: colors.danger, borderWidth: 1 }]}
                                        onPress={onClose}
                                    >
                                        <Text style={{ color: colors.danger }}>Close</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            { 
                                                backgroundColor: colors.accent,
                                                opacity: (!className.trim() || isLoading) ? 0.5 : 1
                                            }
                                        ]}
                                        onPress={handleSaveClass}
                                        disabled={!className.trim() || isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <Text style={{ color: "#FFFFFF" }}>
                                                {isEditing ? 'Update Class' : 'Create New Class'}
                                            </Text>)}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.tabContent}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Select Class</Text>
                                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                                        <Picker
                                            selectedValue={selectedClass}
                                            onValueChange={(value) => setSelectedClass(value)}
                                            style={{ color: colors.textPrimary }}
                                            enabled={allClassAndSections.length > 0 && !isEditing}
                                        >
                                            {allClassAndSections.length === 0 ? (
                                                <Picker.Item label="No classes available" value={null} />
                                            ) : (
                                                allClassAndSections.map(classItem => (
                                                    <Picker.Item
                                                        key={classItem.id}
                                                        label={classItem.name}
                                                        value={classItem.id}
                                                    />
                                                ))
                                            )}
                                        </Picker>
                                    </View>
                                    {allClassAndSections.length === 0 && (
                                        <Text style={[styles.errorText, { color: colors.danger }]}>
                                            Please create a class first
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                                        Section Names
                                    </Text>
                                    <ScrollView style={{ maxHeight: 150 }}>
                                        {sections.map((section, index) => (
                                            <View key={section.id} style={{ flexDirection: 'row', marginBottom: 8 }}>
                                                <TextInput
                                                    style={[
                                                        styles.input,
                                                        {
                                                            borderColor: colors.border,
                                                            color: colors.textPrimary,
                                                            flex: 1,
                                                            marginRight: 8
                                                        }
                                                    ]}
                                                    value={section.value}
                                                    onChangeText={(text) => updateSectionValue(section.id, text)}
                                                    placeholder={`Enter section name (e.g. ${String.fromCharCode(65 + index)})`}
                                                    placeholderTextColor={colors.textSecondary}
                                                    editable={allClassAndSections.length > 0}
                                                />
                                                <TouchableOpacity
                                                    onPress={() => removeSectionField(section.id)}
                                                    style={{
                                                        justifyContent: 'center',
                                                        paddingHorizontal: 8,
                                                        opacity: sections.length === 1 ? 0.5 : 1
                                                    }}
                                                    disabled={sections.length === 1}
                                                >
                                                    <Ionicons name="trash-outline" size={24} color={colors.danger} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>

                                    <TouchableOpacity
                                        onPress={addSectionField}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginTop: 8,
                                            opacity: allClassAndSections.length === 0 ? 0.5 : 1
                                        }}
                                        disabled={allClassAndSections.length === 0}
                                    >
                                        <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
                                        <Text style={{ color: colors.accent, marginLeft: 8 }}>Add Another Section</Text>
                                    </TouchableOpacity>
                                </View>

                                {selectedClass && (
                                    <View style={styles.existingItemsList}>
                                        <Text style={[styles.listHeader, { color: colors.textPrimary }]}>
                                            Existing Sections for {allClassAndSections.find(c => c.id === selectedClass)?.name || ''}
                                        </Text>

                                        {(() => {
                                            const classData = allClassAndSections.find(c => c.id === selectedClass);
                                            const classSections = classData?.sections || [];

                                            return classSections.length > 0 ? (
                                                <ScrollView style={styles.list}>
                                                    {classSections.map(section => (
                                                        <View
                                                            key={section.id}
                                                            style={[
                                                                styles.listItem,
                                                                {
                                                                    borderBottomColor: colors.border,
                                                                    flexDirection: 'row',
                                                                    justifyContent: 'space-between',
                                                                    paddingRight: 12,
                                                                }
                                                            ]}
                                                        >
                                                            <Text style={{ color: colors.textPrimary }}>{section.name}</Text>
                                                            <View style={{ flexDirection: 'row' }}>
                                                                <TouchableOpacity
                                                                    onPress={() => handleEditSection({
                                                                        id: section.id,
                                                                        name: section.name,
                                                                        classId: selectedClass
                                                                    })}
                                                                    style={{ marginRight: 10 }}
                                                                >
                                                                    <Ionicons name="pencil" size={18} color={colors.accent} />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    onPress={() => confirmDeleteSection(selectedClass, section.id)}
                                                                >
                                                                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    ))}
                                                </ScrollView>
                                            ) : (
                                                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                                                    No sections created for this class
                                                </Text>
                                            );
                                        })()}
                                    </View>
                                )}

                                <View style={[styles.footer, { borderTopColor: colors.border }]}>
                                    <TouchableOpacity
                                        style={[styles.button, { borderColor: colors.danger, borderWidth: 1 }]}
                                        onPress={onClose}
                                    >
                                        <Text style={{ color: colors.danger }}>Close</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            { backgroundColor: colors.accent },
                                            (
                                                !sections.some(s => s.value.trim() !== '') ||
                                                !selectedClass ||
                                                allClassAndSections.length === 0 ||
                                                isLoading
                                            ) && { opacity: 0.5 }
                                        ]}
                                        onPress={handleSaveSections}
                                        disabled={
                                            isLoading ||
                                            !sections.some(s => s.value.trim() !== '') ||
                                            !selectedClass ||
                                            allClassAndSections.length === 0
                                        }
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <Text style={{ color: "#FFFFFF" }}>
                                                {isEditing ? 'Update Section' : 'Create Sections'}
                                            </Text>)}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

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

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: '90%',
        maxHeight: '95%',
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    studentBanner: {
        padding: 12,
        borderRadius: 8,
        margin: 12,
    },
    studentName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    studentDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    studentDetail: {
        fontSize: 12,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabText: {
        fontWeight: '500',
    },
    formContainer: {
        paddingHorizontal: 10
    },
    tabContent: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 6,
        fontSize: 14,
    },
    input: {
        height: 42,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        height: 42,
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    existingItemsList: {
        marginVertical: 16,
        maxHeight: 150,
    },
    listHeader: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    list: {
        maxHeight: 120,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    cancelButton: {
        borderWidth: 1,
    },
    saveButton: {
        elevation: 2,
    },
    actionButton: {
        elevation: 2,
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        borderRadius: 12,
    },
});