import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getUserConnections } from '../../utils/connections';
import { updateIssue } from '../../utils/issues';

const ReassignPopup = ({ visible, onClose, issueId, theme }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      getUserConnections()
        .then((data) => setConnections(data))
        .catch(() => setConnections([]))
        .finally(() => setLoading(false));
    }
  }, [visible]);

  const handleSearch = (value) => {
    setQuery(value);
    if (!value.trim() || value.length < 3) {
      setSearchResults([]);
      return;
    }
    const filtered = connections.filter(user =>
      (user.userName || user.name || '').toLowerCase().includes(value.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleReassign = async (userId, userName) => {
    try {
      await updateIssue({ issueId, assignTo: userId });
      Alert.alert(
        "Success",
        `Issue #${issueId} has been reassigned to ${userName}.`,
        [{ text: "OK", onPress: handleClose }]
      );
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to reassign issue");
    }
  };

  const handleClose = () => {
    setQuery('');
    setSearchResults([]);
    onClose();
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.userItem, { borderBottomColor: theme.border }]}
      onPress={() => handleReassign(item.userId || item.id, item.userName || item.name)}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.userName, { color: theme.text }]}>{item.userName || item.name}</Text>
        <Text style={[styles.userEmail, { color: theme.secondaryText }]}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.popup, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Re-Assign Issue
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.headerDesc, { color: theme.secondaryText }]}>
            Search and select a user to reassign this issue to:
          </Text>
          <Text style={[styles.headerNote, { color: theme.danger }]}>
            Note: All images will be cleared when reassigning this issue.
          </Text>

          {/* Search Input */}
          <View style={[styles.inputBox, { backgroundColor: theme.secCard, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Search user by name or email..."
              placeholderTextColor={theme.secondaryText}
              value={query}
              onChangeText={handleSearch}
              autoFocus={true}
            />
          </View>

          {/* Search Results */}
          {loading ? (
            <View style={styles.resultsBox}>
              <Text style={[styles.noResultsText, { color: theme.secondaryText }]}>Loading connections...</Text>
            </View>
          ) : query.length >= 3 ? (
            <View style={styles.resultsBox}>
              {searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderUserItem}
                  keyExtractor={(item) => (item.userId || item.id).toString()}
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 180 }}
                />
              ) : (
                <View style={[styles.noResultsBox, { backgroundColor: theme.secCard, borderColor: theme.border }]}>
                  <Text style={[styles.noResultsText, { color: theme.secondaryText }]}>No users found matching your search</Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Minimum Characters Message */}
          {query.length > 0 && query.length < 3 && (
            <View style={styles.resultsBox}>
              <Text style={[styles.noResultsText, { color: theme.secondaryText }]}>
                Type at least 3 characters to search
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: theme.secCard }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '92%',
    borderRadius: 22,
    paddingVertical: 18,
    maxHeight: '90%',
    elevation: 8,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 12,
  },
  headerDesc: {
    fontSize: 14,
    fontWeight: '400',
    marginHorizontal: 20,
    marginBottom: 2,
  },
  headerNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginHorizontal: 20,
    marginBottom: 10,
    fontWeight: '500',
  },
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    backgroundColor: 'transparent',
    paddingVertical: 10,
  },
  resultsBox: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  userItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '400',
  },
  noResultsBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: 20,
    marginTop: 8,
    gap: 8,
  },
  cancelBtn: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontWeight: '500',
    fontSize: 15,
  },
});

export default ReassignPopup;