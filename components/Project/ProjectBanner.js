import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProjectBanner({ onAdd, theme }) {
  return (
    <LinearGradient
      colors={[theme.secondary, theme.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.banner}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitle}>{'All Projects'}</Text>
        <Text style={[styles.bannerDesc]}>
          The list of projects you have taken so far
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.bannerAction]}
        onPress={onAdd}
      >
        <Text style={[styles.bannerActionText]}>{'Project'}</Text>
        <Feather name="plus" size={18} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    minHeight: 110,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 2,
  },
  bannerDesc: {
    color: '#e6eaf3',
    fontSize: 14,
    fontWeight: '400',
    maxWidth: '80%',
  },
  bannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bannerActionText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 15,
  },
});