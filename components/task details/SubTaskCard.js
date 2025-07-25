import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function SubTaskCard({ name, description, assignedTo, avatar, theme }) {
  return (
    <View style={[styles.subTaskCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View>
        <Text style={[styles.subTaskName, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.subTaskDesc, { color: theme.secondaryText }]}>{description}</Text>
        <Text style={[styles.subTaskAssigned, { color: theme.secondaryText }]}>Assigned To {assignedTo}</Text>
      </View>
      {avatar && (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  subTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    justifyContent: 'space-between',
  },
  subTaskName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  subTaskDesc: {
    color: '#bbb',
    marginTop: 12,
    fontSize: 14,
  },
  subTaskAssigned: {
    color: '#bbb',
    fontSize: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 10,
  },
});