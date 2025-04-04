import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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

/**
 * Modal component to display the fee records of a student.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.visible - Determines if the modal is visible.
 * @param {Function} props.onClose - Function to close the modal.
 * @param {Object} props.studentData - Student details.
 * @param {string} props.studentData._id - Unique ID of the student.
 * @param {string} props.studentData.name - Full name of the student.
 * @param {string} props.studentData.class - Student's current class.
 * @param {string} props.studentData.section - Student's section.
 * @param {string} props.studentData.admissionDate - Admission date in YYYY-MM-DD format.
 * @returns {JSX.Element} The FeeRecordModal component.
 */
const FeeRecordModal = ({ visible, onClose, studentData }) => {
    const { theme } = useTheme();
    const colors = getThemedColors(theme);

    // Form state
    const [feeData, setFeeData] = useState({
        serialNumber: `FEE-${Date.now().toString().slice(-6)}`,
        feeAmount: '',
        status: 'unpaid',
        nextPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString().split("T")[0],
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        term: 'Term 1',
        payment: {
            date: new Date().toISOString().split('T')[0],
            amount: '',
            method: 'cash',
            reference: ''
        },
        note: {
            date: new Date().toISOString().split('T')[0],
            text: ''
        }
    });

    // Date picker state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateField, setDateField] = useState('');

    // Tab state
    const [activeTab, setActiveTab] = useState('details');

    // Handle date selection
    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];

            if (dateField === 'nextPaymentDate' || dateField === 'dueDate') {
                setFeeData({
                    ...feeData,
                    [dateField]: formattedDate
                });
            } else if (dateField === 'paymentDate') {
                setFeeData({
                    ...feeData,
                    payment: {
                        ...feeData.payment,
                        date: formattedDate
                    }
                });
            } else if (dateField === 'noteDate') {
                setFeeData({
                    ...feeData,
                    note: {
                        ...feeData.note,
                        date: formattedDate
                    }
                });
            }
        }
    };

    // Open date picker for a specific field
    const openDatePicker = (field) => {
        setDateField(field);
        setShowDatePicker(true);
    };

    // Handle save
    const handleSave = () => {
        // Here you would save to MongoDB using your API
        console.log('Saving fee record:', {
            ...feeData,
            student: studentData._id,
            admissionDate: studentData.admissionDate
        });
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
                        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Fee Record</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Student Info Banner */}
                    <View style={[styles.studentBanner, { backgroundColor: colors.accentLight }]}>
                        <Text style={[styles.studentName, { color: colors.textPrimary }]}>{studentData?.name}</Text>
                        <View style={styles.studentDetails}>
                            <Text style={[styles.studentDetail, { color: colors.textSecondary }]}>
                                Class: {studentData?.class} {studentData?.section}
                            </Text>
                            <Text style={[styles.studentDetail, { color: colors.textSecondary }]}>
                                Admission: {studentData?.admissionDate}
                            </Text>
                        </View>
                    </View>

                    {/* Tab Navigation */}
                    <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'details' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }
                            ]}
                            onPress={() => setActiveTab('details')}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: activeTab === 'details' ? colors.accent : colors.textSecondary }
                            ]}>Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'payment' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }
                            ]}
                            onPress={() => setActiveTab('payment')}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: activeTab === 'payment' ? colors.accent : colors.textSecondary }
                            ]}>Payment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'notes' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }
                            ]}
                            onPress={() => setActiveTab('notes')}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: activeTab === 'notes' ? colors.accent : colors.textSecondary }
                            ]}>Notes</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Content */}
                    <ScrollView style={styles.formContainer}>
                        {activeTab === 'details' && (
                            <View style={styles.tabContent}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Serial Number</Text>
                                    <TextInput
                                        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
                                        value={feeData.serialNumber}
                                        editable={false}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Fee Amount</Text>
                                    <TextInput
                                        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
                                        value={feeData.feeAmount}
                                        onChangeText={(value) => setFeeData({ ...feeData, feeAmount: value })}
                                        keyboardType="numeric"
                                        placeholder="Enter amount"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
                                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                                        <Picker
                                            selectedValue={feeData.status}
                                            onValueChange={(value) => setFeeData({ ...feeData, status: value })}
                                            style={{ color: colors.textPrimary }}
                                        >
                                            <Picker.Item label="Unpaid" value="unpaid" />
                                            <Picker.Item label="Paid" value="paid" />
                                            <Picker.Item label="Partial" value="partial" />
                                            <Picker.Item label="Overdue" value="overdue" />
                                        </Picker>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Next Payment Date</Text>
                                    <TouchableOpacity
                                        style={[styles.dateInput, { borderColor: colors.border }]}
                                        onPress={() => openDatePicker('nextPaymentDate')}
                                    >
                                        <Text style={{ color: colors.textPrimary }}>{feeData.nextPaymentDate}</Text>
                                        <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Due Date</Text>
                                    <TouchableOpacity
                                        style={[styles.dateInput, { borderColor: colors.border }]}
                                        onPress={() => openDatePicker('dueDate')}
                                    >
                                        <Text style={{ color: colors.textPrimary }}>{feeData.dueDate}</Text>
                                        <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Academic Year</Text>
                                    <TextInput
                                        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
                                        value={feeData.academicYear}
                                        onChangeText={(value) => setFeeData({ ...feeData, academicYear: value })}
                                        placeholder="YYYY-YYYY"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Term</Text>
                                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                                        <Picker
                                            selectedValue={feeData.term}
                                            onValueChange={(value) => setFeeData({ ...feeData, term: value })}
                                            style={{ color: colors.textPrimary }}
                                        >
                                            <Picker.Item label="Term 1" value="Term 1" />
                                            <Picker.Item label="Term 2" value="Term 2" />
                                            <Picker.Item label="Term 3" value="Term 3" />
                                            <Picker.Item label="Annual" value="Annual" />
                                        </Picker>
                                    </View>
                                </View>
                            </View>
                        )}

                        {activeTab === 'payment' && (
                            <View style={styles.tabContent}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Date</Text>
                                    <TouchableOpacity
                                        style={[styles.dateInput, { borderColor: colors.border }]}
                                        onPress={() => openDatePicker('paymentDate')}
                                    >
                                        <Text style={{ color: colors.textPrimary }}>{feeData.payment.date}</Text>
                                        <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Amount</Text>
                                    <TextInput
                                        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
                                        value={feeData.payment.amount}
                                        onChangeText={(value) => setFeeData({
                                            ...feeData,
                                            payment: { ...feeData.payment, amount: value }
                                        })}
                                        keyboardType="numeric"
                                        placeholder="Enter amount"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Method</Text>
                                    <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                                        <Picker
                                            selectedValue={feeData.payment.method}
                                            onValueChange={(value) => setFeeData({
                                                ...feeData,
                                                payment: { ...feeData.payment, method: value }
                                            })}
                                            style={{ color: colors.textPrimary }}
                                        >
                                            <Picker.Item label="Cash" value="cash" />
                                            <Picker.Item label="Check" value="check" />
                                            <Picker.Item label="Bank Transfer" value="bank_transfer" />
                                            <Picker.Item label="Online Payment" value="online" />
                                        </Picker>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Reference No. (Optional)</Text>
                                    <TextInput
                                        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]}
                                        value={feeData.payment.reference}
                                        onChangeText={(value) => setFeeData({
                                            ...feeData,
                                            payment: { ...feeData.payment, reference: value }
                                        })}
                                        placeholder="Transaction ID, Check No., etc."
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>
                            </View>
                        )}

                        {activeTab === 'notes' && (
                            <View style={styles.tabContent}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Note Date</Text>
                                    <TouchableOpacity
                                        style={[styles.dateInput, { borderColor: colors.border }]}
                                        onPress={() => openDatePicker('noteDate')}
                                    >
                                        <Text style={{ color: colors.textPrimary }}>{feeData.note.date}</Text>
                                        <Ionicons name="calendar" size={18} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Note Text</Text>
                                    <TextInput
                                        style={[styles.textArea, { borderColor: colors.border, color: colors.textPrimary }]}
                                        value={feeData.note.text}
                                        onChangeText={(value) => setFeeData({
                                            ...feeData,
                                            note: { ...feeData.note, text: value }
                                        })}
                                        placeholder="Add notes regarding this fee record"
                                        placeholderTextColor={colors.textSecondary}
                                        multiline={true}
                                        numberOfLines={4}
                                    />
                                </View>
                            </View>
                        )}

                        {showDatePicker && (
                            <DateTimePicker
                                value={new Date()}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}
                    </ScrollView>

                    {/* Footer with action buttons */}
                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { borderColor: colors.danger }]}
                            onPress={onClose}
                        >
                            <Text style={{ color: colors.danger }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton, { backgroundColor: colors.accent }]}
                            onPress={handleSave}
                        >
                            <Text style={{ color: "#FFFFFF" }}>Save Record</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: '90%',
        maxHeight: '80%',
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
        maxHeight: 350,
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
    dateInput: {
        height: 42,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingTop: 10,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
    },
    button: {
        paddingVertical: 10,
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
});

export default FeeRecordModal;