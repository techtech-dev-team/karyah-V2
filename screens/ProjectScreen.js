import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Feather } from '@expo/vector-icons'; // Add this import if not already present

import ProjectFabDrawer from 'components/Project/ProjectFabDrawer';
import { Platform } from 'react-native';
import ProjectPopup from '../components/popups/ProjectPopup';
import ProjectBanner from '../components/Project/ProjectBanner';
import ProjectCard from '../components/Project/ProjectCard';
import ProjectSearchBar from '../components/Project/ProjectSearchBar';
import { getProjectsByUserId } from '../utils/project';

export default function ProjectScreen({ navigation }) {
  const theme = useTheme();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProjectPopup, setShowProjectPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'working', 'delayed', 'completed'

  const [projectForm, setProjectForm] = useState({
    projectName: '',
    projectDesc: '',
    startDate: '',
    endDate: '',
    projectCategory: '',
    location: '',
    coAdmins: '',
  });

  const handleProjectChange = (field, value) => {
    setProjectForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProjectSubmit = () => {
    setShowProjectPopup(false);
    setProjectForm({
      projectName: '',
      projectDesc: '',
      startDate: '',
      endDate: '',
      projectCategory: '',
      location: '',
      coAdmins: '',
    });
  };

  const fetchProjects = async () => {
    try {
      const result = await getProjectsByUserId();
      // console.log('✅ Projects fetched:', result);
      setProjects(result || []);
    } catch (err) {
      console.error('❌ Error fetching projects:', err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProjects();
    });
    return unsubscribe;
  }, [navigation]);


  // Categorize projects
  const now = new Date();
  const filtered = projects.filter(p =>
    p?.projectName?.toLowerCase().includes(search.toLowerCase())
  );
  const working = [];
  const completed = [];
  const delayed = [];
  filtered.forEach(p => {
    const end = p.endDate ? new Date(p.endDate) : null;
    if (p.progress >= 100) {
      completed.push(p);
    } else if (end && end < now) {
      delayed.push(p);
    } else {
      working.push(p);
    }
  });

  let tabData = [];
  if (activeTab === 'all') {
    tabData = [...working, ...delayed, ...completed];
  } else if (activeTab === 'working') {
    tabData = working;
  } else if (activeTab === 'delayed') {
    tabData = delayed;
  } else if (activeTab === 'completed') {
    tabData = completed;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingBottom: 70 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back-ios" size={16} color={theme.text} />
        <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
      </TouchableOpacity>

      <ProjectBanner onAdd={() => setShowProjectPopup(true)} theme={theme} />
      <ProjectSearchBar value={search} onChange={setSearch} theme={theme} />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginBottom: 12, gap: 2, flexWrap: 'wrap', rowGap: 10, maxWidth: "95%" }}>        {[
        {
          key: 'all',
          label: 'All',
          count: working.length + delayed.length + completed.length,
          icon: <Feather name="grid" size={13} color={activeTab === 'all' ? "#fff" : theme.primary} style={{ marginRight: 4 }} />
        },
        {
          key: 'working',
          label: 'Working',
          count: working.length,
          icon: <Feather name="play-circle" size={13} color={activeTab === 'working' ? "#fff" : "#039855"} style={{ marginRight: 4 }} />
        },
        {
          key: 'delayed',
          label: 'Delayed',
          count: delayed.length,
          icon: <Feather name="clock" size={13} color={activeTab === 'delayed' ? "#fff" : "#E67514"} style={{ marginRight: 4 }} />
        },
        {
          key: 'completed',
          label: 'Completed',
          count: completed.length,
          icon: <Feather name="check-circle" size={13} color={activeTab === 'completed' ? "#fff" : "#366CD9"} style={{ marginRight: 4 }} />
        },
      ].map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={{
            backgroundColor: activeTab === tab.key ? theme.primary : 'transparent',
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 6,
            marginRight: 2,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
          onPress={() => setActiveTab(tab.key)}
        >
          {tab.icon}
          <Text style={{
            fontSize: 13,
            fontWeight: '500',
            color: activeTab === tab.key ? '#fff' : theme.secondaryText,
          }}>
            {tab.label}
            <Text style={{ fontSize: 14, fontWeight: '400', color: activeTab === tab.key ? '#fff' : theme.secondaryText }}>
              {' '}{tab.count}
            </Text>
          </Text>
        </TouchableOpacity>
      ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.text} style={{ marginTop: 20 }} />
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {tabData.length === 0 ? (
              <Text style={{ marginLeft: 18, marginTop: 20, color: theme.secondaryText }}>No projects found.</Text>
            ) : (
              tabData.map((item, idx) => (
                <ProjectCard key={item.id || idx} project={item} theme={theme} />
              ))
            )}
          </ScrollView>
        </View>
      )}

      <ProjectFabDrawer
        onTaskSubmit={(task) => console.log('🛠️ New Task:', task)}
        onProjectSubmit={(project) => console.log('📁 New Project:', project)}
        theme={theme}
      />

      <ProjectPopup
        visible={showProjectPopup}
        onClose={() => setShowProjectPopup(false)}
        values={projectForm}
        onChange={handleProjectChange}
        onSubmit={handleProjectSubmit}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    marginTop: Platform.OS === 'ios' ? 70 : 25,
    marginLeft: 16,
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 18,
    fontWeight: '400',
    marginLeft: 0,
  },
});
