import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface LoaderProps {
  colors: any;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ colors, message }) => {
  const styles = createStyles(colors);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background + 'CC',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
});

export default Loader;