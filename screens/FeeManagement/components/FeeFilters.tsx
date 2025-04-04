import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FilterType } from '../types';

interface FeeFiltersProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  colors: any;
}

const FeeFilters: React.FC<FeeFiltersProps> = ({ currentFilter, onFilterChange, colors }) => {
  const styles = createStyles(colors);
  
  const filters: { key: FilterType; label: string; icon: string; color: string }[] = [
    { key: 'all', label: 'All', icon: 'view-list', color: colors.accent },
    { key: 'paid', label: 'Paid', icon: 'check-circle', color: colors.success },
    { key: 'unpaid', label: 'Unpaid', icon: 'alert-circle-outline', color: colors.warning },
    { key: 'partial', label: 'Partial', icon: 'circle-half-full', color: colors.warning },
    { key: 'overdue', label: 'Overdue', icon: 'clock-alert', color: colors.danger },
  ];
  
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              currentFilter === filter.key && styles.activeFilterButton,
              currentFilter === filter.key && { borderColor: filter.color }
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Icon 
              name={filter.icon} 
              size={18} 
              color={currentFilter === filter.key ? filter.color : colors.textSecondary}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterLabel,
                currentFilter === filter.key && styles.activeFilterLabel,
                currentFilter === filter.key && { color: filter.color }
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    paddingVertical: 16,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  activeFilterButton: {
    backgroundColor: `${colors.cardBackground}`,
    borderWidth: 1,
  },
  filterIcon: {
    marginRight: 5,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterLabel: {
    fontWeight: 'bold',
  },
});

export default FeeFilters;