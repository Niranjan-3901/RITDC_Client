import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface EmptyStateProps {
  colors: any;
  message: string;
  icon: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ colors, message, icon }) => {
  const styles = createStyles(colors);
  
  return (
    <View style={styles.container}>
      <Icon name={icon} size={60} color={colors.border} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default EmptyState;