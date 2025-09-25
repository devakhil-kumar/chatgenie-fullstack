import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from '@react-native-vector-icons/ionicons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {logout} from '../../store/slices/authSlice';

const SettingsScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);

  const [localSettings, setLocalSettings] = useState({
    darkMode: false,
    notifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    readReceipts: true,
    onlineStatus: true,
    lastSeen: true,
    profilePhoto: true,
    autoDownloadImages: true,
    autoDownloadVideos: false,
    dataCompression: true,
  });

  const handleToggleSetting = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    title,
    subtitle,
    value,
    onToggle,
    showSwitch = true,
    icon,
    onPress,
    showArrow = false,
    textColor = '#111827'
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !showSwitch}
    >
      <View style={styles.settingLeft}>
        {icon && (
          <View style={styles.settingIcon}>
            <Icon name={icon} size={20} color="#6366f1" />
          </View>
        )}
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, {color: textColor}]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.settingRight}>
        {showSwitch && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{false: '#e5e7eb', true: '#6366f1'}}
            thumbColor={value ? '#fff' : '#f9fafb'}
          />
        )}
        {showArrow && <Icon name="chevron-forward" size={20} color="#9ca3af" />}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.sectionCard}>
        {children}
      </Card>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {renderSection('Account', (
          <>
            {renderSettingItem(
              'Profile',
              'Edit your profile information',
              null,
              null,
              false,
              'person-circle',
              () => navigation.navigate('ProfileEdit'),
              true
            )}
            {renderSettingItem(
              'Privacy',
              'Manage your privacy settings',
              null,
              null,
              false,
              'shield-checkmark',
              () => Alert.alert('Privacy Settings', 'Privacy options coming soon!'),
              true
            )}
            {renderSettingItem(
              'Security',
              'Password, two-factor authentication',
              null,
              null,
              false,
              'lock-closed',
              () => Alert.alert('Security Settings', 'Security options coming soon!'),
              true
            )}
          </>
        ))}

        {renderSection('Appearance', (
          <>
            {renderSettingItem(
              'Dark Mode',
              'Switch between light and dark themes',
              localSettings.darkMode,
              (value) => handleToggleSetting('darkMode', value),
              true,
              'moon'
            )}
            {renderSettingItem(
              'Chat Wallpaper',
              'Customize chat background',
              null,
              null,
              false,
              'image',
              () => Alert.alert('Coming Soon', 'This feature will be available in a future update'),
              true
            )}
          </>
        ))}

        {renderSection('Notifications', (
          <>
            {renderSettingItem(
              'Enable Notifications',
              'Receive push notifications',
              localSettings.notifications,
              (value) => handleToggleSetting('notifications', value),
              true,
              'notifications'
            )}
            {renderSettingItem(
              'Sound',
              'Play sound for new messages',
              localSettings.soundEnabled,
              (value) => handleToggleSetting('soundEnabled', value),
              true,
              'volume-high'
            )}
            {renderSettingItem(
              'Vibration',
              'Vibrate for new messages',
              localSettings.vibrationEnabled,
              (value) => handleToggleSetting('vibrationEnabled', value),
              true,
              'phone-portrait'
            )}
          </>
        ))}

        {renderSection('Privacy', (
          <>
            {renderSettingItem(
              'Read Receipts',
              'Let others know when you read their messages',
              localSettings.readReceipts,
              (value) => handleToggleSetting('readReceipts', value),
              true,
              'checkmark-done'
            )}
            {renderSettingItem(
              'Online Status',
              'Show when you are online',
              localSettings.onlineStatus,
              (value) => handleToggleSetting('onlineStatus', value),
              true,
              'radio-button-on'
            )}
            {renderSettingItem(
              'Last Seen',
              'Show when you were last active',
              localSettings.lastSeen,
              (value) => handleToggleSetting('lastSeen', value),
              true,
              'time'
            )}
          </>
        ))}

        {renderSection('Data & Storage', (
          <>
            {renderSettingItem(
              'Auto-download Images',
              'Automatically download images in chats',
              localSettings.autoDownloadImages,
              (value) => handleToggleSetting('autoDownloadImages', value),
              true,
              'images'
            )}
            {renderSettingItem(
              'Auto-download Videos',
              'Automatically download videos in chats',
              localSettings.autoDownloadVideos,
              (value) => handleToggleSetting('autoDownloadVideos', value),
              true,
              'videocam'
            )}
            {renderSettingItem(
              'Data Compression',
              'Reduce data usage',
              localSettings.dataCompression,
              (value) => handleToggleSetting('dataCompression', value),
              true,
              'archive'
            )}
          </>
        ))}

        {renderSection('Support', (
          <>
            {renderSettingItem(
              'Help Center',
              'Get help and support',
              null,
              null,
              false,
              'help-circle',
              () => Alert.alert('Help Center', 'Help documentation coming soon!'),
              true
            )}
            {renderSettingItem(
              'Contact Us',
              'Send feedback or report issues',
              null,
              null,
              false,
              'mail',
              () => Alert.alert('Contact Us', 'Please email us at support@chatgenie.app'),
              true
            )}
            {renderSettingItem(
              'About',
              'App version and information',
              null,
              null,
              false,
              'information-circle',
              () => navigation.navigate('About'),
              true
            )}
          </>
        ))}

        <View style={styles.actionsSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="large"
            style={styles.logoutButton}
            leftIcon="log-out"
          />

          <Button
            title="Delete Account"
            onPress={handleDeleteAccount}
            variant="danger"
            size="large"
            style={styles.deleteButton}
            leftIcon="trash"
          />
        </View>

        <View style={styles.versionSection}>
          <Text style={styles.versionText}>ChatGenie v1.0.0</Text>
          <Text style={styles.versionSubtext}>© 2024 ChatGenie Inc.</Text>
        </View>

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
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsSection: {
    marginTop: 30,
    gap: 16,
  },
  logoutButton: {
    borderColor: '#ef4444',
  },
  deleteButton: {
    marginTop: 8,
  },
  versionSection: {
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 4,
  },
});

export default SettingsScreen;