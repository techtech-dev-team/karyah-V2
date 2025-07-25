
import { StyleSheet, Text, TextInput, View } from 'react-native';

// Accept timer, isResending, handleResendOtp as optional props for OTP screens
export default function OTPInput({ otp, otpRefs, onChange, onKeyPress, timer, isResending, handleResendOtp }) {
  return (
    <View style={styles.otpContainer}>
      {otp.map((digit, idx) => (
        <TextInput
          ref={otpRefs[idx]}
          key={idx}
          style={styles.otpInput}
          maxLength={1}
          keyboardType="numeric"
          value={digit}
          onChangeText={(value) => {
            // If user pastes or types all 4 digits at once, fill all boxes
            if (value && value.length === otp.length) {
              value.split('').forEach((v, i) => {
                onChange(v, i);
              });
              // Focus last box
              otpRefs[otp.length - 1]?.current?.focus();
            } else {
              onChange(value, idx);
            }
          }}
          onKeyPress={(e) => onKeyPress(e, idx)}
        />
      ))}
      {/* Only show timer row if timer prop is provided (OTP screen) */}
      {typeof timer === 'number' && handleResendOtp && (
        <View style={styles.otpTimerRow}>
          <Text style={styles.otpTimerText}>
            {timer > 0
              ? `Resend OTP in 0:${timer < 10 ? `0${timer}` : timer}`
              : 'Didn\'t receive the code?'}
          </Text>
          <Text
            style={[styles.resendBtn, { opacity: timer > 0 || isResending ? 0.5 : 1 }]}
            onPress={handleResendOtp}
            disabled={timer > 0 || isResending}
          >
            {isResending ? 'Sending...' : 'Resend OTP'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    maxWidth: '100%',
    width: '100%',
    paddingVertical: 0,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 14,
    width: 52,
    height: 52,
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
  },

  otpInfoText: {
    color: '#666',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  otpTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 10,
    gap: 10,
  },
  otpTimerText: {
    color: '#888',
    fontSize: 13,
    marginRight: 8,
  },
  resendBtn: {
    color: '#366CD9',
    fontWeight: '600',
    fontSize: 13,
    textDecorationLine: 'underline',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});