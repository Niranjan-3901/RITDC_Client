import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Payment, Student } from '../types';

interface PaymentFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payment: Payment) => void;
  student: Student | null;
  colors: any;
}

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  student,
  colors
}) => {
  const styles = createStyles(colors);
  
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Calculate remaining amount
  const totalPaid = student?.payments.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const remainingAmount = student ? student.feeAmount - totalPaid : 0;
  
  const handleSubmit = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    
    onSubmit({
      // id: Date.now().toString(),
      date: format(date, 'yyyy-MM-dd'),
      amount: parsedAmount,
      method,
      reference
    });
    
    // Reset form
    setAmount('');
    setMethod('Cash');
    setReference('');
    setDate(new Date());
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };
  
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cheque'];
  
  if (!student) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <Text style={styles.studentName}>{student.student.firstName} {student.student.lastName}</Text>
            <Text style={styles.admissionNumber}>{student.student.admissionNumber}</Text>
            
            <View style={styles.amountContainer}>
              <Text style={styles.fieldLabel}>Fee Details</Text>
              <View style={styles.feeDetails}>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>Total Fee</Text>
                  <Text style={styles.feeValue}>₹{student.feeAmount.toLocaleString()}</Text>
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>Paid</Text>
                  <Text style={styles.feeValue}>₹{totalPaid.toLocaleString()}</Text>
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>Remaining</Text>
                  <Text style={[styles.feeValue, { color: remainingAmount > 0 ? colors.danger : colors.success }]}>
                    ₹{remainingAmount.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Payment Amount (₹)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity 
                style={styles.fullAmountButton} 
                onPress={() => setAmount(remainingAmount.toString())}
              >
                <Text style={styles.fullAmountText}>Fill Remaining (₹{remainingAmount})</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Payment Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{format(date, 'MMMM dd, yyyy')}</Text>
                <Icon name="calendar" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Payment Method</Text>
              <View style={styles.methodsContainer}>
                {paymentMethods.map((paymentMethod) => (
                  <TouchableOpacity
                    key={paymentMethod}
                    style={[
                      styles.methodButton,
                      method === paymentMethod && { backgroundColor: colors.accent }
                    ]}
                    onPress={() => setMethod(paymentMethod)}
                  >
                    <Text 
                      style={[
                        styles.methodText,
                        method === paymentMethod && { color: '#fff' }
                      ]}
                    >
                      {paymentMethod}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Reference (Optional)</Text>
              <TextInput
                style={styles.input}
                value={reference}
                onChangeText={setReference}
                placeholder="Transaction ID, Cheque No., etc."
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </ScrollView>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, 
                (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
            >
              <Text style={styles.submitButtonText}>Submit Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 16,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  admissionNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  amountContainer: {
    marginBottom: 16,
  },
  feeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    padding: 12,
    borderRadius: 8,
  },
  feeItem: {
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  feeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  fullAmountButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 5,
    backgroundColor: colors.accent + '20',
  },
  fullAmountText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  dateInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 5,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  methodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  methodButton: {
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    margin: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  methodText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    padding: 12,
    borderRadius: 5,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.accent + '50',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PaymentFormModal;