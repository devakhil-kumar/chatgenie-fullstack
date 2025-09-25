import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/ionicons';

import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import GroupChatScreen from '../screens/chat/GroupChatScreen';
import ContactsScreen from '../screens/chat/ContactsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import ReferralScreen from '../screens/profile/ReferralScreen';
import ReferralHistoryScreen from '../screens/profile/ReferralHistoryScreen';
import PaymentScreen from '../screens/payments/PaymentScreen';
import PremiumScreen from '../screens/payments/PremiumScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ChatStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          title: 'Chats',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({route}) => ({
          title: route.params?.chatName || 'Chat',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        })}
      />
      <Stack.Screen
        name="GroupChat"
        component={GroupChatScreen}
        options={({route}) => ({
          title: route.params?.groupName || 'Group Chat',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        })}
      />
      <Stack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          title: 'Contacts',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{
          title: 'Edit Profile',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'About',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          title: 'Payments',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{
          title: 'Premium',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

const ReferralStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ReferralMain"
        component={ReferralScreen}
        options={{
          title: 'Referrals',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="ReferralHistory"
        component={ReferralHistoryScreen}
        options={{
          title: 'Referral History',
          headerStyle: {backgroundColor: '#6366f1'},
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          switch (route.name) {
            case 'Chats':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Referral':
              iconName = focused ? 'share' : 'share-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        headerShown: false,
      })}>
      <Tab.Screen name="Chats" component={ChatStackNavigator} />
      <Tab.Screen
        name="Referral"
        component={ReferralStackNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

export default MainNavigator;