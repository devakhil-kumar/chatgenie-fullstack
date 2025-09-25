import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import Icon from '@react-native-vector-icons/ionicons';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {logout} from '../../store/slices/authSlice';

const ProfileScreen = ({navigation}) => {
  const {user} = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Privacy, notifications, data usage',
      icon: 'settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      id: 'payment',
      title: 'Payments',
      subtitle: 'Payment methods and billing',
      icon: 'card',
      onPress: () => navigation.navigate('Payment'),
    },
    {
      id: 'premium',
      title: 'ChatGenie Premium',
      subtitle: 'Unlock premium features',
      icon: 'star',
      onPress: () => navigation.navigate('Premium'),
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIcon}>
          <Icon name={item.icon} size={20} color="#6366f1" />
        </View>
        <View style={styles.menuInfo}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Icon name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* User Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              name={user?.name || 'User'}
              size={80}
              style={styles.profileAvatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'John Doe'}</Text>
              <Text style={styles.profilePhone}>{user?.phone || '+1 234 567 8900'}</Text>
              <Text style={styles.profileStatus}>Available</Text>
            </View>
          </View>

          <Button
            title="Edit Profile"
            onPress={handleEditProfile}
            variant="outline"
            size="medium"
            leftIcon="create"
            style={styles.editButton}
          />
        </Card>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Chats</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Groups</Text>
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          {menuItems.map(renderMenuItem)}
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="destructive"
          size="large"
          leftIcon="log-out"
          style={styles.logoutButton}
        />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  profileCard: {
    padding: 20,
    marginBottom: 16,
    marginTop: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  statsCard: {
    padding: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  menuCard: {
    padding: 0,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 20,
  },
});

export default ProfileScreen;