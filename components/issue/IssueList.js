import { Feather, MaterialIcons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function IssueList({ issues, onPressIssue, navigation, styles, theme, section, onStatusFilter, statusTab }) {
  // Filtering logic
  let filteredIssues = issues;
  if (statusTab === 'critical') {
    filteredIssues = issues.filter(i => i.isCritical);
  } else if (statusTab === 'resolved') {
    filteredIssues = issues.filter(i => i.issueStatus === 'resolved');
  } else if (statusTab === 'unresolved') {
    filteredIssues = issues.filter(i => i.issueStatus === 'unresolved');
  } else if (statusTab === 'pending_approval') {
    filteredIssues = issues.filter(i => i.issueStatus === 'pending_approval');
  }

  return (
    <>
      {/* Status filter tabs row (pill design) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginBottom: 12, gap: 2, flexWrap: 'wrap', rowGap: 10, maxWidth: "95%" }}>
        {[
          {
            key: 'all',
            label: 'All',
            icon: <Feather name="list" size={13} color={statusTab === 'all' ? '#fff' : theme.primary} style={{ marginRight: 2 }} />,
            count: issues.length,
            color: theme.primary,
          },
          {
            key: 'critical',
            label: 'Critical',
            icon: <Feather name="alert-triangle" size={13} color={statusTab === 'critical' ? '#fff' : '#FF2700'} style={{ marginRight: 2 }} />,
            count: issues.filter(i => i.isCritical).length,
            color: '#FF2700',
          },
          {
            key: 'resolved',
            label: 'Resolved',
            icon: <Feather name="check-circle" size={13} color={statusTab === 'resolved' ? '#fff' : '#039855'} style={{ marginRight: 2 }} />,
            count: issues.filter(i => i.issueStatus === 'resolved').length,
            color: '#039855',
          },
          {
            key: 'pending_approval',
            label: 'Pending',
            icon: <Feather name="clock" size={13} color={statusTab === 'pending_approval' ? '#fff' : '#FFC107'} style={{ marginRight: 2 }} />,
            count: issues.filter(i => i.issueStatus === 'pending_approval').length,
            color: '#FFC107',
          },
          {
            key: 'unresolved',
            label: 'Unresolved',
            icon: <MaterialIcons name="error-outline" size={13} color={statusTab === 'unresolved' ? '#fff' : '#E67514'} style={{ marginRight: 2 }} />,
            count: issues.filter(i => i.issueStatus === 'unresolved').length,
            color: '#E67514',
          },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onStatusFilter(tab.key)}
            style={{
              backgroundColor: statusTab === tab.key ? theme.primary : 'transparent',
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
          >
            {tab.icon}
            <Text style={{
              color: statusTab === tab.key ? '#fff' : theme.secondaryText,
              fontSize: 13,
              fontWeight: '500',
            }}>
              {tab.label}
              <Text style={{ fontSize: 12, fontWeight: '400', marginLeft: 4, color: statusTab === tab.key ? '#fff' : theme.secondaryText }}>
                {' '}{tab.count}
              </Text>
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        style={{ marginHorizontal: 16, marginBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredIssues.map((item, idx) => (
          <TouchableOpacity
            key={(item.title || item.issueTitle || 'issue') + idx}
            activeOpacity={0.8}
            onPress={() => onPressIssue(item)}
          >
            <View style={[
              styles.issueCard,
              { backgroundColor: theme.card, borderColor: theme.border }
            ]}>
              <View style={[styles.issueIcon, { backgroundColor: theme.avatarBg }]}>
                <Text style={[styles.issueIconText, { color: theme.primary }]}>
                  {(item.title && item.title.trim().length > 0
                    ? item.title.trim()[0].toUpperCase()
                    : (item.issueTitle && item.issueTitle.trim().length > 0
                      ? item.issueTitle.trim()[0].toUpperCase()
                      : '?'))}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.issueRow}>
                  <View style={styles.issueTitleRow}>
                    <Text style={[styles.issueName, { color: theme.text }]}>
                      {item.title || item.issueTitle || 'Untitled'}
                    </Text>
                    {item.isCritical && (
                      <View style={[styles.criticalTag, { backgroundColor: '#FF2700', paddingVertical: 1, paddingHorizontal: 6, borderRadius: 5, marginLeft: 6 }]}>
                        <Text style={[styles.criticalTagText, { color: '#FFF', fontWeight: '500', fontSize: 10, letterSpacing: 0.2 }]}>Critical</Text>
                      </View>
                    )}
                    {/* Issue Status Tag */}
                    {item.issueStatus && (
                      <View style={{
                        backgroundColor:
                          item.issueStatus === 'resolved'
                            ? 'rgba(57, 201, 133, 0.13)'
                            : item.issueStatus === 'pending_approval'
                              ? 'rgba(255, 193, 7, 0.18)'
                              : 'rgba(230, 117, 20, 0.08)',
                        borderRadius: 5,
                        paddingHorizontal: 6,
                        paddingVertical: 1,
                        marginLeft: 6,
                        alignSelf: 'center',
                        borderWidth: 0.5,
                        borderColor:
                          item.issueStatus === 'resolved'
                            ? '#039855'
                            : item.issueStatus === 'pending_approval'
                              ? '#FFC107'
                              : '#E67514',
                      }}>
                        <Text style={{
                          color:
                            item.issueStatus === 'resolved'
                              ? '#039855'
                              : item.issueStatus === 'pending_approval'
                                ? '#FFC107'
                                : '#E67514',
                          fontWeight: '500',
                          fontSize: 10,
                          textTransform: 'capitalize',
                          letterSpacing: 0.2,
                        }}>
                          {item.issueStatus.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.issueRow}>
                  <Feather name="user" size={14} color={theme.secondaryText} />
                  <Text style={[styles.issueInfo, { color: theme.secondaryText }]}>
                    {section === 'assigned'
                      ? `Created by ${item.creatorName || item.assignedUserName || 'N/A'}`
                      : `Assigned to ${item.assignToUserName || 'N/A'}`}
                  </Text>
                </View>
              </View>
              <View style={styles.chevronBox}>
                <Feather name="chevron-right" size={24} color={theme.text} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}