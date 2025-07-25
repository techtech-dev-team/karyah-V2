import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SwitchDashboardButton({ onPress }) {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={onPress}>
                <Text style={styles.buttonText}>Go to Main Dashboard</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#366CD9',
        borderRadius: 24,
        paddingHorizontal: 32,
        paddingVertical: 12,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});