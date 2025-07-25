import { Feather } from '@expo/vector-icons';
import CustomCircularProgress from 'components/task details/CustomCircularProgress';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

export default function TaskCard({ task, onSubtaskPress, theme }) {
  const formattedEndDate = task.endDate ? task.endDate.split('T')[0] : '';
  const assignedUsers = task.assignedUserDetails || [];

  return (
    <TouchableOpacity
      style={[
        styles.taskCard,
        { backgroundColor: theme.card, borderColor: theme.border }
      ]}
      onPress={() => onSubtaskPress(task.taskId || task.id)} // ✅ Send taskId
    >
      <View style={[styles.taskIcon, { backgroundColor: theme.avatarBg }]}>
        <Text style={[styles.projectIconText, { color: theme.primary }]}>
          {(task.name || task.title || 'T')[0]}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.taskName, { color: theme.text }]}>{task.name}</Text>

        <View style={styles.taskRow}>
          <Feather name="calendar" size={14} color={theme.secondaryText} />
          <Text style={[styles.taskInfo, { color: theme.secondaryText }]}>
            Due Date: {formattedEndDate}
          </Text>
        </View>

        <View style={styles.taskRow}>
          <Feather name="user" size={14} color={theme.secondaryText} />
          <Text style={[styles.taskInfo, { color: theme.secondaryText }]}>
            Assigned To:&nbsp;
          </Text>
          {assignedUsers.map((user, idx) => (
            <View
              key={user.id || idx}
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 6 }}
            >
              {user.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    marginRight: 3,
                    backgroundColor: '#eee',
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: theme.avatarBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 3,
                  }}
                >
                  <Text style={{
                    color: theme.primary,
                    fontSize: 10,
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}>
                    {user.name?.[0] || '?'}
                  </Text>
                </View>
              )}
              <Text style={[styles.taskInfo, { color: theme.secondaryText, marginLeft: 0 }]}>
                {user.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View>
        <CustomCircularProgress percentage={task.progress || 0} />
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e6eaf3',
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F2F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  projectIconText: {
    color: '#366CD9',
    fontWeight: 'bold',
    fontSize: 20,
  },
  taskName: {
    color: '#222',
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  taskInfo: {
    color: '#666',
    fontSize: 13,
    marginLeft: 5,
    fontWeight: '400',
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#366CD9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    backgroundColor: '#fff',
  },
  progressText: {
    color: '#366CD9',
    fontWeight: '400',
    fontSize: 12,
  },
});