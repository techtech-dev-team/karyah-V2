import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tabs = ['User', 'Project', 'Task'];

export default function PieChartCard() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <View style={styles.card}>
            {/* Replace below with a real chart */}
            <View style={styles.piePlaceholder}>
                <Text style={{ color: '#888' }}>[Pie Chart]</Text>
            </View>
            <View style={styles.tabs}>
                {tabs.map((tab, idx) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === idx && styles.activeTab]}
                        onPress={() => setActiveTab(idx)}
                    >
                        <Text style={[styles.tabText, activeTab === idx && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginHorizontal: 18,
        marginTop: 12,
        padding: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e6eaf3',
    },
    piePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e0e7ef',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    tab: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#e6eaf3',
        marginHorizontal: 4,
    },
    activeTab: {
        backgroundColor: '#366CD9',
    },
    tabText: {
        color: '#222',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
});