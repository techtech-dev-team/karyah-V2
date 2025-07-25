import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddTaskForm from '../Task/AddTaskForm';

export default function AddTaskPopup({
    visible,
    onClose,
    values,
    onChange,
    onSubmit,
    theme,
    projectId,
    projectName,
    worklistId,
    worklistName,
    projects,
    users,
    worklists,
    projectTasks,
}) {
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
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Create New Task</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        <AddTaskForm
                            values={values}
                            onChange={onChange}
                            onSubmit={() => {
                                onSubmit();
                                onClose();
                            }}
                            theme={theme}
                            projectId={projectId}
                            projectName={projectName}
                            worklistId={worklistId}
                            worklistName={worklistName}
                            projects={projects}
                            users={users}
                            worklists={worklists}
                            projectTasks={projectTasks}
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
        borderRadius: 22,
        paddingVertical: 18,
        maxHeight: '90%',
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeBtn: {
        padding: 4,
        marginLeft: 12,
    },
});
