import { AlertCircle, AlertTriangle, Calendar, CheckCircle, Clock, Edit, FileText, Mail, MapPin, Phone, PlusCircle, User, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getStudentDetailsById } from "../services/apiService";
import { ChangeStudentClassModal } from "./ClassSectionHandleModal";
import FeeRecordModal from './FeeRecordModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  accentLight: theme === "dark" ? "#2A2A42" : "#E6EAFA",
  cardShadow: theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)",
  divider: theme === "dark" ? "#333333" : "#EEEEEE"
});


const StudentDetailsModal = ({ isVisible, onClose, studentId, onEditPressed }) => {
  const { theme } = useTheme();
  const colors = getThemedColors(theme);
  const [studentData, setStudentData] = useState({});
  const [showFeeRecordModal, setShowFeeRecordModal] = useState(false);
  const [showClassChangeModal, setShowClassChangeModal] = useState(false);
  const [feeData, setFeeData] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(0);

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

  useEffect(() => {
    const fetchStudentData = async () => {
      if (studentId) {
        const stData = await getStudentDetailsById(studentId);
        setStudentData(stData.data.student);
        setFeeData(stData.data.feeData);
      }
    };
    fetchStudentData();
  }, [studentId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle size={18} color={colors.success} />;
      case 'unpaid':
        return <AlertCircle size={18} color={colors.danger} />;
      case 'partial':
        return <AlertTriangle size={18} color={colors.warning} />;
      default:
        return null;
    }
  };

  const renderFeePaymentHistory = (payments) => {
    if (!payments || payments.length === 0) return null;

    return (
      <View style={styles.paymentHistoryContainer}>
        <Text style={styles.paymentHistoryTitle}>Payment History</Text>
        {payments.map((payment, index) => (
          <View key={index} style={styles.paymentItem}>
            <View style={styles.paymentItemLeft}>
              <View style={[styles.paymentMethodBadge, { backgroundColor: colors.accentLight }]}>
                <Text style={styles.paymentMethodText}>{payment.method}</Text>
              </View>
              <Text style={styles.paymentDateText}>{formatDate(payment.date)}</Text>
            </View>
            <Text style={styles.paymentAmountText}>₹{payment.amount.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderFeeNotes = (notes) => {
    if (!notes || notes.length === 0) return null;

    return (
      <View style={styles.notesContainer}>
        <Text style={styles.notesTitle}>Notes</Text>
        {notes.map((note, index) => (
          <View key={index} style={styles.noteItem}>
            <Text style={styles.noteDate}>{formatDate(note.date)}</Text>
            <Text style={styles.noteText}>{note.text}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderFeeStatus = (feeRecord, index) => {
    const statusColors = {
      'paid': colors.success,
      'unpaid': colors.danger,
      'partial': colors.warning
    };

    return (
      <Animated.View
      key={index}
        style={[
          styles.feeStatusContainer,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          }
        ]}
      >
        <View style={styles.feeStatusHeader}>
          <View style={styles.feeStatusHeaderLeft}>
            {getStatusIcon(feeRecord.status)}
            <Text style={[styles.feeStatusText, { color: statusColors[feeRecord.status] }]}>
              {feeRecord.status.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.feeAmountText, { color: colors.textPrimary }]}>
            ₹{feeRecord.feeAmount.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.feeDivider, { backgroundColor: colors.divider }]} />

        <View style={styles.feeDetailsGrid}>
          <View style={styles.feeDetailItem}>
            <Text style={styles.feeDetailLabel}>Term</Text>
            <Text style={[styles.feeDetailValue, { color: colors.textPrimary }]}>{feeRecord.term}</Text>
          </View>

          <View style={styles.feeDetailItem}>
            <Text style={styles.feeDetailLabel}>Academic Year</Text>
            <Text style={[styles.feeDetailValue, { color: colors.textPrimary }]}>{feeRecord.academicYear}</Text>
          </View>

          <View style={styles.feeDetailItem}>
            <Text style={styles.feeDetailLabel}>Serial No.</Text>
            <Text style={[styles.feeDetailValue, { color: colors.textPrimary }]}>{feeRecord.serialNumber}</Text>
          </View>

          <View style={styles.feeDetailItem}>
            <Text style={styles.feeDetailLabel}>Admission Date</Text>
            <Text style={[styles.feeDetailValue, { color: colors.textPrimary }]}>{formatDate(feeRecord.admissionDate)}</Text>
          </View>

          <View style={styles.feeDetailItem}>
            <Text style={styles.feeDetailLabel}>Next Payment</Text>
            <Text style={[styles.feeDetailValue, { color: colors.accent }]}>{formatDate(feeRecord.nextPaymentDate)}</Text>
          </View>

          <View style={styles.feeDetailItem}>
            <Text style={styles.feeDetailLabel}>Due Date</Text>
            <Text style={[styles.feeDetailValue, { color: colors.warning }]}>{formatDate(feeRecord.dueDate)}</Text>
          </View>
        </View>

        {renderFeePaymentHistory(feeRecord.payments)}
        {renderFeeNotes(feeRecord.notes)}
      </Animated.View>
    );
  };

  const InfoItem = ({ icon, label, value }) => (
    <Animated.View
      style={[
        styles.infoSection,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          transform: [{ translateX: slideAnim }]
        }
      ]}
    >
      <View style={styles.infoIconContainer}>
        {icon}
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value || 'N/A'}</Text>
      </View>
    </Animated.View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoList}>
              <InfoItem
                icon={<User color={colors.accent} size={22} />}
                label="Admission Number"
                value={studentData.admissionNumber}
              />
              <InfoItem
                icon={<Calendar color={colors.accent} size={22} />}
                label="Date of Birth"
                value={formatDate(studentData.dateOfBirth)}
              />
              <InfoItem
                icon={<Calendar color={colors.accent} size={22} />}
                label="Admission Date"
                value={formatDate(studentData.admissionDate)}
              />
              <InfoItem
                icon={<FileText color={colors.accent} size={22} />}
                label="Class & Section"
                value={`${studentData.class?.name || ''} ${studentData.section?.name || ''}`}
              />
              <InfoItem
                icon={<Phone color={colors.accent} size={22} />}
                label="Contact"
                value={studentData.contactNumber}
              />
              <InfoItem
                icon={<Mail color={colors.accent} size={22} />}
                label="Email"
                value={studentData.email}
              />
              <InfoItem
                icon={<MapPin color={colors.accent} size={22} />}
                label="Address"
                value={studentData.address}
              />
              <InfoItem
                icon={<User color={colors.accent} size={22} />}
                label="Parent Name"
                value={studentData.parentName}
              />
              <InfoItem
                icon={<Phone color={colors.accent} size={22} />}
                label="Parent Contact"
                value={studentData.parentContact}
              />
              <InfoItem
                icon={<Clock color={colors.accent} size={22} />}
                label="Status"
                value={studentData.status}
              />
            </View>
          </View>
        );
      case 'fees':
        return (
          <View style={styles.tabContent}>
            {feeData && feeData.length > 0 ? (
              feeData.map((feeRecord, index) => renderFeeStatus(feeRecord, index))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  No fee records available
                </Text>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalContainer: {
      width: SCREEN_WIDTH * 0.95,
      backgroundColor: colors.background,
      borderRadius: 20,
      maxHeight: '95%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 15,
      overflow: 'hidden'
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.cardBackground
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textPrimary,
      flex: 1
    },
    profileContainer: {
      alignItems: 'center',
      backgroundColor: colors.background
    },
    profileBanner: {
      width: '100%',
      height: 100,
      backgroundColor: colors.accent,
      position: 'absolute',
      top: 0
    },
    bannerEdit:{
      position: 'absolute',
      right: 10,
      top: 15,
    },
    profileImageContainer: {
      marginTop: 20,
      alignItems: 'center'
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: colors.cardBackground,
      backgroundColor: colors.accentLight
    },
    profileImagePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: colors.cardBackground
    },
    profilePlaceholderText: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.accent
    },
    profileInfo: {
      alignItems: 'center',
      marginTop: 15,
      marginBottom: 20
    },
    profileName: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: 'bold'
    },
    profileMeta: {
      flexDirection: 'row',
      marginTop: 5,
      backgroundColor: colors.accentLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15
    },
    profileMetaText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '600'
    },
    tabsContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.cardBackground,
      width: '100%'
    },
    tabButton: {
      flex: 1,
      paddingVertical: 15,
      alignItems: 'center'
    },
    activeTabIndicator: {
      height: 3,
      width: '50%',
      backgroundColor: colors.accent,
      position: 'absolute',
      bottom: 0,
      alignSelf: 'center'
    },
    tabText: {
      fontWeight: '600',
      fontSize: 16
    },
    tabContent: {
      // position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      padding: 20,
      padding: 16,
      width: '100%'
    },
    infoList: {
      width: '100%',
      marginBottom: 20
    },
    infoSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 15,
      borderRadius: 12,
      marginVertical: 6,
      borderWidth: 1,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    infoIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15
    },
    infoTextContainer: {
      flex: 1
    },
    infoLabel: {
      fontSize: 12,
      marginBottom: 2
    },
    infoValue: {
      fontSize: 16,
      fontWeight: '500'
    },
    actionButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 16,
      width: '100%',
      backgroundColor: colors.cardBackground,
      borderTopWidth: 1,
      borderTopColor: colors.border
    },
    actionButton: {
      flexDirection: 'row',
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5
    },
    actionButtonText: {
      color: 'white',
      marginLeft: 8,
      fontWeight: '600'
    },
    feeStatusContainer: {
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      overflow: 'hidden',
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    feeStatusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16
    },
    feeStatusHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    feeStatusText: {
      fontWeight: 'bold',
      fontSize: 16,
      marginLeft: 8
    },
    feeAmountText: {
      fontSize: 18,
      fontWeight: 'bold'
    },
    feeDivider: {
      height: 1,
      width: '100%'
    },
    feeDetailsGrid: {
      padding: 16,
      flexDirection: 'row',
      flexWrap: 'wrap'
    },
    feeDetailItem: {
      width: '50%',
      paddingVertical: 8
    },
    feeDetailLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4
    },
    feeDetailValue: {
      fontSize: 15,
      fontWeight: '500'
    },
    paymentHistoryContainer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider
    },
    paymentHistoryTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 12
    },
    paymentItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider
    },
    paymentItemLeft: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    paymentMethodBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginRight: 8
    },
    paymentMethodText: {
      fontSize: 12,
      color: colors.accent,
      fontWeight: '500'
    },
    paymentDateText: {
      fontSize: 14,
      color: colors.textSecondary
    },
    paymentAmountText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary
    },
    notesContainer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.divider
    },
    notesTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 12
    },
    noteItem: {
      marginBottom: 12,
      padding: 12,
      backgroundColor: colors.accentLight,
      borderRadius: 8
    },
    noteDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4
    },
    noteText: {
      fontSize: 14,
      color: colors.textPrimary
    },
    emptyState: {
      padding: 40,
      justifyContent: 'center',
      alignItems: 'center'
    },
    emptyStateText: {
      fontSize: 16,
      textAlign: 'center'
    }
  });

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Student Details</Text>
            <TouchableOpacity onPress={onClose}>
              <X color={colors.textPrimary} size={24} />
            </TouchableOpacity>
          </View>

          <View
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.profileContainer}
          >
            <View style={styles.profileBanner}>
            <TouchableOpacity
              style={[styles.bannerEdit, styles.actionButton]}
              onPress={() => {
                onEditPressed();
                onClose()
              }}
            >
              <Edit color="white" size={20} />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.profileImageContainer}>
              {studentData.profileImage ? (
                <Image
                  source={{ uri: studentData.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profilePlaceholderText}>
                    {studentData.firstName ? studentData.firstName.charAt(0) : ''}
                    {studentData.lastName ? studentData.lastName.charAt(0) : ''}
                  </Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {studentData.firstName} {studentData.lastName}
                </Text>
                <View style={styles.profileMeta}>
                  <Text style={styles.profileMetaText}>
                    Class {studentData.class?.name || ''}-{studentData.section?.name || ''}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => setActiveTab('profile')}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'profile' ? colors.accent : colors.textSecondary }
                ]}>
                  Profile
                </Text>
                {activeTab === 'profile' && <View style={styles.activeTabIndicator} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => setActiveTab('fees')}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'fees' ? colors.accent : colors.textSecondary }
                ]}>
                  Fee Details
                </Text>
                {activeTab === 'fees' && <View style={styles.activeTabIndicator} />}
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.47 }}>
              {renderTabContent()}
            </ScrollView>
          </View>

          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowFeeRecordModal(true)}
            >
              <PlusCircle color="white" size={20} />
              <Text style={styles.actionButtonText}>Add Fee Record</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowClassChangeModal(true)}
            >
              <Edit color="white" size={20} />
              <Text style={styles.actionButtonText}>Change Class</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Nested Modals */}
      {showFeeRecordModal && <FeeRecordModal
        isVisible={showFeeRecordModal}
        onClose={() => setShowFeeRecordModal(false)}
        studentData={{
          id: studentData._id,
          class: studentData.class?.name,
          section: studentData.section?.name,
          name: studentData.firstName + ' ' + studentData.lastName,
          admissionNumber: studentData.admissionNumber,
          admissionDate: studentData.admissionDate
        }}
      />}

      {showClassChangeModal &&
        <ChangeStudentClassModal
          isVisible={showClassChangeModal}
          onClose={() => setShowClassChangeModal(false)}
          studentData={{
            id: studentData._id,
            class: studentData.class,
            section: studentData.section,
            name: studentData.firstName + ' ' + studentData.lastName,
            admissionNumber: studentData.admissionNumber,
            admissionDate: studentData.admissionDate
          }}
        />}
    </Modal>
  );
};

export default StudentDetailsModal;