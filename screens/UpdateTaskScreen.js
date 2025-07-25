import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import GradientButton from '../components/Login/GradientButton';
import AttachmentSheet from '../components/popups/AttachmentSheet';
import CustomPickerDrawer from '../components/popups/CustomPickerDrawer';
import useAttachmentPicker from '../components/popups/useAttachmentPicker';
import useAudioRecorder from '../components/popups/useAudioRecorder';
import DateBox from '../components/task details/DateBox';
import FieldBox from '../components/task details/FieldBox';
import { useTheme } from '../theme/ThemeContext';
import { fetchUserConnections } from '../utils/issues';
import { getUserConnections, searchConnections } from '../utils/connections';

import { getTaskDetailsById, updateTaskDetails } from '../utils/task';
export default function UpdateTaskScreen({ route, navigation }) {
    const { taskId, projects, users, worklists, projectTasks } = route.params;
    const theme = useTheme();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allConnections, setAllConnections] = useState([]);
    const [filteredConnections, setFilteredConnections] = useState([]);
    // const [attachments, setAttachments] = useState([]);
    const [values, setValues] = useState({
        taskName: '',
        description: '',
        startDate: '',
        endDate: '',
        images: [],
    });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showUserPicker, setShowUserPicker] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [showProjectPicker, setShowProjectPicker] = useState(false);
    const [showWorklistPicker, setShowWorklistPicker] = useState(false);
    const [showDepPicker, setShowDepPicker] = useState(false);
    const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
    const { attachments, pickAttachment, setAttachments } = useAttachmentPicker();
    const [selectedDeps, setSelectedDeps] = useState([]);
    const [selectedDepIds, setSelectedDepIds] = useState([]);
    const taskValueKey = projectTasks.length && projectTasks[0]?.id !== undefined ? 'id' : 'taskId';

    const handleDepToggle = (taskId) => {
        setSelectedDepIds((prev) => {
            const idStr = String(taskId);
            return prev.includes(idStr)
                ? prev.filter((id) => id !== idStr)
                : [...prev, idStr];
        });
    };

    useEffect(() => {
        const selected = selectedDepIds
            .map(id => projectTasks.find(t => String(t[taskValueKey]) === id))
            .filter(Boolean);
        setSelectedDeps(selected);
    }, [selectedDepIds, projectTasks]);

    const existingAttachments = Array.isArray(task?.images)
        ? task.images.map(file => ({
            uri: file.uri || file.url || file,
            name: file.name || file.uri?.split('/').pop() || file.split('/').pop(),
            type: file.type || 'application/octet-stream',
            isExisting: true,
        }))
        : [];
    const newAttachments = attachments.map(att => ({
        ...att,
        isExisting: false,
    }));
    const allAttachments = [...existingAttachments, ...newAttachments];
    const { isRecording, startRecording, stopRecording, seconds } = useAudioRecorder({
        onRecordingFinished: (audioFile) => {
            setAttachments(prev => [...prev, audioFile]);
            Alert.alert('Audio recorded and attached!');
        }
    });

    const handleAddAttachment = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: false,
            quality: 0.7,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const file = result.assets[0];
            const newFile = {
                uri: file.uri,
                name: file.fileName || file.name || file.uri?.split('/').pop(),
                type: file.mimeType || file.type || 'application/octet-stream',
                isExisting: false,
            };
            setAttachments(prev => [...prev, newFile]);
        }
    };

    useEffect(() => {
        const safeNormalize = () => {
            if (Array.isArray(task?.images)) {
                return task.images.map((img, index) => ({
                    uri: img.uri || img.url || img,
                    name: img.name || img.uri?.split('/').pop() || `file-${index}`,
                    type: img.type || 'application/octet-stream',
                    isExisting: true,
                }));
            }
            return [];
        };

        setAttachments(safeNormalize());
    }, [task]);

    const handleUserToggle = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await getTaskDetailsById(taskId);
                setTask(res);
                setValues({
                    taskName: res.taskName,
                    description: res.description,
                    startDate: res.startDate,
                    endDate: res.endDate,

                });
                // Preload dependencies
                setSelectedDepIds((res.dependentTaskIds || []).map(String));


                console.log("res.assignedUserDetails", res.assignedUserDetails)
                setSelectedUsers(res.assignedUserDetails?.map(u => u.userId) || []);
            } catch (err) {
                Alert.alert('Error', 'Failed to load task.');
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
    }, []);

    const handleChange = (field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };
    const handleUpdate = async () => {
        try {
            const newImages = attachments
                .filter(att => att && !att.isExisting && att.uri)
                .map(att => ({
                    uri: att.uri.startsWith('file://') ? att.uri : `file://${att.uri}`,
                    name: att.name || att.uri?.split('/').pop() || 'file',
                    type: att.type || 'application/octet-stream',
                    isExisting: false,
                }));
            console.log('[handleUpdate] newImages to upload:', newImages);
            const updatePayload = {
                taskName: values.taskName,
                description: values.description,
                startDate: values.startDate || new Date().toISOString(),
                endDate: values.endDate || new Date().toISOString(),
                assignedUserIds: selectedUsers,
                imagesToRemove: task?.imagesToRemove || [],
                attachments: newImages, // ✅ this must be 'attachments', not 'images'
                dependentTaskIds: selectedDepIds.map(String),

            };
            console.log('[handleUpdate] Final updatePayload:', updatePayload);
            await updateTaskDetails(taskId, updatePayload);
            Alert.alert('Success', 'Task updated successfully.');
            navigation.navigate('TaskDetails', {
                taskId,
                refreshedAt: Date.now(),
            });
        } catch (err) {
            console.error('[UpdateTaskScreen] Update error:', err);
            Alert.alert('Error', 'Failed to update task.');
        }
    };
    const handleSearch = async (text) => {
        setSearchText(text);
        if (text.trim()) {
            try {
                const result = await fetchUserConnections(text.trim());
                setFilteredUsers(result);
            } catch (err) {
                setFilteredUsers([]);
            }
        } else {
            setFilteredUsers([]);
        }
    };
    const openUserPicker = async () => {
        setShowUserPicker(true);
        try {
            const connections = await getUserConnections();
            setAllConnections(connections || []);
        } catch (e) {
            setAllConnections([]);
        }
        setFilteredConnections([]);
        setSearchText('');
    };

    // --- Handler for searching connections ---
    const handleUserSearch = async (text) => {
        setSearchText(text);
        if (text.trim()) {
            try {
                const result = await searchConnections(text.trim());
                setFilteredConnections(result || []);
            } catch (e) {
                setFilteredConnections([]);
            }
        } else {
            setFilteredConnections([]);
        }
    };

    // --- Handler for selecting/removing users ---
    const handleUserSelect = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    if (loading || !task) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
                <Text style={{ color: theme.text }}>Loading...</Text>
            </View>
        );
    }
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: theme.background }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back-ios" size={16} color={theme.text} />
                    <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
                </TouchableOpacity>
                {/* Header Card */}
                <LinearGradient colors={[theme.secondary, theme.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.headerCard}>
                    <View>
                        <Text style={styles.taskName}>{task.taskName}</Text>
                        <Text style={styles.dueDate}>Due Date : {values.endDate?.split('T')[0] || '-'}</Text>
                    </View>
                </LinearGradient>
                {/* Date Row */}
                <View style={styles.dateRow}>
                    <DateBox
                        label="Start Date"
                        value={values.startDate}
                        onChange={date => handleChange('startDate', date.toISOString())}
                        theme={theme}
                    />
                    <DateBox
                        label="End Date"
                        value={values.endDate}
                        onChange={date => handleChange('endDate', date.toISOString())}
                        theme={theme}
                    />
                </View>
                {/* Editable Fields */}
                <View style={[styles.fieldBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Task Name</Text>
                    <TextInput
                        value={values.taskName}
                        placeholder="Task Name"
                        placeholderTextColor={theme.secondaryText}
                        onChangeText={text => handleChange('taskName', text)}
                        style={[styles.inputValue, { color: theme.text }]}
                    />
                </View>
                <View style={[styles.fieldBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Description</Text>
                    <TextInput
                        value={values.description}
                        placeholder="Description"
                        placeholderTextColor={theme.secondaryText}
                        onChangeText={text => handleChange('description', text)}
                        multiline
                        style={[styles.inputValue, { color: theme.text, minHeight: 60 }]}
                    />
                </View>
                <View style={[styles.fieldBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.inputLabel, { color: theme.text, marginBottom: 8 }]}>Assigned Users</Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={openUserPicker}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            minHeight: 40,
                            paddingRight: 15,
                        }}
                    >
                        {selectedUsers.length === 0 && (
                            <Text style={{ color: theme.secondaryText }}>Select Users</Text>
                        )}
                        {selectedUsers.map((id, idx) => {
                            const user = allConnections.find(u => u.userId === id) || users.find(u => u.userId === id);
                            const photo = user?.profilePhoto || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png';
                            return (
                                <Image
                                    key={id}
                                    source={{ uri: photo }}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        marginRight: -10,
                                        borderWidth: 2,
                                        borderColor: theme.primary,
                                        backgroundColor: '#fff'
                                    }}
                                />
                            );
                        })}
                        <Feather name="chevron-right" size={20} color={theme.secondaryText} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>

                <Modal
                    visible={showUserPicker}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setShowUserPicker(false)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={{ flex: 1, justifyContent: 'flex-end', width: '100%' }}
                        >
                            <View
                                style={{
                                    backgroundColor: theme.card,
                                    borderTopLeftRadius: 24,
                                    borderTopRightRadius: 24,
                                    padding: 20,
                                    minHeight: 350,
                                    maxHeight: '70%',
                                }}
                            >
                                <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Select Users</Text>
                                {selectedUsers.length > 0 && (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={{ marginBottom: 8, minHeight: 54 }}
                                        contentContainerStyle={{ alignItems: 'center', paddingVertical: 0 }}
                                    >
                                        {selectedUsers.map((userId, idx) => {
                                            const user = allConnections.find(u => u.userId === userId) || users.find(u => u.userId === userId);
                                            if (!user) return null;
                                            return (
                                                <TouchableOpacity
                                                    key={userId}
                                                    onPress={() => handleUserSelect(userId)}
                                                    style={{
                                                        alignItems: 'center',
                                                        marginLeft: idx === 0 ? 0 : 6,
                                                        position: 'relative',
                                                    }}
                                                >
                                                    <Image
                                                        source={{ uri: user.profilePhoto || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' }}
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 20,
                                                            borderWidth: 2,
                                                            borderColor: theme.primary,
                                                        }}
                                                    />
                                                    <Feather name="x-circle" size={16} color={theme.primary} style={{ position: 'absolute', top: -6, right: -6 }} />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                )}
                                <TextInput
                                    placeholder="Search Connections"
                                    placeholderTextColor={theme.secondaryText}
                                    value={searchText}
                                    onChangeText={handleUserSearch}
                                    style={{
                                        color: theme.text,
                                        backgroundColor: theme.SearchBar,
                                        borderRadius: 14,
                                        paddingHorizontal: 12,
                                        paddingVertical: 16,
                                        marginBottom: 10,
                                        borderColor: theme.border,
                                        borderWidth: 1,
                                    }}
                                />
                                <ScrollView keyboardShouldPersistTaps="handled">
                                    {(searchText.trim() ? filteredConnections : allConnections).slice(0, 10).map((item) => (
                                        <TouchableOpacity
                                            key={item.userId}
                                            onPress={() => handleUserSelect(item.userId)}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingVertical: 10,
                                                borderBottomWidth: 0.5,
                                                borderColor: theme.border,
                                            }}
                                        >
                                            <Image
                                                source={{ uri: item.profilePhoto || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' }}
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 18,
                                                    marginRight: 10,
                                                    borderWidth: 1,
                                                    borderColor: theme.border,
                                                }}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: theme.text, fontWeight: '500' }}>{item.name}</Text>
                                                {item.phone && <Text style={{ fontSize: 12, color: theme.secondaryText }}>Phone: {item.phone}</Text>}
                                            </View>
                                            {selectedUsers.includes(item.userId) && (
                                                <Feather name="check-circle" size={20} color={theme.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <TouchableOpacity
                                    style={{
                                        marginTop: 18,
                                        alignSelf: 'center',
                                        backgroundColor: theme.primary,
                                        borderRadius: 12,
                                        paddingHorizontal: 32,
                                        paddingVertical: 12,
                                    }}
                                    onPress={() => setShowUserPicker(false)}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>
                <View style={[styles.fieldBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.inputLabel, { color: theme.text, marginBottom: 8 }]}>Dependent Tasks</Text>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setShowDepPicker(true)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            minHeight: 40,
                            paddingRight: 15,
                        }}
                    >
                        {selectedDeps.length === 0 ? (
                            <Text style={{ color: theme.secondaryText }}>Select Tasks</Text>
                        ) : (
                            selectedDeps.map((dep) => (
                                <View
                                    key={dep[taskValueKey]}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: '#E0F2FE',
                                        paddingVertical: 4,
                                        paddingHorizontal: 8,
                                        borderRadius: 12,
                                        marginRight: 6,
                                        marginBottom: 6,
                                    }}
                                >
                                    <Text style={{ color: theme.text, marginRight: 4 }}>
                                        {dep.name || dep.taskName || 'Unnamed Task'}
                                    </Text>

                                    <TouchableOpacity onPress={() => handleDepToggle(dep[taskValueKey])}>
                                        <MaterialCommunityIcons name="close-circle" size={18} color="#E53935" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                        <Feather name="chevron-right" size={20} color={theme.secondaryText} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
                <CustomPickerDrawer
                    visible={showDepPicker}
                    onClose={() => setShowDepPicker(false)}
                    data={projectTasks.filter(t => String(t[taskValueKey]) !== String(taskId))}
                    valueKey={taskValueKey}
                    labelKey="name"
                    selectedValue={selectedDepIds}
                    onSelect={handleDepToggle}
                    multiSelect={true}
                    theme={theme}
                    placeholder="Search task..."
                    showImage={false}
                />
                <FieldBox
                    value=''
                    placeholder="Add Attachments"
                    theme={theme}
                    editable={false}
                    rightComponent={
                        <>
                            <Feather
                                name="paperclip"
                                size={20}
                                color="#888"
                                style={{ marginLeft: 8 }}
                                onPress={() => setShowAttachmentSheet(true)}
                            />
                            <MaterialCommunityIcons
                                name={isRecording ? "microphone" : "microphone-outline"}
                                size={20}
                                color={isRecording ? "#E53935" : "#888"}
                                style={{ marginLeft: 8 }}
                                onPress={isRecording ? stopRecording : startRecording}
                            />
                            {isRecording && (
                                <Text style={{ color: "#E53935", marginLeft: 8 }}>{seconds}s</Text>
                            )}
                        </>
                    }
                />
                {/* Attachment Preview Grid */}
                {allAttachments.length > 0 && (
                    <View style={{ marginHorizontal: 16, marginBottom: 10 }}>
                        {Array.from({ length: Math.ceil(attachments.length / 2) }).map((_, rowIdx) => (
                            <View key={rowIdx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, }}>
                                {[0, 1].map(colIdx => {
                                    const idx = rowIdx * 2 + colIdx;
                                    const att = attachments[idx];
                                    if (!att) return <View key={colIdx} style={{ flex: 1 }} />;
                                    return (
                                        <View
                                            key={att.uri || att.name || idx}
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                padding: 8,
                                                borderWidth: 1,
                                                borderColor: theme.border,
                                                borderRadius: 10,
                                                backgroundColor: theme.card,
                                                marginRight: colIdx === 0 ? 12 : 0
                                            }}
                                        >
                                            {/* Preview for images */}
                                            {att.type && att.type.startsWith('image') ? (
                                                <TouchableOpacity onPress={() => { /* Optionally open image in modal */ }}>
                                                    <Image
                                                        source={{ uri: att.uri }}
                                                        style={{ width: 25, height: 25, borderRadius: 6, marginRight: 8 }}
                                                    />
                                                </TouchableOpacity>
                                            ) : null}

                                            {/* Preview for audio */}
                                            {att.type && att.type.startsWith('audio') ? (
                                                <TouchableOpacity
                                                    onPress={async () => {
                                                        const { Sound } = await import('expo-av');
                                                        const { sound } = await Sound.createAsync({ uri: att.uri });
                                                        await sound.playAsync();
                                                    }}
                                                    style={{ marginRight: 8 }}
                                                >
                                                    <MaterialCommunityIcons name="play-circle-outline" size={28} color="#1D4ED8" />
                                                </TouchableOpacity>
                                            ) : null}

                                            {/* File/document icon for other types */}
                                            {!att.type?.startsWith('image') && !att.type?.startsWith('audio') ? (
                                                <MaterialCommunityIcons name="file-document-outline" size={28} color="#888" style={{ marginRight: 8 }} />
                                            ) : null}

                                            {/* File name */}
                                            <Text style={{ color: theme.text, fontSize: 13, flex: 1 }}>
                                                {(att.name || att.uri?.split('/').pop() || 'Attachment').length > 20
                                                    ? (att.name || att.uri?.split('/').pop()).slice(0, 15) + '...'
                                                    : (att.name || att.uri?.split('/').pop())}
                                            </Text>

                                            {/* Remove button */}
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setAttachments(prev => prev.filter((_, i) => i !== idx));
                                                }}
                                                style={{ marginLeft: 8 }}
                                            >
                                                <MaterialCommunityIcons name="close-circle" size={22} color="#E53935" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                )}
                <Modal
                    visible={showUserPicker}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setShowUserPicker(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ width: '100%' }}
                        >
                            <View style={{
                                backgroundColor: theme.card,
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                padding: 20,
                                minHeight: 350,
                                maxHeight: '70%',
                            }}>
                                <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Select Users</Text>
                                <TextInput
                                    placeholder="Search Users"
                                    placeholderTextColor={theme.secondaryText}
                                    value={searchText}
                                    onChangeText={handleSearch}
                                    style={{
                                        color: theme.text,
                                        backgroundColor: theme.SearchBar,
                                        borderRadius: 14,
                                        paddingHorizontal: 12,
                                        paddingVertical: 16,
                                        marginBottom: 10,
                                        borderColor: theme.border,
                                        borderWidth: 1,
                                    }}
                                />
                                <ScrollView keyboardShouldPersistTaps="handled">
                                    {filteredUsers.slice(0, 10).map((item) => (
                                        <TouchableOpacity
                                            key={item.userId}
                                            onPress={() => {
                                                if (!selectedUsers.includes(item.userId)) {
                                                    setSelectedUsers([...selectedUsers, item.userId]);
                                                }
                                                setSearchText('');
                                                setFilteredUsers([]);
                                            }}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingVertical: 10,
                                                borderBottomWidth: 0.5,
                                                borderColor: theme.border,
                                            }}
                                        >
                                            <Image
                                                source={{ uri: item.profilePhoto || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png' }}
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 18,
                                                    marginRight: 10,
                                                    borderWidth: 1,
                                                    borderColor: theme.border,
                                                }}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: theme.text, fontWeight: '500' }}>{item.name}</Text>
                                                {item.phone && <Text style={{ fontSize: 12, color: theme.secondaryText }}>Phone: {item.phone}</Text>}
                                            </View>
                                            {selectedUsers.includes(item.userId) && (
                                                <Feather name="check-circle" size={20} color={theme.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <TouchableOpacity
                                    style={{
                                        marginTop: 18,
                                        alignSelf: 'center',
                                        backgroundColor: theme.primary,
                                        borderRadius: 12,
                                        paddingHorizontal: 32,
                                        paddingVertical: 12,
                                    }}
                                    onPress={() => setShowUserPicker(false)}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>
                <CustomPickerDrawer
                    visible={showUserPicker}
                    onClose={() => setShowUserPicker(false)}
                    data={users}
                    valueKey="userId"
                    labelKey="name"
                    imageKey="profilePhoto"
                    selectedValue={selectedUsers}
                    onSelect={handleUserToggle}
                    multiSelect={true}
                    theme={theme}
                    placeholder="Search user..."
                    showImage={true}
                />
                <AttachmentSheet
                    visible={showAttachmentSheet}
                    onClose={() => setShowAttachmentSheet(false)}
                    onPick={async (type) => {
                        await pickAttachment(type);
                        setShowAttachmentSheet(false);
                    }}
                />
            </ScrollView>
            <View style={styles.fixedButtonContainer}>
                <GradientButton title="Save Changes" onPress={handleUpdate} theme={theme} />
            </View>
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    backBtn: {
        paddingTop: Platform.OS === 'ios' ? 70 : 25,
        marginLeft: 16,
        marginBottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    backText: {
        fontSize: 18,
        color: '#222',
        fontWeight: '400',
        marginLeft: 0,
    },
    headerCard: {
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
        marginBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 110,
    },
    taskName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 6,
    },
    dueDate: {
        color: '#fff',
        fontSize: 13,
        opacity: 0.85,
        fontWeight: '400',
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 22,
        marginBottom: 12,
        gap: 8,
    },
    fieldBox: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        marginHorizontal: 20,
        marginBottom: 12,
        paddingHorizontal: 14,
        minHeight: 54,
        paddingVertical: 8,
    },
    inputLabel: {
        color: '#222',
        fontWeight: '400',
        fontSize: 14,
        marginBottom: 2,
    },
    inputValue: {
        color: '#444',
        fontSize: 15,
        fontWeight: '400',
        paddingVertical: 4,
        paddingHorizontal: 0,
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        zIndex: 10,
        elevation: 5,
    },
});