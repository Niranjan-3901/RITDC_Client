import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
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

interface FilterOptions {
  feeType: string;
  academicYear: string;
  term: string;
  class: string;
}

interface FeeDetailsModalProps {
  fee: FeeRecord;
  visible: boolean;
  onClose: () => void;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  onResetFilters: () => void;
}

interface PaymentModalProps {
  visible: boolean;
  fee: FeeRecord | null;
  onClose: () => void;
  onSubmit: () => void;
  amount: string;
  setAmount: (amount: string) => void;
  method: Payment['method'];
  setMethod: (method: Payment['method']) => void;
  note: string;
  setNote: (note: string) => void;
  reference: string;
  setReference: (ref: string) => void;
  processing: boolean;
}

const getThemeColors = (theme: string) => ({
  background: theme === 'dark' ? '#121212' : '#F5F7FA',
  cardBackground: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
  textPrimary: theme === 'dark' ? '#FFFFFF' : '#333333',
  textSecondary: theme === 'dark' ? '#AAAAAA' : '#666666',
  border: theme === 'dark' ? '#333333' : '#E1E4E8',
  accent: '#4A6FFF',
  danger: '#FF4C4C',
  success: '#4CAF50',
  warning: '#FFA500',
  inputBackground: theme === 'dark' ? '#2C2C2C' : '#F0F2F5',
  inputBorder: theme === 'dark' ? '#333333' : '#E1E4E8',
});

// Create a default colors object using light theme
const defaultColors = getThemeColors('light');

const styles = StyleSheet.create({
    detailsSection: {
        marginBottom: 24,
        paddingHorizontal: 16,
      },
      sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
      },
      detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
      },
      detailItem: {
        width: '50%',
        paddingHorizontal: 8,
        marginBottom: 16,
      },
      detailLabel: {
        fontSize: 12,
        marginBottom: 4,
      },
      detailValue: {
        fontSize: 14,
        fontWeight: '500',
      },
      detailsActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: defaultColors.border,
      },
      detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 8,
      },
      detailsButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
      },
      modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalContent: {
        width: '80%',
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        elevation: 5,
      },
      modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: '600',
      },
      paymentHistory: {
        marginBottom: 24,
      },
      paymentHistoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
      },
      paymentItem: {
        padding: 12,
        borderWidth: 1,
        borderColor: defaultColors.border,
        borderRadius: 8,
        marginBottom: 8,
      },
      paymentItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
      },
      paymentAmount: {
        fontSize: 14,
        fontWeight: '500',
      },
      paymentDate: {
        fontSize: 12,
        color: defaultColors.textSecondary,
      },
      paymentMethod: {
        fontSize: 12,
        color: defaultColors.textSecondary,
      },
      paymentNotes: {
        fontSize: 12,
        color: defaultColors.textSecondary,
      },
      feeCard: {
        padding: 16,
        borderWidth: 1,
        borderColor: defaultColors.border,
        borderRadius: 8,
        marginBottom: 16,
      },
      feeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      },
      studentName: {
        fontSize: 16,
        fontWeight: '600',
      },
      classInfo: {
        fontSize: 12,
        color: defaultColors.textSecondary,
      },
      feeDetails: {
        marginBottom: 12,
      },
      feeInfo: {
        marginBottom: 8,
      },
      feeLabel: {
        fontSize: 12,
        marginBottom: 4,
      },
      feeValue: {
        fontSize: 14,
        fontWeight: '500',
      },
      feeActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      feeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
      },
      feeButtonText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
      },
      feeIconButton: {
        padding: 8,
        borderRadius: 8,
      },
      statusBadge: {
        padding: 4,
        borderRadius: 4,
      },
      statusText: {
        fontSize: 12,
        fontWeight: '500',
      },
      summaryContainer: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      mainStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
      },
      summaryCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 4,
      },
      summaryIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
      },
      summaryLabel: {
        fontSize: 12,
        marginBottom: 4,
      },
      summaryValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
      },
      summarySubtext: {
        fontSize: 12,
      },
      statusBreakdown: {
        marginBottom: 16,
      },
      breakdownTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
      },
      statusGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
      },
      statusTextContainer: {
        flexDirection: 'column',
      },
      statusCount: {
        fontSize: 16,
        fontWeight: '600',
      },
      statusLabel: {
        fontSize: 12,
      },
      quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
      },
      actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
      },
      actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
      },
      screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
      },
      screenSubtitle: {
        fontSize: 14,
        marginTop: 4,
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
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
      },
      addButtonText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontWeight: '600',
      },
      filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
      },
      searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderWidth: 1,
        borderColor: defaultColors.border,
        borderRadius: 8,
        flex: 1,
      },
      searchInput: {
        flex: 1,
        padding: 8,
      },
      statusFilters: {
        flexDirection: 'row',
        padding: 8,
      },
      statusFilter: {
        padding: 8,
        borderWidth: 1,
        borderColor: defaultColors.border,
        borderRadius: 8,
      },
      statusFilterText: {
        fontSize: 14,
        fontWeight: '500',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
      },
      emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
      },
      emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        maxWidth: '80%',
      },
      feeListContainer: {
        marginTop: 8,
      },
      bulkActionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: defaultColors.border,
      },
      bulkActionText: {
        fontSize: 14,
        fontWeight: '500',
      },
      bulkActionButtons: {
        flexDirection: 'row',
      },
      bulkActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 8,
      },
      bulkActionButtonText: {
        color: '#FFFFFF',
        marginLeft: 4,
        fontWeight: '500',
      },
      container: {
        flex: 1,
      },
      scrollContent: {
        padding: 16,
      },
      filterSection: {
        marginBottom: 24,
      },
      filterLabel: {
        fontSize: 12,
        marginBottom: 4,
      },
      filterInput: {
        padding: 8,
        borderWidth: 1,
        borderColor: defaultColors.border,
        borderRadius: 8,
      },
      filterActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
      },
      filterButton: {
        padding: 12,
        borderRadius: 8,
      },
      filterButtonText: {
        fontSize: 14,
        fontWeight: '600',
      },
      checkboxContainer: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
      },
      paymentForm: {
        padding: 16,
      },
      input: {
        padding: 8,
        borderWidth: 1,
        borderColor: defaultColors.border,
        borderRadius: 8,
        marginBottom: 16,
      },
      submitButton: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: defaultColors.accent,
        alignItems: 'center',
      },
      submitButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
      },
})

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, filters, onApplyFilters, onResetFilters }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [localFilters, setLocalFilters] = useState(filters);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay]}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Filter Fees</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {/* Filter options */}
            <View style={styles.filterSection}>
              {/* Fee Type */}
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Fee Type</Text>
              <TextInput
                style={[styles.filterInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
                value={localFilters.feeType}
                onChangeText={(text) => setLocalFilters({...localFilters, feeType: text})}
                placeholder="Select fee type"
                placeholderTextColor={colors.textSecondary}
              />

              {/* Academic Year */}
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Academic Year</Text>
              <TextInput
                style={[styles.filterInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
                value={localFilters.academicYear}
                onChangeText={(text) => setLocalFilters({...localFilters, academicYear: text})}
                placeholder="e.g. 2023-24"
                placeholderTextColor={colors.textSecondary}
              />

              {/* Class */}
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Class</Text>
              <TextInput
                style={[styles.filterInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
                value={localFilters.class}
                onChangeText={(text) => setLocalFilters({...localFilters, class: text})}
                placeholder="Select class"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Filter Actions */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: colors.danger + '20' }]}
                onPress={onResetFilters}
              >
                <Text style={[styles.filterButtonText, { color: colors.danger }]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: colors.accent }]}
                onPress={() => {
                  onApplyFilters(localFilters);
                  onClose();
                }}
              >
                <Text style={[styles.filterButtonText, { color: '#FFFFFF' }]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  fee,
  onClose,
  onSubmit,
  amount,
  setAmount,
  method,
  setMethod,
  note,
  setNote,
  reference,
  setReference,
  processing
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Record Payment</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.paymentForm}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
                placeholder="Amount"
                placeholderTextColor={colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                editable={!processing}
              />
              
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
                placeholder="Reference Number"
                placeholderTextColor={colors.textSecondary}
                value={reference}
                onChangeText={setReference}
                editable={!processing}
              />
              
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
                placeholder="Notes"
                placeholderTextColor={colors.textSecondary}
                value={note}
                onChangeText={setNote}
                multiline
                editable={!processing}
              />

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.accent }]}
                onPress={onSubmit}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function FeesScreen() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [filteredFees, setFilteredFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Payment['method']>('Cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedFees, setSelectedFees] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    feeType: '',
    academicYear: '',
    term: '',
    class: ''
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFeeForDetails, setSelectedFeeForDetails] = useState<FeeRecord | null>(null);
  
  const navigation = useNavigation();
  const { theme } = useTheme();

  const colors = getThemeColors(theme);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      
      // Using the provided mock data instead of the sample in the original component
      const mockFees: FeeRecord[] = [
        {
          id: '1',
          student: { id: '1', name: 'Rahul Sharma' },
          class: { id: '1', name: 'XI' },
          section: { id: '1', name: 'A' },
          amount: 45000,
          dueDate: '2023-04-15',
          status: 'Paid',
          payments: [
            { 
              amount: 45000, 
              date: '2023-04-10', 
              method: 'Cash', 
              receiptNo: 'REC-001', 
              reference: 'FD-001',
              notes: 'Full payment received'
            }
          ],
          feeType: 'Tuition',
          academicYear: '2023-24',
          term: 'Term1',
          createdAt: '2023-03-01',
          updatedAt: '2023-04-10',
          totalPaid: 45000,
          remainingBalance: 0
        },
        {
          id: '2',
          student: { id: '2', name: 'Priya Patel' },
          class: { id: '1', name: 'XI' },
          section: { id: '2', name: 'B' },
          amount: 45000,
          dueDate: '2023-04-15',
          status: 'Paid',
          payments: [
            { 
              amount: 45000, 
              date: '2023-04-12', 
              method: 'UPI', 
              receiptNo: 'REC-002',
              reference: 'UPI-REF-1234',
              notes: 'Paid via Google Pay'
            }
          ],
          feeType: 'Tuition',
          academicYear: '2023-24',
          term: 'Term1',
          createdAt: '2023-03-01',
          updatedAt: '2023-04-12',
          totalPaid: 45000,
          remainingBalance: 0
        },
        {
          id: '3',
          student: { id: '3', name: 'Amit Kumar' },
          class: { id: '2', name: 'X' },
          section: { id: '1', name: 'A' },
          amount: 40000,
          dueDate: '2023-04-15',
          status: 'Pending',
          payments: [],
          feeType: 'Tuition',
          academicYear: '2023-24',
          term: 'Term1',
          createdAt: '2023-03-01',
          updatedAt: '2023-03-01',
          totalPaid: 0,
          remainingBalance: 40000
        },
        {
          id: '4',
          student: { id: '4', name: 'Sneha Gupta' },
          class: { id: '2', name: 'X' },
          section: { id: '2', name: 'B' },
          amount: 40000,
          dueDate: '2023-04-15',
          status: 'Overdue',
          payments: [],
          feeType: 'Tuition',
          academicYear: '2023-24',
          term: 'Term1',
          createdAt: '2023-03-01',
          updatedAt: '2023-03-01',
          totalPaid: 0,
          remainingBalance: 40000
        },
        {
          id: '5',
          student: { id: '5', name: 'Vikram Singh' },
          class: { id: '3', name: 'XII' },
          section: { id: '1', name: 'A' },
          amount: 50000,
          dueDate: '2023-04-15',
          status: 'Pending',
          payments: [],
          feeType: 'Tuition',
          academicYear: '2023-24',
          term: 'Term1',
          createdAt: '2023-03-01',
          updatedAt: '2023-03-01',
          totalPaid: 0,
          remainingBalance: 50000
        },
        {
          id: '6',
          student: { id: '6', name: 'Nisha Reddy' },
          class: { id: '3', name: 'XII' },
          section: { id: '2', name: 'B' },
          amount: 50000,
          dueDate: '2023-04-15',
          status: 'Partial',
          payments: [
            { 
              amount: 25000, 
              date: '2023-04-10', 
              method: 'Cash', 
              receiptNo: 'REC-003',
              notes: 'First installment'
            }
          ],
          feeType: 'Tuition',
          academicYear: '2023-24',
          term: 'Term1',
          createdAt: '2023-03-01',
          updatedAt: '2023-04-10',
          totalPaid: 25000,
          remainingBalance: 25000
        },
        {
          id: '7',
          student: { id: '7', name: 'Raj Malhotra' },
          class: { id: '4', name: 'IX' },
          section: { id: '1', name: 'A' },
          amount: 5000,
          dueDate: '2023-04-15',
          status: 'Overdue',
          payments: [],
          feeType: 'Transport',
          academicYear: '2023-24',
          term: 'Term1',
          createdAt: '2023-03-01',
          updatedAt: '2023-03-01',
          totalPaid: 0,
          remainingBalance: 5000
        },
        {
          id: '8',
          student: { id: '8', name: 'Ananya Verma' },
          class: { id: '4', name: 'IX' },
          section: { id: '2', name: 'B' },
          amount: 3000,
          dueDate: '2023-04-15',
          status: 'Paid',
          payments: [
            { 
              amount: 3000, 
              date: '2023-04-05', 
              method: 'Bank Transfer', 
              receiptNo: 'REC-004',
              reference: 'NEFT-12345',
              notes: 'Library fees'
            }
          ],
          feeType: 'Library',
          academicYear: '2023-24',
          term: 'Term1',
          createdAt: '2023-03-01',
          updatedAt: '2023-04-05',
          totalPaid: 3000,
          remainingBalance: 0
        },
        {
          id: '9',
          student: { id: '9', name: 'Karan Kapoor' },
          class: { id: '5', name: 'VIII' },
          section: { id: '1', name: 'A' },
          amount: 4000,
          dueDate: '2023-07-15',
          status: 'Pending',
          payments: [],
          feeType: 'Laboratory',
          academicYear: '2023-24',
          term: 'Term2',
          createdAt: '2023-06-01',
          updatedAt: '2023-06-01',
          totalPaid: 0,
          remainingBalance: 4000
        },
        {
          id: '10',
          student: { id: '10', name: 'Meera Sharma' },
          class: { id: '5', name: 'VIII' },
          section: { id: '2', name: 'B' },
          amount: 2000,
          dueDate: '2023-07-15',
          status: 'Paid',
          payments: [
            { 
              amount: 2000, 
              date: '2023-07-10', 
              method: 'Card', 
              receiptNo: 'REC-005',
              reference: 'CC-98765',
              notes: 'Other fees'
            }
          ],
          feeType: 'Other',
          academicYear: '2023-24',
          term: 'Term2',
          createdAt: '2023-06-01',
          updatedAt: '2023-07-10',
          totalPaid: 2000,
          remainingBalance: 0
        },
      ];
      
      setFees(mockFees);
      setFilteredFees(mockFees);
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters when search query, status, or advanced filters change
    applyFilters();
  }, [searchQuery, statusFilter, advancedFilters, fees]);

  const applyFilters = () => {
    let results = [...fees];
    
    // Apply search query filter
    if (searchQuery) {
      results = results.filter(fee => 
        fee.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.payments.some(p => p.receiptNo?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      results = results.filter(fee => 
        fee.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply advanced filters
    if (advancedFilters.feeType) {
      results = results.filter(fee => fee.feeType === advancedFilters.feeType);
    }
    
    if (advancedFilters.academicYear) {
      results = results.filter(fee => fee.academicYear === advancedFilters.academicYear);
    }
    
    if (advancedFilters.term) {
      results = results.filter(fee => fee.term === advancedFilters.term);
    }
    
    if (advancedFilters.class) {
      results = results.filter(fee => fee.class.name === advancedFilters.class);
    }
    
    setFilteredFees(results);
  };

  const handlePaymentRecord = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.remainingBalance?.toString() || fee.amount.toString());
    setPaymentMethod('Cash');
    setPaymentNote('');
    setPaymentReference('');
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedFee || !paymentAmount) return;
    
    try {
      setProcessingPayment(true);
      
      const amount = parseFloat(paymentAmount);
      
      // Validate payment amount
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid payment amount');

        return setProcessingPayment(false);
      }
      
      const paymentDate = new Date().toISOString();
      
      const newPayment = {
        amount,
        date: paymentDate,
        method: paymentMethod,
        receiptNo: `REC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        reference: paymentReference || undefined,
        notes: paymentNote || undefined
      };

      // Calculate the new totals and status
      const totalPaid = selectedFee.totalPaid ? selectedFee.totalPaid + amount : amount;
      const remainingBalance = selectedFee.amount - totalPaid;
      
      let newStatus: FeeRecord['status'] = selectedFee.status;
      
      if (remainingBalance <= 0) {
        newStatus = 'Paid';
      } else if (totalPaid > 0) {
        newStatus = 'Partial';
      } else {
        newStatus = selectedFee.dueDate < new Date().toISOString() ? 'Overdue' : 'Pending';
      }

      // Update the fee record with new payment
      const updatedFees = fees.map(fee => {
        if (fee.id === selectedFee.id) {
          return {
            ...fee,
            status: newStatus,
            payments: [...(fee.payments || []), newPayment],
            totalPaid,
            remainingBalance,
            updatedAt: new Date().toISOString()
          };
        }
        return fee;
      });
      
      setFees(updatedFees);
      setFilteredFees(updatedFees.filter(fee => 
        (!searchQuery || 
          fee.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fee.payments.some(p => p.receiptNo?.toLowerCase().includes(searchQuery.toLowerCase()))
        ) &&
        (!statusFilter || fee.status.toLowerCase() === statusFilter.toLowerCase())
      ));
      
      Alert.alert(
        'Payment Recorded',
        `Payment of ₹${amount.toLocaleString()} successfully recorded for ${selectedFee.student.name}.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error recording payment:', error);
      Alert.alert('Error', 'Failed to record payment. Please try again.');
    } finally {
      setProcessingPayment(false);
      setShowPaymentModal(false);
      
      // Reset form
      setSelectedFee(null);
      setPaymentAmount('');
      setPaymentMethod('Cash');
      setPaymentNote('');
      setPaymentReference('');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || paymentDate;
    setShowDatePicker(false);
    setPaymentDate(currentDate);
  };

  const toggleSelectFee = (feeId: string) => {
    if (selectedFees.includes(feeId)) {
      setSelectedFees(selectedFees.filter(id => id !== feeId));
    } else {
      setSelectedFees([...selectedFees, feeId]);
    }
  };

  const handleBulkAction = (action: 'remind' | 'export' | 'delete') => {
    if (selectedFees.length === 0) {
      Alert.alert('No Selection', 'Please select at least one fee record');
      return;
    }

    switch (action) {
      case 'remind':
        Alert.alert(
          'Send Reminders',
          `Send payment reminders to ${selectedFees.length} student(s)?`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Send',
              onPress: () => {
                // Mock implementation
                Alert.alert('Success', `Reminders sent to ${selectedFees.length} student(s)`);
                setSelectedFees([]);
                setShowBulkActions(false);
              }
            }
          ]
        );
        break;
      case 'export':
        Alert.alert(
          'Export Records',
          `Export ${selectedFees.length} fee record(s)?`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Export',
              onPress: () => {
                // Mock implementation
                Alert.alert('Success', `${selectedFees.length} record(s) exported`);
                setSelectedFees([]);
                setShowBulkActions(false);
              }
            }
          ]
        );
        break;
      case 'delete':
        Alert.alert(
          'Delete Records',
          `Are you sure you want to delete ${selectedFees.length} fee record(s)?`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                const updatedFees = fees.filter(fee => !selectedFees.includes(fee.id));
                setFees(updatedFees);
                setFilteredFees(updatedFees);
                setSelectedFees([]);
                setShowBulkActions(false);
                Alert.alert('Success', `${selectedFees.length} record(s) deleted`);
              }
            }
          ]
        );
        break;
    }
  };

  const resetFilters = () => {
    setAdvancedFilters({
      feeType: '',
      academicYear: '',
      term: '',
      class: ''
    });
    setStatusFilter('');
    setSearchQuery('');
    setShowFilterModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return defaultColors.success;
      case 'partial':
        return defaultColors.warning;
      case 'pending':
        return defaultColors.accent;
      case 'overdue':
        return defaultColors.danger;
      default:
        return defaultColors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
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

  const FeeDetailsModal: React.FC<FeeDetailsModalProps> = ({ fee, visible, onClose }) => {
    const { theme } = useTheme();
    const colors = getThemeColors(theme);
  
    const paymentData = {
      labels: fee.payments.map(p => new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        data: fee.payments.map(p => p.amount)
      }]
    };
  
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Fee Details</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
  
            <ScrollView>
              {/* Student Information */}
              <View style={styles.detailsSection}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Student Information</Text>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Name</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{fee.student.name}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Class</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                      {fee.class.name}-{fee.section.name}
                    </Text>
                  </View>
                </View>
              </View>
  
              {/* Fee Information */}
              <View style={styles.detailsSection}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Fee Information</Text>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fee Type</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{fee.feeType}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Term</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{fee.term}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Academic Year</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{fee.academicYear}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Due Date</Text>
                    <Text style={[styles.detailValue, { 
                      color: new Date(fee.dueDate) < new Date() && fee.status !== 'Paid' 
                        ? defaultColors.danger 
                        : defaultColors.textPrimary 
                    }]}>
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
  
              {/* Payment Status */}
              <View style={styles.detailsSection}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Payment Status</Text>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Total Amount</Text>
                    <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                      ₹{fee.amount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Paid Amount</Text>
                    <Text style={[styles.detailValue, { color: defaultColors.success }]}>
                      ₹{fee.totalPaid?.toLocaleString() || '0'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Balance</Text>
                    <Text style={[styles.detailValue, { color: defaultColors.warning }]}>
                      ₹{fee.remainingBalance?.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fee.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(fee.status) }]}>
                        {getStatusLabel(fee.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
  
              {/* Payment History */}
              {fee.payments?.length > 0 && (
                <View style={styles.detailsSection}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Payment History</Text>
                  {fee.payments.map((payment, index) => (
                    <View key={payment.receiptNo} style={[styles.paymentItem, { backgroundColor: colors.inputBackground }]}>
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
                        {payment.reference ? ` • Ref: ${payment.reference}` : ''}
                      </Text>
                      {payment.notes && (
                        <Text style={[styles.paymentNotes, { color: colors.textSecondary }]}>
                          Note: {payment.notes}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
  
              {/* Payment Timeline Chart */}
              {fee.payments?.length > 0 && (
                <View style={styles.detailsSection}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Payment Timeline</Text>
                  <LineChart
                    data={paymentData}
                    width={Dimensions.get('window').width - 64}
                    height={220}
                    chartConfig={{
                      backgroundColor: colors.cardBackground,
                      backgroundGradientFrom: colors.cardBackground,
                      backgroundGradientTo: colors.cardBackground,
                      decimalPlaces: 0,
                      color: (opacity = 1) => colors.accent,
                      labelColor: (opacity = 1) => colors.textSecondary,
                      style: {
                        borderRadius: 16
                      },
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: colors.accent
                      }
                    }}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16
                    }}
                  />
                </View>
              )}
  
              {/* Actions */}
              <View style={styles.detailsActions}>
                {fee.status !== 'Paid' && (
                  <TouchableOpacity
                    style={[styles.detailsButton, { backgroundColor: defaultColors.success }]}
                    onPress={() => {
                      onClose();
                      handlePaymentRecord(fee);
                    }}
                  >
                    <MaterialIcons name="payments" size={20} color="#FFFFFF" />
                    <Text style={styles.detailsButtonText}>Record Payment</Text>
                  </TouchableOpacity>
                )}
                
                {fee.payments.length > 0 && (
                  <TouchableOpacity
                    style={[styles.detailsButton, { backgroundColor: defaultColors.accent }]}
                    onPress={() => Alert.alert('Export', 'Export functionality would be implemented here')}
                  >
                    <MaterialCommunityIcons name="file-download" size={20} color="#FFFFFF" />
                    <Text style={styles.detailsButtonText}>Export History</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderPaymentHistory = (payments: Payment[]) => (
    <View style={styles.paymentHistory}>
      <Text style={[styles.paymentHistoryTitle, { color: defaultColors.textPrimary }]}>
        Payment History
      </Text>
      {payments.map((payment, index) => (
        <View key={payment.receiptNo || index} style={[styles.paymentItem, { backgroundColor: defaultColors.inputBackground }]}>
          <View style={styles.paymentItemHeader}>
            <Text style={[styles.paymentAmount, { color: defaultColors.textPrimary }]}>
              ₹{payment.amount.toLocaleString()}
            </Text>
            <Text style={[styles.paymentDate, { color: defaultColors.textSecondary }]}>
              {new Date(payment.date).toLocaleDateString()}
            </Text>
          </View>
          <Text style={[styles.paymentMethod, { color: defaultColors.textSecondary }]}>
            {payment.method} • Receipt: {payment.receiptNo}
            {payment.reference ? ` • Ref: ${payment.reference}` : ''}
          </Text>
          {payment.notes && (
            <Text style={[styles.paymentNotes, { color: defaultColors.textSecondary }]}>
              Note: {payment.notes}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  const renderFeeItem = ({ item }: { item: FeeRecord }) => (
    <View style={[styles.feeCard, { backgroundColor: defaultColors.cardBackground }]}>
      {showBulkActions && (
        <TouchableOpacity 
          style={[styles.checkboxContainer, { 
            backgroundColor: selectedFees.includes(item.id) ? defaultColors.accent : 'transparent',
            borderColor: selectedFees.includes(item.id) ? defaultColors.accent : defaultColors.border
          }]}
          onPress={() => toggleSelectFee(item.id)}
        >
          {selectedFees.includes(item.id) && (
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      )}
      
      <View style={styles.feeHeader}>
        <View>
          <Text style={[styles.studentName, { color: defaultColors.textPrimary }]}>{item.student.name}</Text>
          <Text style={[styles.classInfo, { color: defaultColors.textSecondary }]}>
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
          <Text style={[styles.feeLabel, { color: defaultColors.textSecondary }]}>Fee Type</Text>
          <Text style={[styles.feeValue, { color: defaultColors.textPrimary }]}>{item.feeType}</Text>
        </View>
        
        <View style={styles.feeInfo}>
          <Text style={[styles.feeLabel, { color: defaultColors.textSecondary }]}>Term</Text>
          <Text style={[styles.feeValue, { color: defaultColors.textPrimary }]}>
            {item.term} ({item.academicYear})
          </Text>
        </View>
        
        <View style={styles.feeInfo}>
          <Text style={[styles.feeLabel, { color: defaultColors.textSecondary }]}>Total Amount</Text>
          <Text style={[styles.feeValue, { color: defaultColors.textPrimary }]}>
            ₹{item.amount.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.feeInfo}>
          <Text style={[styles.feeLabel, { color: defaultColors.textSecondary }]}>Paid Amount</Text>
          <Text style={[styles.feeValue, { color: defaultColors.success }]}>
            ₹{item.totalPaid?.toLocaleString() || '0'}
          </Text>
        </View>
        
        {(item.remainingBalance ?? 0) > 0 && (
          <View style={styles.feeInfo}>
            <Text style={[styles.feeLabel, { color: defaultColors.textSecondary }]}>Balance</Text>
            <Text style={[styles.feeValue, { color: defaultColors.warning }]}>
              ₹{item.remainingBalance?.toLocaleString()}
            </Text>
          </View>
        )}
        
        <View style={styles.feeInfo}>
          <Text style={[styles.feeLabel, { color: defaultColors.textSecondary }]}>Due Date</Text>
          <Text style={[
            styles.feeValue, 
            { 
              color: new Date(item.dueDate) < new Date() && item.status.toLowerCase() !== 'paid' 
                ? defaultColors.danger 
                : defaultColors.textPrimary 
            }
          ]}>
            {new Date(item.dueDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      {item.payments?.length > 0 && renderPaymentHistory(item.payments)}
      
      <View style={styles.feeActions}>
        {item.status.toLowerCase() === 'paid' ? (
          <TouchableOpacity 
            style={[styles.feeButton, { backgroundColor: defaultColors.accent + '20' }]}
            onPress={() => Alert.alert('View Receipt', 'Receipt functionality would be implemented here')}
          >
            <MaterialCommunityIcons name="receipt" size={18} color={defaultColors.accent} />
            <Text style={[styles.feeButtonText, { color: defaultColors.accent }]}>View Receipt</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.feeButton, { backgroundColor: defaultColors.success + '20' }]}
            onPress={() => handlePaymentRecord(item)}
          >
            <MaterialIcons name="payments" size={18} color={defaultColors.success} />
            <Text style={[styles.feeButtonText, { color: defaultColors.success }]}>Record Payment</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.feeIconButton, { backgroundColor: defaultColors.accent + '20' }]}
          onPress={() => {
            setSelectedFeeForDetails(item);
            setShowDetailsModal(true);
          }}
        >
          <Ionicons name="chevron-forward" size={18} color={defaultColors.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const FeeSummary = () => {
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalCollected = fees.reduce((sum, fee) => sum + (fee.totalPaid || 0), 0);
    const totalDue = totalFees - totalCollected;
    const overdueFees = fees.filter(fee => fee.status === 'Overdue').length;
    const pendingFees = fees.filter(fee => fee.status === 'Pending').length;
    const partialFees = fees.filter(fee => fee.status === 'Partial').length;
    const paidFees = fees.filter(fee => fee.status === 'Paid').length;

    const collectionRate = totalFees > 0 ? (totalCollected / totalFees) * 100 : 0;
    
    return (
      <View style={[styles.summaryContainer, { backgroundColor: defaultColors.cardBackground }]}>
        {/* Main Stats */}
        <View style={styles.mainStats}>
          <View style={[styles.summaryCard, { backgroundColor: defaultColors.success + '10' }]}>
            <View style={[styles.summaryIconContainer, { backgroundColor: defaultColors.success + '20' }]}>
              <MaterialIcons name="payments" size={24} color={defaultColors.success} />
            </View>
            <Text style={[styles.summaryLabel, { color: defaultColors.textSecondary }]}>Total Collected</Text>
            <Text style={[styles.summaryValue, { color: defaultColors.success }]}>
              ₹{totalCollected.toLocaleString()}
            </Text>
            <Text style={[styles.summarySubtext, { color: defaultColors.textSecondary }]}>
              {collectionRate.toFixed(1)}% collected
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: defaultColors.warning + '10' }]}>
            <View style={[styles.summaryIconContainer, { backgroundColor: defaultColors.warning + '20' }]}>
              <MaterialCommunityIcons name="clock" size={24} color={defaultColors.warning} />
            </View>
            <Text style={[styles.summaryLabel, { color: defaultColors.textSecondary }]}>Total Due</Text>
            <Text style={[styles.summaryValue, { color: defaultColors.warning }]}>
              ₹{totalDue.toLocaleString()}
            </Text>
            <Text style={[styles.summarySubtext, { color: defaultColors.textSecondary }]}>
              {pendingFees + partialFees} pending payments
            </Text>
          </View>
        </View>

        {/* Status Breakdown */}
        <View style={styles.statusBreakdown}>
          <Text style={[styles.breakdownTitle, { color: defaultColors.textPrimary }]}>Status Breakdown</Text>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: defaultColors.success }]} />
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusCount, { color: defaultColors.textPrimary }]}>{paidFees}</Text>
                <Text style={[styles.statusLabel, { color: defaultColors.textSecondary }]}>Paid</Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: defaultColors.warning }]} />
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusCount, { color: defaultColors.textPrimary }]}>{partialFees}</Text>
                <Text style={[styles.statusLabel, { color: defaultColors.textSecondary }]}>Partial</Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: defaultColors.accent }]} />
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusCount, { color: defaultColors.textPrimary }]}>{pendingFees}</Text>
                <Text style={[styles.statusLabel, { color: defaultColors.textSecondary }]}>Pending</Text>
              </View>
            </View>

            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: defaultColors.danger }]} />
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusCount, { color: defaultColors.textPrimary }]}>{overdueFees}</Text>
                <Text style={[styles.statusLabel, { color: defaultColors.textSecondary }]}>Overdue</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: defaultColors.accent + '10' }]}
            onPress={() => setShowBulkActions(!showBulkActions)}
          >
            <MaterialIcons 
              name={showBulkActions ? "check-box" : "check-box-outline-blank"} 
              size={20} 
              color={defaultColors.accent} 
            />
            <Text style={[styles.actionButtonText, { color: defaultColors.accent }]}>
              {showBulkActions ? 'Done' : 'Select Multiple'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: defaultColors.accent + '10' }]}
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialIcons name="filter-list" size={20} color={defaultColors.accent} />
            <Text style={[styles.actionButtonText, { color: defaultColors.accent }]}>Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const Header = () => {
    return (
      <View style={styles.header}>
        <View>
          <Text style={[styles.screenTitle, { color: defaultColors.textPrimary }]}>Fee Management</Text>
          <Text style={[styles.screenSubtitle, { color: defaultColors.textSecondary }]}>
            Manage and track student fees
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: defaultColors.accent + '10' }]}
            onPress={() => Alert.alert('Sync', 'Syncing data...')}
          >
            <MaterialCommunityIcons name="sync" size={22} color={defaultColors.accent} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: defaultColors.accent }]}
            onPress={() => Alert.alert('Add Fee', 'Add new fee record functionality')}
          >
            <MaterialIcons name="add" size={22} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Fee</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const SearchBarOLD = () => {
    return (
      <View style={[styles.searchBar, { backgroundColor: defaultColors.inputBackground, borderWidth: 1, borderColor: defaultColors.border, paddingHorizontal: 10, shadowColor: 'rgba(0, 0, 0, 0.2)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, borderRadius: 5, marginVertical: 10 }]}>
      <View style={[styles.searchBar, { backgroundColor: defaultColors.inputBackground }]}>
        <MaterialIcons name="search" size={20} color={defaultColors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: defaultColors.textPrimary }]}
          placeholder="Search by student name or receipt number"
          placeholderTextColor={defaultColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={[styles.statusFilters, { marginVertical: 10 }]}
      >
          {['All', 'Pending', 'Partial', 'Paid', 'Overdue'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilter,
                { 
                  backgroundColor: statusFilter === status.toLowerCase() ? defaultColors.accent + '20' : 'transparent',
                  borderColor: statusFilter === status.toLowerCase() ? defaultColors.accent : defaultColors.border
                }
              ]}
              onPress={() => setStatusFilter(status === 'All' ? '' : status.toLowerCase())}
            >
              <Text 
                style={[
                  styles.statusFilterText, 
                  { color: statusFilter === status.toLowerCase() ? defaultColors.accent : defaultColors.textPrimary }
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const SearchBarNEW = () => {
    return (
      <View style={styles1.searchContainer}>
        <View style={styles1.searchBar}>
          <MaterialIcons name="search" size={20} color={defaultColors.textSecondary} />
          <TextInput
            style={styles1.searchInput}
            placeholder="Search by student name or receipt number"
            placeholderTextColor={defaultColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles1.statusFilters}
        >
          {['All', 'Pending', 'Partial', 'Paid', 'Overdue'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles1.statusFilter,
                { 
                  backgroundColor: statusFilter === status.toLowerCase() ? defaultColors.accent + '20' : 'transparent',
                  borderColor: statusFilter === status.toLowerCase() ? defaultColors.accent : defaultColors.border
                }
              ]}
              onPress={() => setStatusFilter(status === 'All' ? '' : status.toLowerCase())}
            >
              <Text 
                style={[
                  styles1.statusFilterText, 
                  { color: statusFilter === status.toLowerCase() ? defaultColors.accent : defaultColors.textPrimary }
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const styles1 = StyleSheet.create({
    searchContainer: {
      flexDirection: 'column',
      marginVertical: 10,
      paddingHorizontal: 16,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderWidth: 1,
      borderColor: defaultColors.border,
      borderRadius: 8,
      backgroundColor: defaultColors.inputBackground,
      elevation: 2, // Add shadow for elevation
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
    },
    searchInput: {
      flex: 1,
      padding: 8,
      color: defaultColors.textPrimary,
      marginLeft: 8, // Space between icon and input
      fontSize: 16, // Increased font size for better readability
    },
    statusFilters: {
      marginTop: 10,
      flexDirection: 'row',
      paddingVertical: 8,
    },
    statusFilter: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: defaultColors.border,
      borderRadius: 8,
      marginRight: 8, // Space between filters
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusFilterText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });
  

  return (
    <View style={[styles.container, { backgroundColor: defaultColors.background }]}>
      <Header />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FeeSummary />
        <SearchBarNEW />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={defaultColors.accent} />
          </View>
        ) : filteredFees.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="cash-remove" size={60} color={defaultColors.textSecondary} />
            <Text style={[styles.emptyText, { color: defaultColors.textPrimary }]}>
              No fee records found
            </Text>
            <Text style={[styles.emptySubtext, { color: defaultColors.textSecondary }]}>
              Try different search criteria or clear filters
            </Text>
          </View>
        ) : (
          <View style={styles.feeListContainer}>
            {filteredFees.map((fee) => (
              <View key={fee.id}>
                {renderFeeItem({ item: fee })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bulk Action Bar */}
      {showBulkActions && selectedFees.length > 0 && (
        <View style={[styles.bulkActionBar, { backgroundColor: defaultColors.cardBackground }]}>
          <Text style={[styles.bulkActionText, { color: defaultColors.textPrimary }]}>
            {selectedFees.length} selected
          </Text>
          <View style={styles.bulkActionButtons}>
            <TouchableOpacity 
              style={[styles.bulkActionButton, { backgroundColor: defaultColors.accent }]}
              onPress={() => handleBulkAction('remind')}
            >
              <MaterialCommunityIcons name="bell" size={20} color="#FFFFFF" />
              <Text style={styles.bulkActionButtonText}>Remind</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkActionButton, { backgroundColor: defaultColors.success }]}
              onPress={() => handleBulkAction('export')}
            >
              <MaterialCommunityIcons name="file-export" size={20} color="#FFFFFF" />
              <Text style={styles.bulkActionButtonText}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.bulkActionButton, { backgroundColor: defaultColors.danger }]}
              onPress={() => handleBulkAction('delete')}
            >
              <MaterialCommunityIcons name="delete" size={20} color="#FFFFFF" />
              <Text style={styles.bulkActionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modals */}
      {selectedFeeForDetails && (
        <FeeDetailsModal
          fee={selectedFeeForDetails}
          visible={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedFeeForDetails(null);
          }}
        />
      )}

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={advancedFilters}
        onApplyFilters={(newFilters) => {
          setAdvancedFilters(newFilters);
          applyFilters();
        }}
        onResetFilters={resetFilters}
      />

      <PaymentModal
        visible={showPaymentModal}
        fee={selectedFee}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleSubmitPayment}
        amount={paymentAmount}
        setAmount={setPaymentAmount}
        method={paymentMethod}
        setMethod={setPaymentMethod}
        note={paymentNote}
        setNote={setPaymentNote}
        reference={paymentReference}
        setReference={setPaymentReference}
        processing={processingPayment}
      />
    </View>
  );
}