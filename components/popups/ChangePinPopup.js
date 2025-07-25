import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { forgotPin, resetPin } from '../../utils/auth';
import GradientButton from '../Login/GradientButton';
import FieldBox from '../task details/FieldBox';

export default function ChangePinPopup({
    visible,
    onClose,
    onSubmit,
    loading,
    error,
    success,
    theme,
}) {
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [forgotMode, setForgotMode] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetPinVal, setResetPinVal] = useState('');
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');

    const [changingMsg, setChangingMsg] = useState('');
    const handleSubmit = () => {
        if (!currentPin || !newPin) return;
        setChangingMsg('Changing...');
        onSubmit(currentPin, newPin, (err) => {
            setCurrentPin('');
            setNewPin('');
            setChangingMsg('');
            if (err) {
                setTimeout(() => {
                    onClose();
                    alert(err);
                }, 200);
            }
        });
    };

    const handleForgotPin = async () => {
        setForgotError('');
        setForgotSuccess('');
        setForgotLoading(true);
        try {
            await forgotPin(email);
            setForgotSuccess('OTP sent to your email.');
            setForgotStep(2);
        } catch (err) {
            setForgotError(err.message || 'Failed to send OTP.');
        }
        setForgotLoading(false);
    };

    const handleResetPin = async () => {
        setForgotError('');
        setForgotSuccess('');
        setForgotLoading(true);
        try {
            await resetPin(email, otp, resetPinVal);
            setTimeout(() => {
                setForgotMode(false);
                setForgotStep(1);
                setEmail('');
                setOtp('');
                setResetPinVal('');
                onClose();
                alert('PIN reset successfully!');
            }, 500);
        } catch (err) {
            setForgotError(err.message || 'Failed to reset PIN.');
        }
        setForgotLoading(false);
    };

    useEffect(() => {
        if (success) {
            setTimeout(() => {
                onClose();
                alert('PIN changed successfully!');
            }, 300);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            setTimeout(() => {
                onClose();
                alert(error);
            }, 300);
        }
    }, [error]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.popup, { backgroundColor: theme.card }]}>

                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>
                            {forgotMode ? (forgotStep === 1 ? 'Forgot PIN' : 'Reset PIN') : 'Change PIN'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Feather name="x" size={22} color={theme.text} />
                        </TouchableOpacity>
                    </View>
                    {!forgotMode ? (
                        <>
                            <FieldBox
                                value={currentPin}
                                onChangeText={setCurrentPin}
                                placeholder="Current PIN"
                                editable
                                theme={theme}
                                inputStyle={{ letterSpacing: 0 }}
                                containerStyle={{ marginHorizontal: 0, marginBottom: 10 }}
                                rightComponent={null}
                                multiline={false}
                            />
                            <FieldBox
                                value={newPin}
                                onChangeText={setNewPin}
                                placeholder="New PIN"
                                editable
                                theme={theme}
                                inputStyle={{ letterSpacing: 0 }}
                                containerStyle={{ marginHorizontal: 0, marginBottom: 10 }}
                                rightComponent={null}
                                multiline={false}
                            />
                            <GradientButton
                                title={loading ? (changingMsg || '') : 'Change PIN'}
                                onPress={handleSubmit}
                                disabled={loading || !currentPin || !newPin}
                                style={{ marginTop: 10 }}
                            >
                                {loading ? (
                                    changingMsg ? <Text style={{ color: '#fff' }}>{changingMsg}</Text> : <ActivityIndicator size="small" color="#fff" />
                                ) : null}
                            </GradientButton>
                            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 4 }} onPress={() => setForgotMode(true)}>
                                <Text style={{ color: theme.primary, fontWeight: '500' }}>Forgot PIN?</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 10 }} onPress={onClose}>
                                <Text style={{ color: theme.secondaryText, fontWeight: '500' }}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {forgotStep === 1 && (
                                <>
                                    <FieldBox
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="Enter your email"
                                        editable
                                        theme={theme}
                                        inputStyle={{ letterSpacing: 0 }}
                                        containerStyle={{ marginHorizontal: 0, marginBottom: 10 }}
                                        rightComponent={null}
                                        multiline={false}
                                    />
                                    <GradientButton
                                        title={forgotLoading ? 'Sending...' : 'Send OTP'}
                                        onPress={handleForgotPin}
                                        disabled={forgotLoading || !email}
                                        style={{ marginTop: 10 }}
                                    >
                                        {forgotLoading && <ActivityIndicator size="small" color="#fff" />}
                                    </GradientButton>
                                </>
                            )}
                            {forgotStep === 2 && (
                                <>
                                    <FieldBox
                                        value={otp}
                                        onChangeText={setOtp}
                                        placeholder="Enter OTP"
                                        editable
                                        theme={theme}
                                        inputStyle={{ letterSpacing: 0 }}
                                        containerStyle={{ marginHorizontal: 0, marginBottom: 10 }}
                                        rightComponent={null}
                                        multiline={false}
                                    />
                                    <FieldBox
                                        value={resetPinVal}
                                        onChangeText={setResetPinVal}
                                        placeholder="New PIN"
                                        editable
                                        theme={theme}
                                        inputStyle={{ letterSpacing: 0 }}
                                        containerStyle={{ marginHorizontal: 0, marginBottom: 10 }}
                                        rightComponent={null}
                                        multiline={false}
                                    />
                                    <GradientButton
                                        title={forgotLoading ? '' : 'Reset PIN'}
                                        onPress={handleResetPin}
                                        disabled={forgotLoading || !otp || !resetPinVal}
                                        style={{ marginTop: 10 }}
                                    >
                                        {forgotLoading && <ActivityIndicator size="small" color="#fff" />}
                                    </GradientButton>
                                </>
                            )}
                            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 4 }} onPress={() => {
                                setForgotMode(false);
                                setForgotStep(1);
                                setEmail('');
                                setOtp('');
                                setResetPinVal('');
                                setForgotError('');
                                setForgotSuccess('');
                            }}>
                                <Text style={{ color: theme.secondaryText, fontWeight: '500' }}>Back to Change PIN</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        width: '92%',
        backgroundColor: '#fff',
        borderRadius: 22,
        paddingVertical: 18,
        paddingHorizontal: 16,
        maxHeight: '92%',
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',

    },
    closeBtn: {
        padding: 4,
        marginLeft: 12,
    },
    errorText: {
        color: 'red',
        marginBottom: 4,
        textAlign: 'center',
    },
    successText: {
        color: 'green',
        marginBottom: 4,
        textAlign: 'center',
    },
});
