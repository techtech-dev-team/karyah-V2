import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export default function CoAdminLayout() {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Co-Admin Dashboard</Text>

      <View style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.text,
        }
      ]}>
        <Text style={[styles.cardText, { color: theme.text }]}>User Management</Text>
      </View>

      <View style={[
        styles.card,
        {
          backgroundColor: theme.secCard,
          borderColor: theme.border,
          shadowColor: theme.text,
        }
      ]}>
        <Text style={[styles.cardText, { color: theme.secondaryText }]}>Statistics</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
  },
});