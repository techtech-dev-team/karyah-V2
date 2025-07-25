import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function IssueButton({ icon, text, onPress, theme }) {
    return (
        <TouchableOpacity
            style={[
                styles.issueBtn,
                { backgroundColor: theme.secCard, borderColor: theme.primary }
            ]}
            onPress={onPress}
        >
            <Feather name={icon} size={22} color={theme.primary} />
            <Text style={[styles.issueBtnText, { color: theme.text }]}>{text}</Text>
            <Feather name="arrow-right" size={20} color={theme.primary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    issueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0F2FE',
        borderRadius: 10,
        marginHorizontal: 16,
        marginTop: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#366CD9',
    },
    issueBtnText: {
        color: '#222',
        fontWeight: '400',
        fontSize: 15,
        marginLeft: 10,
    },
});