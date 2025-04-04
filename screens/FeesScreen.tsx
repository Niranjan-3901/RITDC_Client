import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Payment {
  amount: number;
  date: string;
  method: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Other';
  receiptNo: string;
  reference?: string;
  notes?: string;
}

interface FeeRecord {
  id: string;
  student: {
    id: string;
    name: string;
  };
  class: {
    id: string;
    name: string;
  };
  section: {
    id: string;
    name: string;
  };
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Partial' | 'Paid' | 'Overdue';
  payments: Payment[];
  feeType: 'Tuition' | 'Transport' | 'Library' | 'Laboratory' | 'Other';
  academicYear: string;
  term: 'Term1' | 'Term2' | 'Term3' | 'Annual';
  createdAt: string;
  updatedAt: string;
  totalPaid?: number;
  remainingBalance?: number;
}

export default function FeesScreen() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [filteredFees, setFilteredFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const navigation = useNavigation();
  const { theme } = useTheme();

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
    inputBackground: theme === 'dark' ? '#2C2C2C' : '#F0F2F5',
  };

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        
        // Mock data for demonstration
        const mockFees = [
          {
            id: '1',
            student: { id: '1', name: 'Rahul Sharma' },
            class: { id: '1', name: 'XI' },
            section: { id: '1', name: 'A' },
            amount: 45000,
            dueDate: '2023-04-15',
            status: 'Paid',
            payments: [{
              amount: 45000,
              date: '2023-04-10',
              method: 'UPI',
              receiptNo: 'REC-001',
              reference: 'UPI/123456',
              notes: 'Full payment received'
            }],
            feeType: 'Tuition',
            academicYear: '2023-24',
            term: 'Term1',
            createdAt: '2023-03-01',
            updatedAt: '2023-04-10',
            totalPaid: 45000,
            remainingBalance: 0
          },
          { id: '2', student: { id: '2', name: 'Priya Patel' }, class: { id: 'XI', name: 'XI' }, section: { id: 'B', name: 'B' }, amount: 45000, dueDate: '2023-04-15', status: 'paid', payments: [], feeType: 'Tuition', academicYear: '2023-24', term: 'Term1', createdAt: '2023-04-01', updatedAt: '2023-04-01', totalPaid: 45000, remainingBalance: 0 },
          { id: '3', student: { id: '3', name: 'Amit Kumar' }, class: { id: 'X', name: 'X' }, section: { id: 'A', name: 'A' }, amount: 40000, dueDate: '2023-04-15', status: 'pending', payments: [], feeType: 'Tuition', academicYear: '2023-24', term: 'Term1', createdAt: '2023-04-01', updatedAt: '2023-04-01', totalPaid: 0, remainingBalance: 40000 },
          { id: '4', student: { id: '4', name: 'Sneha Gupta' }, class: { id: 'X', name: 'X' }, section: { id: 'B', name: 'B' }, amount: 40000, dueDate: '2023-04-15', status: 'overdue', payments: [], feeType: 'Tuition', academicYear: '2023-24', term: 'Term1', createdAt: '2023-04-01', updatedAt: '2023-04-01', totalPaid: 0, remainingBalance: 40000 },
          { id: '5', student: { id: '5', name: 'Vikram Singh' }, class: { id: 'XII', name: 'XII' }, section: { id: 'A', name: 'A' }, amount: 50000, dueDate: '2023-04-15', status: 'pending', payments: [], feeType: 'Tuition', academicYear: '2023-24', term: 'Term1', createdAt: '2023-04-01', updatedAt: '2023-04-01', totalPaid: 0, remainingBalance: 50000 },
          { id: '6', student: { id: '6', name: 'Nisha Reddy' }, class: { id: 'XII', name: 'XII' }, section: { id: 'B', name: 'B' }, amount: 50000, dueDate: '2023-04-15', status: 'paid', payments: [], feeType: 'Tuition', academicYear: '2023-24', term: 'Term1', createdAt: '2023-04-01', updatedAt: '2023-04-01', totalPaid: 50000, remainingBalance: 0 },
          { id: '7', student: { id: '7', name: 'Raj Malhotra' }, class: { id: 'IX', name: 'IX' }, section: { id: 'A', name: 'A' }, amount: 35000, dueDate: '2023-04-15', status: 'overdue', payments: [], feeType: 'Tuition', academicYear: '2023-24', term: 'Term1', createdAt: '2023-04-01', updatedAt: '2023-04-01', totalPaid: 0, remainingBalance: 35000 },
          { id: '8', student: { id: '8', name: 'Ananya Verma' }, class: { id: 'IX', name: 'IX' }, section: { id: 'B', name: 'B' }, amount: 35000, dueDate: '2023-04-15', status: 'pending', payments: [], feeType: 'Tuition', academicYear: '2023-24', term: 'Term1', createdAt: '2023-04-01', updatedAt: '2023-04-01', totalPaid: 0, remainingBalance: 35000 },
        ];
        
        setFees(mockFees);
        setFilteredFees(mockFees);
      } catch (error) {
        console.error('Error fetching fees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, []);

  useEffect(() => {
    // Apply filters when search query or status changes
    let results = fees;
    
    if (searchQuery) {
      results = results.filter(fee => 
        fee.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.receiptNo?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter) {
      results = results.filter(fee => fee.status === statusFilter);
    }
    
    setFilteredFees(results);
  }, [searchQuery, statusFilter, fees]);

  const handlePaymentRecord = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.amount.toString());
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedFee || !paymentAmount) return;
    
    try {
      setProcessingPayment(true);
      
      const newPayment: Payment = {
        amount: parseFloat(paymentAmount),
        date: new Date().toISOString(),
        method: paymentMethod as Payment['method'],
        receiptNo: `REC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        notes: paymentNote || undefined
      };

      const totalPaid = (selectedFee.payments || [])
        .reduce((sum, payment) => sum + payment.amount, 0) + parseFloat(paymentAmount);
      
      const newStatus: FeeRecord['status'] = 
        totalPaid >= selectedFee.amount ? 'Paid' :
        totalPaid > 0 ? 'Partial' : 'Pending';

      // Mock update for demo
      const updatedFees = fees.map(fee => {
        if (fee.id === selectedFee.id) {
          return {
            ...fee,
            status: newStatus,
            payments: [...(fee.payments || []), newPayment],
            totalPaid,
            remainingBalance: fee.amount - totalPaid,
            updatedAt: new Date().toISOString()
          };
        }
        return fee;
      });
      
      setFees(updatedFees);
      setProcessingPayment(false);
      setShowPaymentModal(false);
      
      // Reset form
      setSelectedFee(null);
      setPaymentAmount('');
      setPaymentMethod('Cash');
      setPaymentNote('');
    } catch (error) {
      console.error('Error recording payment:', error);
      setProcessingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'partial':
        return colors.warning;
      case 'pending':
        return colors.accent;
      case 'overdue':
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partial';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  const renderPaymentHistory = (payments: Payment[]) => (
    <View style={styles.paymentHistory}>
      <Text style={[styles.paymentHistoryTitle, { color: colors.textPrimary }]}>
        Payment History
      </Text>
      {payments.map((payment, index) => (
        <View key={payment.receiptNo} style={styles.paymentItem}>
          <View style={styles.paymentItemHeader}>
            <Text style={[styles.paymentAmount, { color: colors.textPrimary }]}>
              ₹{payment.amount.toLocaleString()}
            </Text>
            <Text style={[styles.paymentDate, { color: colors.textSecondary }]}>
              {new Date(payment.date).toLocaleDateString()}
            </Text>
          </View>
          <Text style={[styles.paymentMethod, { color: colors.textSecondary }]}>
            {payment.method} • Receipt: {payment.receiptNo}
          </Text>
          {payment.notes && (
            <Text style={[styles.paymentNotes, { color: colors.textSecondary }]}>
              Note: {payment.notes}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderFeeItem = ({ item }: { item: FeeRecord }) => (
    <View style={[styles.feeCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.feeHeader}>
        <View>
          <Text style={[styles.studentName, { color: colors.textPrimary }]}>{item.student.name}</Text>
          <Text style={[styles.classInfo, { color: colors.textSecondary }]}>
            Class {item.class.name}-{item.section.name}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.feeDetails}>
        <View style={styles.feeInfo}>
          <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Fee Type</Text>
          <Text style={[styles.feeValue, { color: colors.textPrimary }]}>{item.feeType}</Text>
        </View>
        
        <View style={styles.feeInfo}>
          <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Term</Text>
          <Text style={[styles.feeValue, { color: colors.textPrimary }]}>
            {item.term} ({item.academicYear})
          </Text>
        </View>
        
        <View style={styles.feeInfo}>
          <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Total Amount</Text>
          <Text style={[styles.feeValue, { color: colors.textPrimary }]}>
            ₹{item.amount.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.feeInfo}>
          <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Paid Amount</Text>
          <Text style={[styles.feeValue, { color: colors.success }]}>
            ₹{item.totalPaid?.toLocaleString() || '0'}
          </Text>
        </View>
        
        {item.remainingBalance > 0 && (
          <View style={styles.feeInfo}>
            <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Balance</Text>
            <Text style={[styles.feeValue, { color: colors.warning }]}>
              ₹{item.remainingBalance.toLocaleString()}
            </Text>
          </View>
        )}
        
        <View style={styles.feeInfo}>
          <Text style={[styles.feeLabel, { color: colors.textSecondary }]}>Due Date</Text>
          <Text style={[styles.feeValue, { color: colors.textPrimary }]}>
            {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      {item.payments?.length > 0 && renderPaymentHistory(item.payments)}
      
      <View style={styles.feeActions}>
        {item.status === 'paid' ? (
          <TouchableOpacity 
            style={[styles.feeButton, { backgroundColor: colors.accent + '20' }]}
            onPress={() => alert('View receipt functionality would be implemented here')}
          >
            <MaterialCommunityIcons name="receipt" size={18} color={colors.accent} />
            <Text style={[styles.feeButtonText, { color: colors.accent }]}>View Receipt</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.feeButton, { backgroundColor: colors.success + '20' }]}
            onPress={() => handlePaymentRecord(item)}
          >
            <MaterialIcons name="payments" size={18} color={colors.success} />
            <Text style={[styles.feeButtonText, { color: colors.success }]}>Record Payment</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.feeIconButton, { backgroundColor: colors.accent + '20' }]}
          onPress={() => navigation.navigate('FeeDetails', { feeId: item.id })}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const FeeSummary = () => {
    const totalDue = fees.filter(fee => fee.status !== 'paid').reduce((sum, fee) => sum + fee.amount, 0);
    const totalCollected = fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
    
    return (
      <View style={[styles.summaryContainer, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIconContainer, { backgroundColor: colors.success + '20' }]}>
            <MaterialIcons name="payments" size={22} color={colors.success} />
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Collected</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>₹{totalCollected.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIconContainer, { backgroundColor: colors.warning + '20' }]}>
            <MaterialCommunityIcons name="clock" size={22} color={colors.warning} />
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Pending</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>₹{totalDue.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIconContainer, { backgroundColor: colors.accent + '20' }]}>
            <MaterialCommunityIcons name="account-group" size={22} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Students</Text>
            <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{fees.length}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Fees Management</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
            Term 1 - 2023-24
          </Text>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => alert('This would open fee structure settings')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={() => alert('This would open the fee generation modal')}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Generate Fees</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FeeSummary />

      <View style={styles.filterContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by student or receipt"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statusFilters}>
        <TouchableOpacity 
          style={[
            styles.statusFilter, 
            statusFilter === '' && { backgroundColor: colors.accent + '20', borderColor: colors.accent }
          ]}
          onPress={() => setStatusFilter('')}
        >
          <Text 
            style={[
              styles.statusFilterText, 
              statusFilter === '' && { color: colors.accent }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.statusFilter, 
            statusFilter === 'paid' && { backgroundColor: colors.success + '20', borderColor: colors.success }
          ]}
          onPress={() => setStatusFilter('paid')}
        >
          <Text 
            style={[
              styles.statusFilterText, 
              statusFilter === 'paid' && { color: colors.success }
            ]}
          >
            Paid
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.statusFilter,
            statusFilter === 'pending' && { backgroundColor: colors.warning + '20', borderColor: colors.warning }
          ]}
          onPress={() => setStatusFilter('pending')}
        >
          <Text 
            style={[
              styles.statusFilterText, 
              statusFilter === 'pending' && { color: colors.warning }
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.statusFilter, 
            statusFilter === 'overdue' && { backgroundColor: colors.danger + '20', borderColor: colors.danger }
          ]}
          onPress={() => setStatusFilter('overdue')}
        >
          <Text 
            style={[
              styles.statusFilterText, 
              statusFilter === 'overdue' && { color: colors.danger }
            ]}
          >
            Overdue
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : filteredFees.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="money-off" size={60} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No fee records found
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Try different search criteria or clear filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFees}
          renderItem={renderFeeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showPaymentModal}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Record Payment</Text>
              <TouchableOpacity 
                disabled={processingPayment}
                onPress={() => setShowPaymentModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {selectedFee && (
              <ScrollView>
                <View style={styles.paymentDetails}>
                  <Text style={[styles.paymentDetailLabel, { color: colors.textSecondary }]}>Student</Text>
                  <Text style={[styles.paymentDetailValue, { color: colors.textPrimary }]}>{selectedFee.student.name}</Text>
                </View>
                
                <View style={styles.paymentDetails}>
                  <Text style={[styles.paymentDetailLabel, { color: colors.textSecondary }]}>Class</Text>
                  <Text style={[styles.paymentDetailValue, { color: colors.textPrimary }]}>
                    {selectedFee.class.name}-{selectedFee.section.name}
                  </Text>
                </View>
                
                <View style={styles.paymentDetails}>
                  <Text style={[styles.paymentDetailLabel, { color: colors.textSecondary }]}>Fee Amount</Text>
                  <Text style={[styles.paymentDetailValue, { color: colors.textPrimary }]}>
                    ₹{selectedFee.amount.toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.paymentDetails}>
                  <Text style={[styles.paymentDetailLabel, { color: colors.textSecondary }]}>Due Date</Text>
                  <Text style={[styles.paymentDetailValue, { color: colors.textPrimary }]}>{selectedFee.dueDate}</Text>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Payment Amount</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground }]}>
                    <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>₹</Text>
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      value={paymentAmount}
                      onChangeText={setPaymentAmount}
                      keyboardType="numeric"
                      editable={!processingPayment}
                    />
                  </View>
                </View>
                
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === 'Cash' && { 
                        backgroundColor: colors.accent + '20', 
                        borderColor: colors.accent 
                      },
                      { borderColor: colors.border }
                    ]}
                    onPress={() => setPaymentMethod('Cash')}
                    disabled={processingPayment}
                  >
                    <MaterialIcons 
                      name="attach-money" 
                      size={22} 
                      color={paymentMethod === 'Cash' ? colors.accent : colors.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.paymentMethodText,
                        { color: paymentMethod === 'Cash' ? colors.accent : colors.textPrimary }
                      ]}
                    >
                      Cash
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === 'Card' && { 
                        backgroundColor: colors.accent + '20', 
                        borderColor: colors.accent 
                      },
                      { borderColor: colors.border }
                    ]}
                    onPress={() => setPaymentMethod('Card')}
                    disabled={processingPayment}
                  >
                    <MaterialIcons 
                      name="credit-card" 
                      size={22} 
                      color={paymentMethod === 'Card' ? colors.accent : colors.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.paymentMethodText,
                        { color: paymentMethod === 'Card' ? colors.accent : colors.textPrimary }
                      ]}
                    >
                      Card
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === 'UPI' && { 
                        backgroundColor: colors.accent + '20', 
                        borderColor: colors.accent 
                      },
                      { borderColor: colors.border }
                    ]}
                    onPress={() => setPaymentMethod('UPI')}
                    disabled={processingPayment}
                  >
                    <MaterialIcons 
                      name="mobile-friendly" 
                      size={22} 
                      color={paymentMethod === 'UPI' ? colors.accent : colors.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.paymentMethodText,
                        { color: paymentMethod === 'UPI' ? colors.accent : colors.textPrimary }
                      ]}
                    >
                      UPI
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Note (Optional)</Text>
                  <View style={[styles.textAreaWrapper, { backgroundColor: colors.inputBackground }]}>
                    <TextInput
                      style={[styles.textArea, { color: colors.textPrimary }]}
                      value={paymentNote}
                      onChangeText={setPaymentNote}
                      multiline
                      numberOfLines={3}
                      placeholder="Add any additional information"
                      placeholderTextColor={colors.textSecondary}
                      editable={!processingPayment}
                    />
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.submitButton, 
                    { backgroundColor: colors.success },
                    processingPayment && { opacity: 0.7 }
                  ]}
                  onPress={handleSubmitPayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialIcons name="payments" size={18} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Complete Payment</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  screenSubtitle: {
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addButton: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: '100%',
    marginHorizontal: 10,
  },
  filterContainer: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
  },
  statusFilters: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusFilter: {
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  statusFilterText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  feeCard: {
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  classInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
  },
  feeInfo: {
    width: '50%',
    marginBottom: 12,
  },
  feeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  feeActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 12,
  },
  feeButton: {
    flex: 1,
    flexDirection: 'row',
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  feeButtonText: {
    fontWeight: '600',
    marginLeft: 4,
  },
  feeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentDetails: {
    marginBottom: 12,
  },
  paymentDetailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  paymentDetailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    fontSize: 16,
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  paymentMethodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    marginLeft: 4,
  },
  textAreaWrapper: {
    borderRadius: 8,
    padding: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  paymentHistory: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  paymentHistoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  paymentItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  paymentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentDate: {
    fontSize: 12,
  },
  paymentMethod: {
    fontSize: 12,
    marginBottom: 4,
  },
  paymentNotes: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});