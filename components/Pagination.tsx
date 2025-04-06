import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  totalItems?: number;
  theme?: 'light' | 'dark';
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  theme = 'light',
}) => {
  const colors = {
    background: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    border: theme === 'dark' ? '#333333' : '#E1E4E8',
    text: theme === 'dark' ? '#FFFFFF' : '#333333',
    secondaryText: theme === 'dark' ? '#AAAAAA' : '#666666',
    accent: '#4A6FFF',
    disabled: theme === 'dark' ? '#333333' : '#E1E4E8',
    disabledText: theme === 'dark' ? '#666666' : '#999999',
  };

  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);

        if (currentPage > 3) {
            pages.push('...');
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage+1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push('...');
        }

        pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {totalItems !== undefined && (
        <Text style={[styles.infoText, { color: colors.secondaryText }]}>
          {totalItems > 0 ? 
            `Showing ${(currentPage - 1) * (itemsPerPage || 10) + 1}-${Math.min(currentPage * (itemsPerPage || 10), totalItems)} of ${totalItems}` : 
            'No items to display'
          }
        </Text>
      )}
      
      <View style={styles.paginationControls}>
        {/* Previous button */}
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === 1 && { backgroundColor: colors.disabled },
            { borderColor: colors.border }
          ]}
          onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons 
            name="chevron-back" 
            size={16} 
            color={currentPage === 1 ? colors.disabledText : colors.text} 
          />
        </TouchableOpacity>
        
        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <Text 
              key={`ellipsis-${index}`} 
              style={[styles.ellipsis, { color: colors.secondaryText }]}
            >
              •••
            </Text>
          ) : (
            <TouchableOpacity
              key={`page-${page}`}
              style={[
                styles.pageButton, 
                { borderColor: colors.border },
                currentPage === page && { 
                  backgroundColor: colors.accent,
                  borderColor: colors.accent 
                }
              ]}
              onPress={() => typeof page === 'number' && onPageChange(page)}
            >
              <Text 
                style={[
                  styles.pageText, 
                  { color: currentPage === page ? '#FFFFFF' : colors.text }
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          )
        ))}
        
        {/* Next button */}
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === totalPages && { backgroundColor: colors.disabled },
            { borderColor: colors.border }
          ]}
          onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={currentPage === totalPages ? colors.disabledText : colors.text} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Items per page selector */}
      {itemsPerPage !== undefined && onItemsPerPageChange && (
        <View style={styles.itemsPerPageContainer}>
          <Text style={[styles.itemsPerPageText, { color: colors.secondaryText }]}>
            Items per page:
          </Text>
          <View style={styles.itemsPerPageOptions}>
            {[10, 20, 50].map((value) => (
              <TouchableOpacity
                key={`items-${value}`}
                style={[
                  styles.itemsPerPageButton,
                  { borderColor: colors.border },
                  itemsPerPage === value && { 
                    backgroundColor: colors.accent + '20',
                    borderColor: colors.accent 
                  }
                ]}
                onPress={() => onItemsPerPageChange(value)}
              >
                <Text 
                  style={[
                    styles.itemsPerPageButtonText, 
                    { color: itemsPerPage === value ? colors.accent : colors.text }
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ellipsis: {
    fontSize: 12,
    paddingHorizontal: 4,
  },
  itemsPerPageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  itemsPerPageText: {
    fontSize: 12,
    marginRight: 8,
  },
  itemsPerPageOptions: {
    flexDirection: 'row',
  },
  itemsPerPageButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  itemsPerPageButtonText: {
    fontSize: 12,
  }
});

export default Pagination;