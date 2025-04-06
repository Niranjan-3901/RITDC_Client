import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { Student, StudentNote } from '../types';
import { useAlert } from '../../../utils/Alert/AlertManager';

interface NoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (note: StudentNote) => void;
  student: Student | null;
  colors: any;
}

const NoteModal: React.FC<NoteModalProps> = ({
  visible,
  onClose,
  onSubmit,
  student,
  colors
}) => {
  const styles = createStyles(colors);
  
  const [noteText, setNoteText] = useState('');
  // const [submittingState, setSubmittingState] = useState(false);
  
  const handleSubmit = () => {
    if (!noteText.trim()) {
      // alert('Please enter a note');
      useAlert().showAlert({title:'Error', message:'Please enter a note'});
      
      return;
    }
    
    onSubmit({
      date: format(new Date(), 'yyyy-MM-dd'),
      text: noteText.trim()
    });
    
    // Reset form
    setNoteText('');
  };
  
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
            <Text style={styles.modalTitle}>Add Note</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.studentName}>{student?.student?.firstName} {student?.student?.lastName}</Text>
            <Text style={styles.admissionNumber}>{student?.student?.admissionNumber}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Note</Text>
              <TextInput
                style={styles.noteInput}
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Enter your note here..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.noteHintContainer}>
              <Icon name="lightbulb-outline" size={18} color={colors.warning} />
              <Text style={styles.noteHint}>
                Add important information like fee extension, special considerations, etc.
              </Text>
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, !noteText.trim() && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={!noteText.trim()}
            >
              <Text style={styles.submitButtonText}>Add Note</Text>
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
  inputContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    height: 120,
  },
  noteHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    padding: 12,
    borderRadius: 5,
    marginBottom: 16,
  },
  noteHint: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
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

export default NoteModal;