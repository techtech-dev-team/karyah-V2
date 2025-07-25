import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function Header() {
    return (
        <View style={styles.header}>
            <View style={styles.row}>
                <Text style={styles.title}>KARYAH:</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { alignItems: 'center', marginTop: 8 },
    row: { flexDirection: 'row', alignItems: 'center' },
    title: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '600',
        letterSpacing: 0,
        marginRight: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#fff',
    },
    subtitle: {
        color: '#e0e7ef',
        fontSize: 14,
        marginTop: 4,
        fontWeight: '600',
        letterSpacing: 1,
    },
});