import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddConnectionScreen from 'screens/AddConnectionScreen';
import ConnectionDetailsScreen from 'screens/ConnectionDetailsModal';
import ConnectionsScreen from 'screens/ConnectionsScreen';
import MyTasksScreen from 'screens/MyTasksScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PinLoginScreen from '../screens/PinLoginScreen';
import ProfessionalDashboard from '../screens/ProfessionalDashboard';
import ProjectDetailsScreen from '../screens/ProjectDetailsScreen';
import ProjectScreen from '../screens/ProjectScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import UpdateProjectScreen from '../screens/UpdateProjectScreen';
import TaskListScreen from '../screens/TaskListScreen';
import WorklistScreen from '../screens/WorklistScreen';
import UserProfileScreen from 'screens/UserProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import IssuesScreen from '../screens/IssuesScreen';
import ProjectIssuesScreen from '../screens/ProjectIssuesScreen';
import IssueDetailsScreen from 'screens/IssueDetailsScreen';
import NotificationScreen from 'screens/NotificationScreen';
import AuthLoadingScreen from 'screens/AuthLoadingScreen';
import UpdateTaskScreen from 'screens/UpdateTaskScreen';
import RegistrationForm from 'screens/RegistrationForm';
import { navigationRef } from './navigationRef';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PinLogin" component={PinLoginScreen} />
        <Stack.Screen name="RegistrationForm" component={RegistrationForm} />
        <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        <Stack.Screen name="ProfessionalDashboard" component={ProfessionalDashboard} />
        <Stack.Screen name="ProjectScreen" component={ProjectScreen} />
        <Stack.Screen name="ProjectDetailsScreen" component={ProjectDetailsScreen} />
        <Stack.Screen name="UpdateProjectScreen" component={UpdateProjectScreen} />
        <Stack.Screen name="WorklistScreen" component={WorklistScreen} />
        <Stack.Screen name="TaskListScreen" component={TaskListScreen} />
        <Stack.Screen name="MyTasksScreen" component={MyTasksScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddConnectionScreen" component={AddConnectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ConnectionDetailsScreen" component={ConnectionDetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ConnectionsScreen" component={ConnectionsScreen} />
        <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="IssuesScreen" component={IssuesScreen} />
        <Stack.Screen name="ProjectIssuesScreen" component={ProjectIssuesScreen} />
        <Stack.Screen name="IssueDetails" component={IssueDetailsScreen} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        <Stack.Screen name="UpdateTaskScreen" component={UpdateTaskScreen} options={{ title: 'Update Task' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}