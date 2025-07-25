import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

// Dummy data
const trendsData = [5, 8, 6, 10, 7, 12, 9];
const topPerformers = [
  { name: 'Amit', tasks: 14 },
  { name: 'Sara', tasks: 12 },
  { name: 'John', tasks: 10 },
];
const upcomingDeadlines = [
  { title: 'Submit Report', due: 'Today' },
  { title: 'Client Meeting', due: 'Tomorrow' },
  { title: 'Deploy Update', due: 'In 2 days' },
];
const projectHealth = [
  { name: 'Home', status: 'On Track' },
  { name: 'Office', status: 'At Risk' },
  { name: 'Garage', status: 'Delayed' },
];
const recentActivity = [
  { action: 'Task Completed', user: 'Amit', time: '2h ago' },
  { action: 'Issue Reported', user: 'Sara', time: '3h ago' },
  { action: 'Project Created', user: 'John', time: '5h ago' },
];
const resourceUtilization = [
  { name: 'Amit', assigned: 8, completed: 6 },
  { name: 'Sara', assigned: 7, completed: 7 },
  { name: 'John', assigned: 5, completed: 3 },
];
const customInsights = [
  { label: 'Most Delayed Task', value: 'Roof Waterproofing' },
  { label: 'Longest Open Issue', value: 'Plumbing Leak' },
];

export default function AllAnalyticsSection() {
  return (
    <View style={{ paddingBottom: 0 }}>
      {/* Trends Over Time */}
      <Section title="Trends Over Time">
        <BarChart
          data={{
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{ data: trendsData }],
          }}
          width={Dimensions.get('window').width - 60}
          height={200}
          yAxisLabel=""
          fromZero
          showValuesOnTopOfBars
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(54, 108, 217, ${opacity})`,
            labelColor: () => '#666',
            style: { borderRadius: 16 },
            propsForBackgroundLines: {
              stroke: '#eee',
            },
          }}
          style={{ borderRadius: 16 }}
        />
      </Section>

      {/* Top Performers */}
      <Section title="Top Performers" data={topPerformers} renderItem={(item) => `${item.tasks} tasks`} />

      {/* Upcoming Deadlines */}
      <Section title="Upcoming Deadlines" data={upcomingDeadlines} renderItem={(item) => item.due} />

      {/* Project Health */}
      <Section
        title="Project Health"
        data={projectHealth}
        renderItem={(item) => ({
          value: item.status,
          color:
            item.status === 'On Track' ? '#2ecc71' :
            item.status === 'At Risk' ? '#f1c40f' :
            '#e74c3c',
        })}
      />

      {/* Recent Activity */}
      <Section
        title="Recent Activity"
        data={recentActivity}
        renderItem={(item) => item.time}
        renderLabel={(item) => `${item.action} - ${item.user}`}
      />

      {/* Resource Utilization */}
      <Section
        title="Resource Utilization"
        data={resourceUtilization}
        renderItem={(item) => `${item.completed}/${item.assigned} done`}
      />

      {/* Custom Insights */}
      <Section
        title="Custom Insights"
        data={customInsights}
        renderItem={(item) => item.value}
        renderLabel={(item) => item.label}
      />
    </View>
  );
}

function Section({ title, data, renderItem, renderLabel }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {data && data.map((item, idx) => {
        const value = typeof renderItem === 'function'
          ? renderItem(item)
          : item.value || '';

        const label = typeof renderLabel === 'function'
          ? renderLabel(item)
          : item.name || item.title;

        const textColor = typeof value === 'object' ? value.color : '#366CD9';

        return (
          <View key={idx} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, { color: textColor }]}>{typeof value === 'object' ? value.value : value}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e6eaf3',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomColor: '#f2f2f2',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
});
