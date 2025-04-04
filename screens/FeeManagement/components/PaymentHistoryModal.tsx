import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { Student } from '../types';

interface PaymentHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  student: Student | null;
  colors: any;
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ 
  visible, 
  onClose, 
  student, 
  colors 
}) => {
  const styles = createStyles(colors);
  
  if (!student) return null;
  
  // Calculate total paid amount
  const totalPaid = student.payments.reduce((sum, payment) => sum + payment.amount, 0);
  // Calculate remaining amount
  const remainingAmount = student.feeAmount - totalPaid;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      // return format(date, formatStr);
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };
  
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
            <Text style={styles.modalTitle}>Payment History</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.studentInfoContainer}>
            <Text style={styles.studentName}>{student.student.firstName} {student.student.lastName}</Text>
            <Text style={styles.admissionInfo}>
              {student.student.admissionNumber} • Admitted on: {formatDate(student.admissionDate)}
            </Text>
          </View>
          
          <View style={styles.feeOverview}>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Total Fee</Text>
              <Text style={styles.feeAmount}>₹{student.feeAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Paid</Text>
              <Text style={[styles.feeAmount, { color: colors.success }]}>
                ₹{totalPaid.toLocaleString()}
              </Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Remaining</Text>
              <Text style={[styles.feeAmount, { color: remainingAmount > 0 ? colors.danger : colors.success }]}>
                ₹{remainingAmount.toLocaleString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Payments</Text>
            {student.payments.length > 0 ? (
              <FlatList
                data={[...student.payments].sort((a, b) => 
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                )}
                keyExtractor={(item, index) => `payment-${index}`}
                renderItem={({ item }) => (
                  <View style={styles.paymentItem}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentDate}>
                        {formatDate(item.date)}
                      </Text>
                      <Text style={styles.paymentMethod}>
                        {item.method} {item.reference ? `• ${item.reference}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.paymentAmount}>₹{item.amount.toLocaleString()}</Text>
                  </View>
                )}
                style={styles.list}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Icon name="cash-remove" size={40} color={colors.border} />
                <Text style={styles.emptyText}>No payment records found</Text>
              </View>
            )}
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Notes</Text>
            {student.notes.length > 0 ? (
              <FlatList
                data={[...student.notes].sort((a, b) => 
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                )}
                keyExtractor={(item, index) => `note-${index}`}
                renderItem={({ item }) => (
                  <View style={styles.noteItem}>
                    <Text style={styles.noteDate}>
                      {formatDate(item.date)}
                    </Text>
                    <Text style={styles.noteText}>{item.text}</Text>
                  </View>
                )}
                style={styles.list}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Icon name="note-off" size={40} color={colors.border} />
                <Text style={styles.emptyText}>No notes found</Text>
              </View>
            )}
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
  studentInfoContainer: {
    padding: 16,
    backgroundColor: colors.accent + '15',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  admissionInfo: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  feeOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  feeItem: {
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  list: {
    maxHeight: 200,
  },
  listContent: {
    paddingBottom: 8,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDate: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  noteItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  noteDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: colors.textSecondary,
    marginTop: 10,
    fontSize: 14,
  },
});

export default PaymentHistoryModal;