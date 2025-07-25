import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useAttachmentPicker from './useAttachmentPicker';

export default function TaskChatPopup({
    visible,
    onClose,
    messages = [],
    onSend,
    theme,
    currentUserId,
    loading = false
}) {
    // Use local attachment picker state
    const {
        attachments,
        pickAttachment,
        clearAttachments,
        setAttachments,
        attaching
    } = useAttachmentPicker();
    const [input, setInput] = useState('');
    const [showTimeIdx, setShowTimeIdx] = useState(null);
    const [showAttachOptions, setShowAttachOptions] = useState(false);
    const [imageModal, setImageModal] = useState({ visible: false, uri: null });

    // Remove a single attachment by index
    const handleRemoveAttachment = (idx) => {
        setAttachments(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={[styles.popup, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <MaterialIcons name="chat" size={22} color={theme.primary} />
                        <Text style={{ color: theme.text, fontWeight: '600', fontSize: 16, marginLeft: 8 }}>
                            Task Chat
                        </Text>
                        <TouchableOpacity
                            style={{ marginLeft: 'auto', padding: 6 }}
                            onPress={onClose}
                        >
                            <MaterialIcons name="close" size={22} color={theme.secondaryText} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        style={{ flex: 1, marginBottom: 12, backgroundColor: theme.background, padding:12, borderRadius: 12 }}
                        contentContainerStyle={{ paddingBottom: 12 }}

                    >
                        {loading ? (
                            <Text style={{ color: theme.secondaryText, textAlign: 'center', marginTop: 30 }}>
                                Loading...
                            </Text>
                        ) : (messages.length === 0 ? (
                            <Text style={{ color: theme.secondaryText, textAlign: 'center', marginTop: 30 }}>
                                No messages yet.
                            </Text>
                        ) : messages.map((msg, idx) => (
                            <View key={idx} style={{ marginBottom: 8, alignItems: msg.userId === currentUserId ? 'flex-end' : 'flex-start' }}>
                                    <Text style={{
                                        color: theme.secondaryText,
                                        fontSize: 11,
                                        marginVertical: 10,
                                        textAlign: 'center',
                                        alignSelf: 'center',
                                        opacity: 0.85,
                                    }}>
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                                    </Text>
                                
                                <View
                                    style={{
                                        alignSelf: msg.userId === currentUserId ? 'flex-end' : 'flex-start',
                                        backgroundColor: msg.userId === currentUserId ? theme.primary : theme.card,
                                        borderRadius: 14,
                                        borderWidth: 1,
                                        borderColor: msg.userId === currentUserId ? theme.border : theme.border,
                                        paddingHorizontal: 16,
                                        paddingVertical: 6,
                                        maxWidth: '80%',
                                    }}
                                >
                                    {/* Sender name (show for all except current user, or always for clarity) */}
                                    {msg.sender && msg.sender.name && (
                                        <Text style={{
                                            color: msg.userId === currentUserId ? '#e0e0e0' : theme.secondaryText,
                                            fontSize: 12,
                                            fontWeight: '400',
                                            marginBottom: 2,
                                        }}>
                                            {msg.sender.name}
                                        </Text>
                                    )}
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onLongPress={() => setShowTimeIdx(idx)}
                                        onPressOut={() => setShowTimeIdx(null)}
                                    >
                                        {/* Message text */}
                                        <Text style={{
                                            color: msg.userId === currentUserId ? '#fff' : theme.text,
                                            fontSize: 15,
                                        }}>
                                            {msg.text}
                                        </Text>
                                        {/* Attachments rendering */}
                                        {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                                            <View style={{ marginTop: 6 }}>
                                                {msg.attachments.map((att, attIdx) => {
                                                    // If it's a string and looks like an image URL, render as image, else as file link (pdf, doc, etc)
                                                    const isImage = typeof att === 'string' && att.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                                    const isPdf = typeof att === 'string' && att.match(/\.pdf$/i);
                                                    const isDoc = typeof att === 'string' && att.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i);
                                                    const fileName = typeof att === 'string' ? att.split('/').pop() : 'File';
                                                    if (isImage) {
                                                        return (
                                                            <TouchableOpacity
                                                                key={attIdx}
                                                                onPress={() => setImageModal({ visible: true, uri: att })}
                                                            >
                                                                <View style={{ borderRadius: 8, overflow: 'hidden', marginTop: 2, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafbfc' }}>
                                                                    <Image source={{ uri: att }} style={{ width: 120, height: 90, resizeMode: 'cover' }} />
                                                                </View>
                                                            </TouchableOpacity>
                                                        );
                                                    } else if (typeof att === 'string') {
                                                        // File link (pdf, doc, etc)
                                                        return (
                                                            <TouchableOpacity key={attIdx} onPress={() => {
                                                                Linking.openURL(att);
                                                            }}>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, backgroundColor: '#f5f5f5', borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6, borderWidth: 1, borderColor: '#eee' }}>
                                                                    <Feather name={isPdf ? 'file-text' : isDoc ? 'file' : 'file'} size={16} color={theme.primary} />
                                                                    <Text style={{ color: theme.primary, marginLeft: 4, textDecorationLine: 'underline', fontSize: 13, maxWidth: "90%" }} numberOfLines={1} ellipsizeMode="middle">
                                                                        {fileName}
                                                                    </Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )))}
                    </ScrollView>
                    <Modal
                        visible={imageModal.visible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setImageModal({ visible: false, uri: null })}
                    >
                        <View style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <TouchableOpacity
                                style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
                                activeOpacity={1}
                                onPress={() => setImageModal({ visible: false, uri: null })}
                            >
                                <View style={{
                                    height: '85%',
                                    width: '90%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    {imageModal.uri && (
                                        <Image
                                            source={{ uri: imageModal.uri }}
                                            style={{ height: '100%', width: '100%', borderRadius: 12 }}
                                            resizeMode="contain"
                                        />
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: theme.secCard,
                                borderRadius: 16,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                marginRight: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                            onPress={() => setShowAttachOptions(true)}
                            disabled={attaching}
                        >
                            <Feather name="paperclip" size={18} color={theme.primary} />
                            <Text style={{ color: theme.primary, marginLeft: 6 }}>
                                {attaching ? 'Attaching...' : 'Attach'}
                            </Text>
                        </TouchableOpacity>
                        {attachments.length > 0 && (
                            <ScrollView horizontal style={{ maxWidth: 180 }}>
                                {attachments.map((file, idx) => {
                                    // Determine if file is image by extension
                                    const fileName = file.name || file.uri?.split('/').pop() || 'File';
                                    const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                    return (
                                        <View
                                            key={idx}
                                            style={{
                                                marginRight: 6,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                borderWidth: 1,
                                                borderColor: theme.border,
                                                borderRadius: 8,
                                                padding: 4,
                                                backgroundColor: theme.card,
                                                minWidth: 90,
                                                // Responsive shadow for light/dark
                                                shadowColor: theme.background,
                                                shadowOpacity: theme.colorMode === 'dark' ? 0.25 : 0.08,
                                                shadowOffset: { width: 0, height: 1 },
                                                shadowRadius: 2,
                                                elevation: 2,
                                            }}
                                        >
                                            {isImage && file.uri ? (
                                                <Image
                                                    source={{ uri: file.uri }}
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 6,
                                                        marginRight: 6,
                                                        backgroundColor: theme.avatarBg || theme.background,
                                                        borderWidth: 1,
                                                        borderColor: theme.border,
                                                    }}
                                                />
                                            ) : (
                                                <Feather
                                                    name="file"
                                                    size={18}
                                                    color={theme.primary}
                                                    style={{ marginRight: 6 }}
                                                />
                                            )}
                                            <View style={{ flex: 1, minWidth: 0, marginRight: 4 }}>
                                                <Text
                                                    style={{
                                                        color: theme.text,
                                                        fontSize: 12,
                                                        fontWeight: '500',
                                                    }}
                                                    numberOfLines={1}
                                                    ellipsizeMode="middle"
                                                >
                                                    {fileName}
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => handleRemoveAttachment(idx)}>
                                                <MaterialIcons name="close" size={16} color={theme.dangerText || "#E53935"} />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        )}
                    </View>

                    {showAttachOptions && (
                        <View
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: theme.card,
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                borderWidth: 1,
                                borderColor: theme.border,
                                padding: 20,
                                paddingBottom: 30,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 10,
                                elevation: 20,
                                zIndex: 100,
                            }}
                        >
                            <Text
                                style={{
                                    color: theme.text,
                                    fontWeight: '700',
                                    fontSize: 18,
                                    marginBottom: 16,
                                    textAlign: 'center',
                                }}
                            >
                                What would you like to attach?
                            </Text>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                    marginBottom: 12,
                                }}
                            >
                                {[
                                    { type: 'photo', icon: 'image', label: 'Photo' },
                                    { type: 'camera', icon: 'camera', label: 'Camera' },
                                    { type: 'video', icon: 'video', label: 'Video' },
                                    { type: 'document', icon: 'file', label: 'Document' },
                                ].map(({ type, icon, label }) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => {
                                            setShowAttachOptions(false);
                                            pickAttachment(type);
                                        }}
                                        style={{ alignItems: 'center' }}
                                    >
                                        <View
                                            style={{
                                                backgroundColor: theme.card || '#f0f0f0',
                                                padding: 14,
                                                borderWidth: 1,
                                                borderColor: theme.border,
                                                borderRadius: 50,
                                                marginBottom: 6,
                                                shadowColor: '#000',
                                                shadowOpacity: 0.06,
                                                shadowOffset: { width: 0, height: 1 },
                                                shadowRadius: 3,
                                                elevation: 4,
                                            }}
                                        >
                                            <Feather name={icon} size={22} color={theme.primary} />
                                        </View>
                                        <Text style={{ color: theme.text, fontSize: 13 }}>{label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={() => setShowAttachOptions(false)}
                                style={{
                                    marginTop: 14,
                                    alignSelf: 'center',
                                    paddingVertical: 6,
                                    paddingHorizontal: 18,
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: theme.secondaryText, fontSize: 15 }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <TextInput
                            style={{
                                flex: 1,
                                backgroundColor: theme.card,
                                borderWidth: 1,
                                borderColor: theme.border,
                                borderRadius: 20,
                                paddingHorizontal: 16,
                                color: theme.text,
                                fontSize: 15,
                                height: 40,
                            }}
                            placeholder="Type a message..."
                            placeholderTextColor={theme.secondaryText}
                            value={input}
                            onChangeText={setInput}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            style={{
                                marginLeft: 8,
                                backgroundColor: theme.primary,
                                borderRadius: 20,
                                padding: 10,
                                opacity: (input.trim() || attachments.length > 0) ? 1 : 0.5,
                            }}
                            disabled={(!input.trim() && attachments.length === 0) || loading}
                            onPress={() => {
                                if (input.trim() || attachments.length > 0) {
                                    onSend(input.trim(), attachments);
                                    setInput('');
                                    clearAttachments();
                                }
                            }}
                        >
                            <Feather name="send" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
        maxWidth: 420,
        minHeight: 580,
        maxHeight: '90%',
        borderRadius: 18,
        borderWidth: 1,
        padding: 18,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
});