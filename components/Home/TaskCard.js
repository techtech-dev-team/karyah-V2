import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function TaskCard({ title, project, percent, theme, isIssue, issueStatus, creatorName }) {
  // Calculate widths for each color segment
  const yellowWidth = percent <= 33 ? percent : 33;
  const orangeWidth = percent > 33 ? (percent <= 66 ? percent - 33 : 33) : 0;
  const blueWidth = percent > 66 ? percent - 66 : 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
      <View style={styles.content}>
        <View style={styles.row}>
          <Text
            style={[styles.taskTitle, { color: theme.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {isIssue ? null : (
            <Text style={[styles.progressText, { color: theme.secondaryText }]}>{percent}%</Text>
          )}
        </View>
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={[styles.taskSubTitle, { color: theme.secondaryText, flex: 1 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {project}
          </Text>
          {isIssue && issueStatus && (
            <Text numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color:
                  issueStatus === 'resolved' ? theme.primary :
                    issueStatus === 'pending_approval' ? '#FFC107' :
                      '#FF6F3C',
                fontSize: 11,
                fontWeight: '400',
                textTransform: 'capitalize',
                marginLeft: 6,
                fontStyle: 'italic',
                flexShrink: 0,
                maxWidth: 60,
              }}>
              {issueStatus.replace(/_/g, ' ')}
            </Text>
          )}
          {!isIssue && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}>
              <Feather name="user" size={14} color={theme.secondaryText} style={{ marginRight: 2 }} />
              <Text style={{ color: theme.secondaryText, fontSize: 12, fontWeight: '400', maxWidth: 60 }} numberOfLines={1} ellipsizeMode="tail">
                {creatorName || 'N/A'}
              </Text>
            </View>
          )}
        </View>
      </View>
      {/* Compact thin progress bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}> 
        <View 
          style={[ 
            styles.progressBar, 
            { 
              width: `${isIssue ? 100 : percent}%`, 
              backgroundColor: isIssue ? '#FF5252' : theme.primary 
            } 
          ]} 
        />
      </View>
    </View>
  );
}

const CARD_HEIGHT = 68;

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 0,
    overflow: 'hidden',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    height: CARD_HEIGHT,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 0,
  },
  taskSubTitle: {
    fontSize: 12,
    fontWeight: '400',
    flexShrink: 1,
    maxWidth: '100%',
    textAlign: 'left',
  },
  progressText: {
    fontWeight: '400',
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 2,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  progressBar: {
    height: 2,
    borderRadius: 0,
  },
});