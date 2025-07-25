import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme/ThemeContext';
import { fetchAssignedIssues } from '../../utils/issues';
import { fetchMyTasks } from '../../utils/task'; // <-- im
import TaskCard from './TaskCard';

export default function TaskSection({ navigation, loading: parentLoading }) {
  const theme = useTheme();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasksData, issuesData] = await Promise.all([fetchMyTasks(), fetchAssignedIssues()]);
        setTasks(tasksData || []);
        setIssues(issuesData || []);
      } catch (err) {
        console.error('Error fetching tasks/issues:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = activeTab === 'tasks' ? tasks : issues;
  const filtered = data.filter((item) =>
    (item.title || '').toLowerCase().includes(search.toLowerCase())
  );

  if (parentLoading || loading) {
    return (
      <View style={{ margin: 20, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="small" color={theme.primary || '#366CD9'} />
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 120 }}>
      {/* Section Heading */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {activeTab === 'tasks' ? 'My Tasks' : 'My Issues'}
          <Text style={[styles.count, { color: theme.text }]}> {filtered.length}</Text>
        </Text>
        <TouchableOpacity
          onPress={() =>
            activeTab === 'tasks'
              ? navigation.navigate('MyTasksScreen')
              : navigation.navigate('IssuesScreen')
          }
        >
          <Text style={[styles.viewAll, { color: theme.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        <TouchableOpacity
          style={[ 
            styles.tabButton,
            { borderColor: theme.border },
            activeTab === 'tasks' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('tasks')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather
              name="check-square"
              size={16}
              color={activeTab === 'tasks' ? '#fff' : '#4CAF50'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[ 
                styles.tabText,
                { color: theme.text },
                activeTab === 'tasks' && styles.activeTabText,
              ]}>
              Tasks
              <Text
                style={[ 
                  styles.countsmall,
                  activeTab === 'tasks' ? { color: '#fff' } : { color: theme.text },
                ]}>
                {' '}
                {tasks.length}
              </Text>
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[ 
            styles.tabButton,
            { borderColor: theme.border },
            activeTab === 'issues' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('issues')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather
              name="alert-circle"
              size={16}
              color={activeTab === 'issues' ? '#fff' : '#FF5252'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[ 
                styles.tabText,
                { color: theme.text },
                activeTab === 'issues' && styles.activeTabText,
              ]}>
              Issues
              <Text
                style={[ 
                  styles.countsmall,
                  activeTab === 'issues' ? { color: '#fff' } : { color: theme.text },
                ]}>
                {' '}
                {issues.length}
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Search */}
      <View style={[styles.searchBarContainer, { backgroundColor: theme.SearchBar }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={`Search your ${activeTab}`}
          placeholderTextColor={theme.secondaryText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
        {filtered.map((item, idx) => (
          <TouchableOpacity
            key={(item.title || '') + idx}
            style={styles.cardWrapper}
            activeOpacity={0.8}
            onPress={() =>
              activeTab === 'tasks'
                ? navigation.navigate('TaskDetails', { taskId: item.id || item.taskId })
                : navigation.navigate('IssueDetails', { issueId: item.id || item.issueId, section: 'assigned' })
            }>
            <TaskCard
              title={item.title || item.issueTitle || item.name || 'Untitled'}
              project={item.project?.projectName || item.project || item.projectName}
              percent={item.percent || item.progress || 0}
              desc={item.desc || item.description}
              date={item.date || item.dueDate}
              theme={theme}
              creatorName={item.creatorName || item.createdBy || item.creator?.name}
              isIssue={activeTab === 'issues'} // <-- add this line
              issueStatus={item.issueStatus}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardWrapper: {
    width: '49%',
    marginBottom: 9,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#363942',
  },
  count: {
    color: '#222',
    fontWeight: '600',
    fontSize: 20,
    marginLeft: 8,
  },
  countsmall: {
    color: '#222',
    fontWeight: '400',
    fontSize: 16,
    marginLeft: 8,
  },
  viewAll: {
    color: '#366CD9',
    fontWeight: '400',
    fontSize: 14,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeTab: {
    backgroundColor: '#366CD9',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#363942',
    paddingVertical: 0,
  },
  searchIcon: {
    marginLeft: 8,
  },
});
