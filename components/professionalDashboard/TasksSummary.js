import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

const summaryData = [
    { label: 'Tasks', value: 100 },
    { label: 'Delegated', value: 78 },
    { label: 'Issues', value: 78 },
    { label: 'Connections', value: 4 },
    { label: 'Projects', value: 2 },
];

export default function TasksSummary() {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollRow}
            >
                {summaryData.map((item) => (
                    <View key={item.label} style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {item.value < 10 ? `0${item.value}` : item.value}
                        </Text>
                        <Text style={styles.statLabel}>{item.label}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minWidth: '250',
        marginTop: 20,
        paddingHorizontal: 16,
    },
    scrollRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
    },
    statCard: {
        minWidth: 100,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e6eaf3',
        marginRight: 6,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 2,
    },
});
