import React, { useState } from 'react';
import {
    Modal,
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Text,
    TextInput,
    Switch,
    Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import GradientButton from 'components/Login/GradientButton';
import CustomPickerDrawer from './CustomPickerDrawer';
import AttachmentSheet from './AttachmentSheet';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import { createIssue } from '../../utils/issues'; // adjust path as needed
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme/ThemeContext';
import useAttachmentPicker from './useAttachmentPicker';
export default function ProjectIssuePopup({
    visible,
    onClose,
    values,
    onChange,
    onSubmit,
    onSelectDate,
    projects = [],
    users = [],
    onIssueCreated, // <-- add this

}) {
    const theme = useTheme();

    const [showProjectPicker, setShowProjectPicker] = useState(false);
    const [showUserPicker, setShowUserPicker] = useState(false);
    const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
    const { attachments, pickAttachment, clearAttachments } = useAttachmentPicker();
    const [showDatePicker, setShowDatePicker] = useState(false);

    // const handleAttachmentPick = async (type) => {
    //     setShowAttachmentSheet(false);

    //     if (type === 'photo') {
    //         const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //         if (!permissionResult.granted) return alert('Permission to access gallery is required');

    //         const result = await ImagePicker.launchImageLibraryAsync({
    //             mediaTypes: ImagePicker.MediaType.IMAGE, // updated
    //             allowsEditing: false,
    //             quality: 1,
    //         });
    //         if (!result.canceled) {
    //             console.log('Picked image:', result.assets[0]);
    //         }

    //     } else if (type === 'camera') {
    //         const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    //         if (!permissionResult.granted) return alert('Camera permission is required');

    //         const result = await ImagePicker.launchCameraAsync({
    //             mediaTypes: ImagePicker.MediaType.IMAGE, // updated
    //             allowsEditing: false,
    //             quality: 1,
    //         });
    //         if (!result.canceled) {
    //             console.log('Camera photo:', result.assets[0]);
    //         }

    //     } else if (type === 'video') {
    //         const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //         if (!permissionResult.granted) return alert('Permission to access videos is required');

    //         const result = await ImagePicker.launchImageLibraryAsync({
    //             mediaTypes: ImagePicker.MediaType.VIDEO, // updated
    //         });
    //         if (!result.canceled) {
    //             console.log('Picked video:', result.assets[0]);
    //         }

    //     } else if (type === 'document') {
    //         const result = await DocumentPicker.getDocumentAsync({});
    //         if (result.type === 'success') {
    //             console.log('Picked document:', result);
    //         }

    //     }
    // };
    const handleSubmit = async () => {
        console.log('Creating issue with values:', values);
        if (!values.projectId) {
            alert('Please select a project.');
            return;
        }

        try {
            const unresolvedImages = attachments.map(att => ({
                uri: att.uri,
                name: att.name || att.uri?.split('/').pop() || 'attachment',
                type: att.mimeType || att.type || 'application/octet-stream',
            }));
            const newIssue = await createIssue({
                projectId: values.projectId,
                issueTitle: values.title,
                description: values.description,
                assignTo: values.assignTo,
                isCritical: values.isCritical,
                issueStatus: 'unresolved',
                dueDate: values.dueDate,
                unresolvedImages,
            });
            alert('Issue created successfully!');
            if (onIssueCreated && newIssue) {
                onIssueCreated(newIssue); // <-- pass the new issue up
            }
            onClose();
        } catch (error) {
            alert(error.message || 'Failed to create issue');
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            // Format date as needed, e.g. YYYY-MM-DD
            const isoDate = selectedDate.toISOString().split('T')[0];
            onChange('dueDate', isoDate);
        }
    };
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
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Raise An Issue</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                        {/* Title */}
                        <View style={[styles.inputBox, { backgroundColor: theme.secCard, borderColor: theme.border }]}>
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Issue Title"
                                placeholderTextColor={theme.secondaryText}
                                value={values.title}
                                onChangeText={t => onChange('title', t)}
                            />
                        </View>

                        <View style={[styles.inputBox, { backgroundColor: theme.secCard, borderColor: theme.border }]}>
                            <TouchableOpacity
                                style={{ flex: 1, justifyContent: 'center', height: 54 }}
                                onPress={() => {
                                    if (!values.projectId) setShowProjectPicker(true); // disable if projectId is already set
                                }}
                                activeOpacity={values.projectId ? 1 : 0.8}
                            >
                                <Text style={{
                                    color: values.projectId ? theme.text : theme.secondaryText,
                                    fontWeight: '500'
                                }}>
                                    {values.projectId
                                        ? (projects.find(p => String(p.id) === String(values.projectId))?.projectName || 'Select Project')
                                        : 'Select Project'}
                                </Text>
                            </TouchableOpacity>

                        </View>
                        <CustomPickerDrawer
                            visible={showProjectPicker}
                            onClose={() => setShowProjectPicker(false)}
                            data={projects}
                            valueKey="id"
                            labelKey="projectName"
                            selectedValue={values.projectId}
                            onSelect={v => onChange('projectId', String(v))} // <-- always store as string
                            theme={theme}
                            placeholder="Search project..."
                            showImage={false}
                        />

                        {/* Description */}
                        <View style={[styles.inputBox, { backgroundColor: theme.secCard, borderColor: theme.border }]}>
                            <TextInput
                                style={[styles.input, { color: theme.text, height: 70 }]}
                                placeholder="Description"
                                placeholderTextColor={theme.secondaryText}
                                value={values.description}
                                onChangeText={t => onChange('description', t)}
                                multiline
                            />
                        </View>

                        {/* Attachments */}
                        <View style={[styles.inputBox, { backgroundColor: theme.secCard, borderColor: theme.border }]}>
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Add Attachments"
                                placeholderTextColor={theme.secondaryText}
                                editable={false}
                            />
                            <Feather name="paperclip" size={20} color="#888" style={styles.inputIcon} onPress={() => setShowAttachmentSheet(true)} />
                            <MaterialCommunityIcons name="microphone-outline" size={20} color="#888" style={styles.inputIcon} onPress={() => setShowAttachmentSheet(true)} />
                        </View>
                        {attachments.length > 0 && (
                            <View style={{ marginHorizontal: 16, marginBottom: 10 }}>
                                {attachments.map((att, idx) => (
                                    <Text key={att.uri || att.name || idx} style={{ color: theme.secondaryText, fontSize: 13 }}>
                                        {att.name || att.uri?.split('/').pop() || 'Attachment'}
                                    </Text>
                                ))}
                                <TouchableOpacity onPress={clearAttachments} style={{ marginTop: 4 }}>
                                    <Text style={{ color: '#E53935', fontSize: 13 }}>Clear All</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <AttachmentSheet
                            visible={showAttachmentSheet}
                            onClose={() => setShowAttachmentSheet(false)}
                            onPick={async (type) => {
                                await pickAttachment(type);
                                setShowAttachmentSheet(false);
                            }}
                        />

                        {/* Assign To Picker Field */}
                        <View style={[styles.inputBox, { backgroundColor: theme.secCard, borderColor: theme.border }]}>
                            <TouchableOpacity
                                style={{ flex: 1, justifyContent: 'center', height: 54 }}
                                onPress={() => setShowUserPicker(true)}
                                activeOpacity={0.8}
                            >
                                <Text style={{
                                    color: values.assignTo ? theme.text : theme.secondaryText,
                                    fontSize: 16,
                                    fontWeight: '500'
                                }}>
                                    {values.assignTo
                                        ? (users.find(u => u.userId === values.assignTo)?.name || 'Assign To')
                                        : 'Assign To'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <CustomPickerDrawer
                            visible={showUserPicker}
                            onClose={() => setShowUserPicker(false)}
                            data={users}
                            valueKey="userId"
                            labelKey="name"
                            imageKey="profilePhoto"
                            selectedValue={values.assignTo}
                            onSelect={v => onChange('assignTo', v)}
                            theme={theme}
                            placeholder="Search user..."
                            showImage={true}
                        />

                        <View style={[styles.inputBox, { backgroundColor: theme.secCard, borderColor: theme.border }]}>
                            <TouchableOpacity
                                style={[styles.rowInput, { color: theme.text }]}
                                onPress={() => setShowDatePicker(true)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.input, { color: values.dueDate ? theme.text : theme.secondaryText }]}>
                                    {values.dueDate || 'Due Date'}
                                </Text>
                                <Feather name="calendar" size={20} color={theme.secondaryText} />
                            </TouchableOpacity>
                        </View>
                        {showDatePicker && (
                            Platform.OS === 'ios' ? (
                                <Modal
                                    transparent
                                    animationType="fade"
                                    visible={showDatePicker}
                                    onRequestClose={() => setShowDatePicker(false)}
                                >
                                    <TouchableOpacity
                                        style={{
                                            flex: 1,
                                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                        }}
                                        activeOpacity={1}
                                        onPressOut={() => setShowDatePicker(false)}
                                    >
                                        <View
                                            style={{
                                                backgroundColor: theme.card,
                                                borderRadius: 18,
                                                padding: 18,
                                                width: "100%",
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <DateTimePicker
                                                value={values.dueDate ? new Date(values.dueDate) : new Date()}
                                                mode="date"
                                                display="inline"
                                                minimumDate={new Date()}
                                                onChange={handleDateChange}
                                                style={{ backgroundColor: theme.card }}
                                                textColor={theme.text}
                                                themeVariant={theme.dark ? 'dark' : 'light'}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </Modal>
                            ) : (
                                <DateTimePicker
                                    value={values.dueDate ? new Date(values.dueDate) : new Date()}
                                    mode="date"
                                    display="spinner"
                                    minimumDate={new Date()}
                                    onChange={handleDateChange}
                                    style={{ backgroundColor: theme.card }}
                                    textColor={theme.text}
                                    themeVariant={theme.dark ? 'dark' : 'light'}
                                />
                            )
                        )}

                        {/* Critical Switch */}
                        <View style={styles.criticalRow}>
                            <View style={styles.criticalIconBox}>
                                <Ionicons name="alert-circle" size={26} color="#B91C1C" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.criticalLabel}>Critical Issue?</Text>
                                <Text style={styles.criticalDesc}>
                                    Turn on the toggle only if the Issue needs immediate attention.
                                </Text>
                            </View>
                            <Switch
                                value={values.isCritical}
                                onValueChange={v => onChange('isCritical', v)}
                                trackColor={{ false: '#ddd', true: '#F87171' }}
                                thumbColor="#fff"
                            />
                        </View>

                        <View style={{ marginHorizontal: 16, marginTop: 0 }}>
                            <GradientButton title="Yes, Raise" onPress={handleSubmit} />
                        </View>

                        <TouchableOpacity style={{ alignSelf: 'center', marginTop: 0 }} onPress={onClose}>
                            <Text style={{ color: theme.secondaryText, fontWeight: '500' }}>No, Cancel?</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        width: '92%',
        backgroundColor: '#fff',
        borderRadius: 22,
        paddingVertical: 18,
        maxHeight: '92%',
        elevation: 10,
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
        color: '#222',
    },
    closeBtn: {
        padding: 4,
        marginLeft: 12,
    },
    inputBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        marginHorizontal: 16,
        marginBottom: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 54,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        fontWeight: '400',
        backgroundColor: 'transparent',
        paddingVertical: 12,
    },
    inputIcon: {
        marginLeft: 8,
    },
    rowInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 54,
    },
    criticalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 18,
        backgroundColor: '#FEF2F2',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#FECACA',
        padding: 10,
        gap: 10,
    },
    criticalIconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#FCA5A5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    criticalLabel: {
        color: '#B91C1C',
        fontWeight: '700',
        fontSize: 15,
        marginBottom: 2,
    },
    criticalDesc: {
        color: '#444',
        fontSize: 12,
        fontWeight: '400',
    },
    raiseBtn: {
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 14,
        backgroundColor: '#1D4ED8',
        alignItems: 'center',
        paddingVertical: 16,
    },
    raiseBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 17,
    },
    pickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    pickerSheet: {
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingBottom: 24,
        paddingTop: 8,
        paddingHorizontal: 12,
        minHeight: 180,
    },
});