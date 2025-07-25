import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Animated,
    Easing,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';

export default function AttachmentSheet({ visible, onClose, onPick }) {
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        } else {
            slideAnim.setValue(300);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <Animated.View
                        style={[
                            styles.sheet,
                            {
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>Add Attachment</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.row}>
                            <Option icon="image" label="Photos" onPress={() => onPick('photo')} />
                            <Option icon="camera" label="Camera" onPress={() => onPick('camera')} />
                            <Option icon="video" label="Video" onPress={() => onPick('video')} />
                            <Option icon="file" label="Document" onPress={() => onPick('document')} />
                        </View>

                        {/* <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity> */}
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

function Option({ icon, label, onPress }) {
    return (
        <TouchableOpacity style={styles.iconBox} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.iconCircle}>
                <Feather name={icon} size={24} color="#fff" />
            </View>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingBottom: 30,
        paddingTop: 18,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 18,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    iconBox: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        backgroundColor: '#333',
        borderRadius: 40,
        padding: 16,
        marginBottom: 6,
    },
    label: {
        color: '#ccc',
        fontSize: 13,
        fontWeight: '500',
    },
    cancelBtn: {
        alignSelf: 'center',
        marginTop: 6,
    },
    cancelText: {
        color: '#aaa',
        fontSize: 15,
        fontWeight: '600',
    },
});
