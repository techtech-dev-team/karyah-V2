import React from 'react';
import { ScrollView, Pressable, TouchableOpacity, Image, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Linking } from 'react-native';

export default function AttachmentGallery({ attachments, theme, onImagePress, onAudioPress }) {
    if (!attachments || attachments.length === 0) return null;
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingVertical: 2 }}
        >
            {attachments.map((att, idx) => {
                const uri = att.uri || att;
                // Image
                if (
                    att.type?.startsWith('image') ||
                    att.mimeType?.startsWith('image') ||
                    (uri && /\.(jpg|jpeg|png|gif|webp)$/i.test(uri))
                ) {
                    return (
                        <Pressable
                            key={idx}
                            onPress={() => onImagePress(uri)}
                            style={{
                                borderRadius: 8,
                                overflow: 'hidden',
                                borderWidth: 1,
                                borderColor: theme.border,
                                backgroundColor: theme.secCard,
                                marginRight: 8,
                            }}
                        >
                            <Image
                                source={{ uri }}
                                style={{ width: 60, height: 60 }}
                                resizeMode="cover"
                            />
                        </Pressable>
                    );
                }
                // Audio
                if (
                    att.type?.startsWith('audio') ||
                    att.mimeType?.startsWith('audio') ||
                    (uri && /\.(m4a|mp3|wav)$/i.test(uri))
                ) {
                    return (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => onAudioPress(uri)}
                            style={{
                                width: 60, height: 60, borderRadius: 8,
                                backgroundColor: theme.secCard, alignItems: 'center', justifyContent: 'center',
                                borderWidth: 1, borderColor: theme.border, marginRight: 8,
                            }}
                        >
                            <Feather name="play-circle" size={32} color={theme.primary} />
                            <Text style={{ fontSize: 10, color: theme.primary, marginTop: 2 }}>Audio</Text>
                        </TouchableOpacity>
                    );
                }
                // Document/Other
                return (
                    <TouchableOpacity
                        key={idx}
                        onPress={async () => {
                            try {
                                await Linking.openURL(uri);
                            } catch (e) {
                                alert('Unable to open file.');
                            }
                        }}
                        style={{
                            width: 60, height: 60, borderRadius: 8,
                            backgroundColor: theme.secCard, alignItems: 'center', justifyContent: 'center',
                            borderWidth: 1, borderColor: theme.border, marginRight: 8,
                        }}
                    >
                        <Feather name="file" size={28} color={theme.primary} />
                        <Text style={{ fontSize: 10, color: theme.primary, marginTop: 2 }}>File</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}