import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';

export default function FieldBox({
    label,
    subtitle,
    value,
    icon,
    onPress,
    editable = false,
    placeholder,
    rightComponent,
    multiline = false,
    inputStyle = {},
    theme // <-- add theme prop
}) {
    return (
        <View style={styles.wrapper}>
            {/* {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>} */}
            {/* {subtitle && <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{subtitle}</Text>} */}
            <TouchableOpacity
                style={[
                    styles.fieldBox,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    multiline && styles.fieldBoxMultiline
                ]}
                activeOpacity={editable ? 0.7 : 1}
                onPress={onPress}
                disabled={!editable && !onPress}
            >
                {icon && <View style={styles.fieldIcon}>{icon}</View>}
                <TextInput
                    style={[
                        styles.fieldInput,
                        { color: theme.text },
                        multiline && styles.fieldInputMultiline,
                        inputStyle
                    ]}
                    value={value}
                    editable={editable}
                    placeholder={placeholder}
                    placeholderTextColor={theme.secondaryText}
                    multiline={multiline}
                />
                {rightComponent}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 20,
        marginBottom: 12,
    },
    label: {
        fontSize: 15,
        fontWeight: '400',
        color: '#222',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        color: '#888',
        marginBottom: 6,
    },
    fieldBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    fieldBoxMultiline: {
        height: 108, // double the normal height
        alignItems: 'flex-start',
        paddingTop: 12,
        paddingBottom: 12,
    },
    fieldIcon: {
        marginRight: 10,
    },
    fieldInput: {
        flex: 1,
        fontSize: 16,
        color: '#363942',
        paddingVertical: 0,
        backgroundColor: 'transparent',
        fontWeight: '400',
    },
    fieldInputMultiline: {
        textAlignVertical: 'top',
        height: '100%',
    },
});