// CoAdminListPopup.js
import {
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CoAdminListPopup({ visible, onClose, data = [], theme, title }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {title ? title : `Co-Admins (${data.length})`}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontWeight: '600', fontSize: 16, color: theme.primary }}>Close</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item, index }) => (
              <View style={styles.item}>
                <Image
                  source={{
                    uri:
                      item.profilePhoto ||
                      'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.name),
                  }}
                  style={[styles.avatar, { borderColor: theme.primary }]}
                />
                <Text style={[styles.label, { color: theme.text }]}>{item.name}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ color: theme.secondaryText, textAlign: 'center', marginTop: 20 }}>
                No co-admins added
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    backgroundColor: '#ccc',
  },
});
