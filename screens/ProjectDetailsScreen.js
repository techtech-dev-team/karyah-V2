import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GradientButton from '../components/Login/GradientButton';
import DependencyChartPopup from '../components/popups/DependencyChartPopup';
import ProjectIssuePopup from '../components/popups/ProjectIssuePopup';
import DateBox from '../components/project details/DateBox';
import FieldBox from '../components/project details/FieldBox';
import IssueButton from '../components/project details/IssueButton';
import { useTheme } from '../theme/ThemeContext';
import { fetchUserConnections } from '../utils/issues';
import { getProjectById } from '../utils/project';
import CoAdminListPopup from 'components/popups/CoAdminListPopup';

export default function ProjectDetailsScreen({ navigation, route }) {
  const [showCoAdminPopup, setShowCoAdminPopup] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const theme = useTheme();
  const { project, projectId } = route.params || {};
  const [users, setUsers] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDependencyChart, setShowDependencyChart] = useState(false);

  const [showProjectIssuePopup, setShowProjectIssuePopup] = useState(false);
  const [issueForm, setIssueForm] = useState({
    title: '',
    description: '',
    projectId: '',
    assignTo: '',
    dueDate: '',
    isCritical: false,
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Use projectId if available, else fallback to project.id
        const id = projectId || (project && project.id);
        if (!id) throw new Error('No projectId provided');
        const res = await getProjectById(id);
        setProjectDetails(res);
      } catch (err) {
        console.error('Failed to fetch project details:', err.message);
        setProjectDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [projectId, project]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const connections = await fetchUserConnections();
        setUsers(connections || []);
      } catch (err) {
        console.error('Failed to fetch connections:', err.message);
        setUsers([]);
      }
    };

    fetchConnections();
  }, []);

  const handleIssueChange = (field, value) => {
    setIssueForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleIssueSubmit = () => {
    // Future: send issue to backend
    setShowProjectIssuePopup(false);
    setIssueForm({
      title: '',
      description: '',
      assignTo: '',
      dueDate: '',
      isCritical: false,
    });
    return null; // Prevent accidental raw value rendering
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
        }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!projectDetails) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
        }}>
        <Text style={{ color: theme.text }}>Project not found</Text>
      </View>
    );
  }

  const progressPercent = projectDetails.progress || 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={16} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
        </TouchableOpacity>
        <LinearGradient
          colors={[theme.secondary, theme.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerCard}>
          <View>
            <Text style={styles.projectName}>{projectDetails.projectName}</Text>
            <Text
              style={
                styles.dueDate
              }>{`Due Date : ${projectDetails.endDate?.split('T')[0] || '-'}`}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('UpdateProjectScreen', {
              projectId: projectDetails.id, // or project.id
            })}
            style={{
              padding: 8,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 8,
            }}
          >
            <MaterialIcons name="edit" size={22} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
        {/* Compact tab-style button for Task Dependency Flow */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowDependencyChart(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: theme.card,
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 7,
            marginHorizontal: 20,
            marginTop: 0,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <MaterialIcons name="device-hub" size={18} color={theme.primary} style={{ marginRight: 7 }} />
          <Text style={{ color: theme.text, fontWeight: '400', fontSize: 13 }}>
            Task Dependency Flow
          </Text>
        </TouchableOpacity>
        <View style={styles.progressSection}>
          <Text style={[styles.progressLabel, { color: theme.text }]}>
            Progress <Text style={{ color: theme.success }}>{projectDetails.progress || 0}%</Text>
          </Text>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.statusText, { color: theme.primary }]}>
              {projectDetails.status}
            </Text>
          </View>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressBar,
              { width: `${progressPercent}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
        <View style={styles.dateRow}>
          <DateBox
            label="Start Date"
            value={projectDetails.startDate?.split('T')[0] || '-'}
            theme={theme}
          />
          <DateBox
            label="End Date"
            value={projectDetails.endDate?.split('T')[0] || '-'}
            theme={theme}
          />
        </View>
        <FieldBox
          label="Project Category"
          value={projectDetails.projectCategory}
          placeholder="Project Category"
          theme={theme}
        />
        <FieldBox
          label="Location"
          value={projectDetails.location}
          placeholder="Location"
          theme={theme}
        />
        <View style={[styles.fieldBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Row with label and avatars spaced */}
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: theme.text, marginBottom: 8 }]}>
              Co-Admins
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowCoAdminPopup(true)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              {projectDetails.coAdmins?.slice(0, 12).map((admin, index) => (
                <View
                  key={index}
                  style={{
                    marginLeft: index === 0 ? 0 : -16,
                    zIndex: projectDetails.coAdmins.length - index,
                  }}
                >
                  <Image
                    source={{
                      uri:
                        admin.profilePhoto ||
                        'https://ui-avatars.com/api/?name=' + encodeURIComponent(admin.name),
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: theme.primary,
                      backgroundColor: theme.mode === 'dark' ? '#23272f' : '#F8F9FB',
                    }}
                  />
                </View>
              ))}

              {projectDetails.coAdmins?.length > 12 && (
                <View
                  style={{
                    marginLeft: -16,
                    zIndex: 0,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.buttonBg,
                    borderWidth: 2,
                    borderColor: theme.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: theme.buttonText, fontWeight: '600' }}>
                    +{projectDetails.coAdmins.length - 12}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

          </View>
        </View>
        <FieldBox
          label="Description"
          value={projectDetails.description}
          placeholder="Description"
          multiline={true}
          theme={theme}
        />
        <View style={styles.issueBtnRow}>
          <IssueButton
            icon="alert-circle"
            text="Raise an Issue"
            onPress={() => {
              setIssueForm(prev => ({
                ...prev,
                projectId: projectDetails?.id || '',
              }));
              setShowProjectIssuePopup(true);
            }}
            theme={theme}
          />
          <IssueButton
            icon="alert-circle"
            text="View Issue List"
            onPress={() => {
              // console.log('Navigating with projectId:', projectDetails?.id);
              if (projectDetails?.id) {
                navigation.navigate('ProjectIssuesScreen', { projectId: projectDetails.id });
              } else {
                console.warn('No projectId found in projectDetails', projectDetails);
              }
            }}
            theme={theme}
          />
        </View>
      </ScrollView>
      <View style={styles.fixedButtonContainer}>
        <GradientButton
          title="View All Worklists"
          onPress={() => navigation.navigate('WorklistScreen', { project: projectDetails })}
          theme={theme}
        />
      </View>
      <ProjectIssuePopup
        visible={showProjectIssuePopup}
        onClose={() => setShowProjectIssuePopup(false)}
        values={issueForm}
        onChange={handleIssueChange}
        onSubmit={handleIssueSubmit}
        theme={theme}
        projects={[{ id: projectDetails.id, projectName: projectDetails.projectName }]}
        users={users}
      />
      {showDependencyChart && (
        <DependencyChartPopup
          key={`chart-${projectDetails.id}-${Date.now()}`} // 👈 force new mount each time
          visible={true}
          onClose={() => setShowDependencyChart(false)}
          projectId={projectDetails.id}
        />
      )}
      <CoAdminListPopup
        visible={showCoAdminPopup}
        onClose={() => setShowCoAdminPopup(false)}
        data={projectDetails.coAdmins}
        theme={theme}
        title={`Co-Admins (${projectDetails.coAdmins?.length || 0})`} // <-- Dynamic title
      />
    </View>
  );
}
const styles = StyleSheet.create({
  backBtn: {
    marginTop: Platform.OS === 'ios' ? 70 : 25,
    marginLeft: 16,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 18,
    color: '#222',
    fontWeight: '400',
    marginLeft: 0,
  },
  headerCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 110,
  },
  projectName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  dueDate: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.85,
    fontWeight: '400',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 22,
    marginBottom: 8,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontWeight: '400',
    fontSize: 16,
    color: '#222',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E42',
    marginRight: 6,
  },
  statusText: {
    color: '#F59E42',
    fontWeight: '400',
    fontSize: 14,
  },
  progressBarBg: {
    width: '90%',
    height: 6,
    backgroundColor: '#ECF0FF',
    borderRadius: 6,
    marginHorizontal: '5%',
    marginBottom: 18,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#366CD9',
    borderRadius: 6,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 22,
    marginBottom: 12,
    gap: 8,
  },
  dateBox: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 13,
    color: '#222',
    marginTop: 4,
    marginBottom: 2,
    fontWeight: '400',
  },
  dateValue: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '500',
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    minHeight: 54,
    paddingVertical: 8,
  },
  inputLabel: {
    color: '#222',
    fontWeight: '400',
    fontSize: 14,
    marginBottom: 2,
  },
  inputValue: {
    color: '#444',
    fontSize: 14,
    fontWeight: '400',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },

  issueBtnRow: {
    marginTop: 0,
    marginBottom: 8,
  },
  issueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
  },
  issueBtnText: {
    color: '#222',
    fontWeight: '400',
    fontSize: 15,
    marginLeft: 10,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 10,
    elevation: 5,
  },
  coAdminPopupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    zIndex: 100,
  },
  coAdminPopup: {
    width: 280,
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    elevation: 8,
  },
  coAdminPopupTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  coAdminPopupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coAdminPopupCloseBtn: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: 'rgba(52, 120, 246, 0.08)',
  },
});
