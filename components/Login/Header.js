import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>KARYAH:</Text>
      <Text style={styles.headerSubtitle}>|| Sarvgun Sampann ||</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 280,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 46,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 0,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});