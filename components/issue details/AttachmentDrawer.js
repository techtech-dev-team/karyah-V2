import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, Image, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const numColumns = 3;
const ITEM_SIZE = Math.floor(Dimensions.get('window').width / numColumns) - 24;

function getFileName(item) {
    if (!item) return '';
    if (typeof item === 'string') return item.split('/').pop() || 'Attachment';
    if (item.name) return item.name;
    if (item.uri && typeof item.uri === 'string') return item.uri.split('/').pop() || 'Attachment';
    return 'Attachment';
}
export default function AttachmentDrawer({ visible, onClose, attachments, theme, onAttachmentPress }) {
    const renderItem = ({ item }) => {
        const uri = (item && (item.uri || (typeof item === 'string' ? item : null))) || '';
const isImage = typeof uri === 'string' && /\.(jpg|jpeg|png|gif|webp)$/i.test(uri);
const isAudio = typeof uri === 'string' && /\.(m4a|mp3|wav)$/i.test(uri);
        const ext = getFileName(item).split('.').pop().toLowerCase();

        return (
            <TouchableOpacity style={styles.item} onPress={() => onAttachmentPress(item)}>
                {isImage ? (
                    <Image source={{ uri }} style={styles.image} />
                ) : (
                    <View style={styles.iconBox}>
                        {isAudio ? (
                            <Feather name="play-circle" size={36} color={theme.primary} />
                        ) : ext === 'pdf' ? (
                            <Feather name="file-text" size={36} color={theme.primary} />
                        ) : (
                            <Feather name="file" size={36} color={theme.primary} />
                        )}
                    </View>
                )}
                <Text style={[styles.label, { color: theme.text }]} numberOfLines={2}>{getFileName(item)}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.bg}>
                <View style={[styles.sheet, { backgroundColor: theme.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Attachments</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={28} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={attachments}
                        numColumns={numColumns}
                        renderItem={renderItem}
                        keyExtractor={(_, idx) => idx.toString()}
                        contentContainerStyle={{ paddingBottom: 24 }}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
    sheet: { borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, minHeight: 340, maxHeight: '70%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 18, fontWeight: '700' },
    item: { width: ITEM_SIZE, alignItems: 'center', marginBottom: 18, marginHorizontal: 6 },
    image: { width: ITEM_SIZE - 12, height: ITEM_SIZE - 12, borderRadius: 10, backgroundColor: '#eee' },
    iconBox: { width: ITEM_SIZE - 12, height: ITEM_SIZE - 12, borderRadius: 10, backgroundColor: '#f3f3f3', alignItems: 'center', justifyContent: 'center' },
    label: { fontSize: 12, marginTop: 6, width: ITEM_SIZE - 12, textAlign: 'center' },
});