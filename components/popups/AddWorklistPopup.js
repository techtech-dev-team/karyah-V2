import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import CustomPickerDrawer from './CustomPickerDrawer';

export default function AddWorklistPopup({ visible, onClose, projects, onSubmit, theme }) {
    const [selectedProject, setSelectedProject] = useState('');
    const [worklistName, setWorklistName] = useState('');
    const [showProjectPicker, setShowProjectPicker] = useState(false);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.popup, { backgroundColor: theme.card }]}>
                    <Text style={[styles.title, { color: theme.text }]}>Add New Worklist</Text>
                    
                    <TouchableOpacity
                        style={[styles.selectBtn, { borderColor: theme.border }]}
                        onPress={() => setShowProjectPicker(true)}
                    >
                        <Text style={{ color: theme.text, fontSize: 16 }}>
                            {selectedProject
                                ? (projects.find(p => String(p.id) === String(selectedProject))?.projectName || 'Select Project')
                                : 'Select Project'}
                        </Text>
                    </TouchableOpacity>
                    <CustomPickerDrawer
                        visible={showProjectPicker}
                        onClose={() => setShowProjectPicker(false)}
                        data={projects}
                        valueKey="id"
                        labelKey="projectName"
                        selectedValue={selectedProject}
                        onSelect={v => {
                            setSelectedProject(v);
                            setShowProjectPicker(false);
                        }}
                        theme={theme}
                        placeholder="Search project..."
                        showImage={false}
                    />

                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                        placeholder="Worklist Name"
                        placeholderTextColor={theme.secondaryText}
                        value={worklistName}
                        onChangeText={setWorklistName}
                    />

                    <View style={styles.btnRow}>
                        <TouchableOpacity onPress={onClose} style={[styles.btn, { backgroundColor: theme.secCard }]}>
                            <Text style={{ color: theme.text }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: theme.primary }]}
                            onPress={() => {
                                if (selectedProject && worklistName) {
                                    onSubmit(selectedProject, worklistName);
                                    setSelectedProject('');
                                    setWorklistName('');
                                }
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' },
    popup: { width: '88%', borderRadius: 16, padding: 22 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 18 },
    selectBtn: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 14 },
    input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 18, fontSize: 16 },
    btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    btn: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 22 },
});