import { format } from 'date-fns';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  colors: any;
  onPress: () => void;
  onAddPayment: () => void;
  onAddNote: () => void;
  onPrint: () => void;
}

const StudentCard: React.FC<StudentCardProps> = memo(({
  student,
  colors,
  onPress,
  onAddPayment,
  onAddNote,
  onPrint
}) => {
  const styles = createStyles(colors);
  
  // Status indicator config
  const statusConfig = {
    paid: { color: colors.success, icon: 'check-circle' },
    unpaid: { color: colors.warning, icon: 'alert-circle-outline' },
    partial: { color: colors.warning, icon: 'circle-half-full' },
    overdue: { color: colors.danger, icon: 'clock-alert' }
  };
  
  // Helper function to safely format dates
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
  
  // Get latest payment if exists
  const latestPayment = student.payments.length > 0 
    ? student.payments.sort((a, b) => {
        try {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } catch {
          return 0;
        }
      })[0]
    : null;
  
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.admissionNumber}>{student.student.admissionNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig[student.status].color }]}>
              <Icon name={statusConfig[student.status].icon} size={12} color="#fff" style={styles.statusIcon} />
              <Text style={styles.statusText}>{student.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.printButton} onPress={onPrint}>
            <Icon name="printer" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.name}>
          {student.student.firstName} {student.student.lastName}
        </Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Fee Amount:</Text>
            <Text style={styles.detailValue}>₹{student.feeAmount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Next Payment:</Text>
            <Text style={styles.detailValue}>
              {formatDate(student.nextPaymentDate)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={[
              styles.detailValue,
              new Date() > new Date(student.dueDate) && student.status !== 'paid' && styles.overdueText
            ]}>
              {formatDate(student.dueDate)}
            </Text>
          </View>
          
          {latestPayment && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Payment:</Text>
              <Text style={styles.detailValue}>
                ₹{latestPayment.amount.toLocaleString()} ({formatDate(latestPayment.date)})
              </Text>
            </View>
          )}
          
          {student.notes.length > 0 && (
            <View style={styles.noteContainer}>
              <Icon name="note-text" size={16} color={colors.textSecondary} />
              <Text style={styles.noteText} numberOfLines={1} ellipsizeMode="tail">
                {student.notes[student.notes.length - 1].text}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={onAddPayment}>
            <Icon name="cash-plus" size={18} color={colors.accent} />
            <Text style={styles.actionText}>Add Payment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onAddNote}>
            <Icon name="note-plus" size={18} color={colors.accent} />
            <Text style={styles.actionText}>Add Note</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Icon name="history" size={18} color={colors.accent} />
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  });
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  admissionNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  printButton: {
    padding: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  overdueText: {
    color: colors.danger,
    fontWeight: 'bold',
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: colors.inputBackground,
    padding: 8,
    borderRadius: 5,
    marginTop: 6,
    alignItems: 'center',
  },
  noteText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default StudentCard;