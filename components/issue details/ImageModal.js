import React from 'react';
import { Modal, View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ImageModal({ visible, image, onClose, theme }) {
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.bg}>
                <View style={[styles.drawer, { backgroundColor: theme?.card || '#fff' }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme?.text || '#222' }]}>Image Preview</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={28} color={theme?.text || "#222"} />
                        </TouchableOpacity>
                    </View>
                    {image && (
                        <Image source={{ uri: image }} style={styles.fullImage} resizeMode="contain" />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    drawer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 16,
        minHeight: 340,
        maxHeight: '80%',
        alignItems: 'center',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
    },
    fullImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        backgroundColor: '#eee',
    },
});