import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProjectDrawerForm from '../Project/ProjectDrawerForm';


export default function ProjectPopup({ visible, onClose, values, onChange, onSubmit, theme }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.popup, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[{ fontSize: 18, fontWeight: '500', color: theme.text }]}>Create New Project</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <ProjectDrawerForm
              values={values}
              onChange={onChange}
              onSubmit={() => { onSubmit(); onClose(); }}
              hideSimpleForm
              theme={theme}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 18,
    maxHeight: '90%',
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  closeBtn: {
    padding: 4,
  },
});