import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from '@react-native-vector-icons/ionicons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import {updateUser} from '../../store/slices/authSlice';

const ProfileEditScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {user, loading} = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    bio: user?.bio || '',
    username: user?.username || '',
    website: user?.website || '',
    location: user?.location || '',
  });

  const [profileImage, setProfileImage] = useState(user?.avatar || null);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Profile Photo',
      'Choose how you would like to select a photo',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Take Photo', onPress: () => takePhoto()},
        {text: 'Choose from Gallery', onPress: () => chooseFromGallery()},
        {text: 'Remove Photo', onPress: () => removePhoto(), style: 'destructive'},
      ]
    );
  };

  const takePhoto = () => {
    Alert.alert('Take Photo', 'Camera functionality will be implemented with react-native-image-picker');
  };

  const chooseFromGallery = () => {
    Alert.alert('Choose from Gallery', 'Gallery functionality will be implemented with react-native-image-picker');
  };

  const removePhoto = () => {
    setProfileImage(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    setSaving(true);

    try {
      const updatedData = {
        ...formData,
        avatar: profileImage,
      };

      dispatch(updateUser(updatedData));

      Alert.alert('Success', 'Profile updated successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderFormSection = (title, children) => (
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

        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageContainer} onPress={handleImagePicker}>
            <Avatar
              name={formData.name || 'User'}
              source={profileImage ? {uri: profileImage} : null}
              size={120}
              style={styles.profileImage}
            />
            <View style={styles.imageOverlay}>
              <Icon name="camera" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.imageHint}>Tap to change photo</Text>
        </View>

        {/* Basic Information */}
        {renderFormSection('Basic Information', (
          <View style={styles.formContent}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              leftIcon="person"
              style={styles.input}
              required
            />

            <Input
              label="Username"
              placeholder="Choose a unique username"
              value={formData.username}
              onChangeText={(text) => handleInputChange('username', text.toLowerCase())}
              leftIcon="at"
              style={styles.input}
              autoCapitalize="none"
            />

            <Input
              label="Phone Number"
              placeholder="Your phone number"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              leftIcon="call"
              style={styles.input}
              keyboardType="phone-pad"
              required
              editable={false}
            />

            <Input
              label="Email Address"
              placeholder="your.email@example.com"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              leftIcon="mail"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        ))}

        {/* Additional Information */}
        {renderFormSection('Additional Information', (
          <View style={styles.formContent}>
            <Input
              label="Bio"
              placeholder="Tell others about yourself"
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              leftIcon="document-text"
              style={styles.input}
              multiline
              numberOfLines={3}
              maxLength={150}
            />

            <Input
              label="Website"
              placeholder="https://yourwebsite.com"
              value={formData.website}
              onChangeText={(text) => handleInputChange('website', text)}
              leftIcon="globe"
              style={styles.input}
              keyboardType="url"
              autoCapitalize="none"
            />

            <Input
              label="Location"
              placeholder="Your city, country"
              value={formData.location}
              onChangeText={(text) => handleInputChange('location', text)}
              leftIcon="location"
              style={styles.input}
            />
          </View>
        ))}

        {/* Privacy Options */}
        {renderFormSection('Privacy', (
          <View style={styles.privacySection}>
            <TouchableOpacity style={styles.privacyItem}>
              <View style={styles.privacyLeft}>
                <Icon name="eye" size={20} color="#6366f1" />
                <Text style={styles.privacyTitle}>Who can see my profile</Text>
              </View>
              <View style={styles.privacyRight}>
                <Text style={styles.privacyValue}>Everyone</Text>
                <Icon name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.privacyItem}>
              <View style={styles.privacyLeft}>
                <Icon name="call" size={20} color="#6366f1" />
                <Text style={styles.privacyTitle}>Who can call me</Text>
              </View>
              <View style={styles.privacyRight}>
                <Text style={styles.privacyValue}>Contacts</Text>
                <Icon name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.privacyItem}>
              <View style={styles.privacyLeft}>
                <Icon name="chatbubble" size={20} color="#6366f1" />
                <Text style={styles.privacyTitle}>Who can message me</Text>
              </View>
              <View style={styles.privacyRight}>
                <Text style={styles.privacyValue}>Everyone</Text>
                <Icon name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          </View>
        ))}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            size="large"
            style={styles.saveButton}
            leftIcon="checkmark"
          />

          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            size="large"
            style={styles.cancelButton}
          />
        </View>

        {/* Account Actions */}
        <View style={styles.accountActions}>
          <TouchableOpacity
            style={styles.accountAction}
            onPress={() => Alert.alert('Change Password', 'Password change functionality coming soon!')}
          >
            <Icon name="lock-closed" size={20} color="#6366f1" />
            <Text style={styles.accountActionText}>Change Password</Text>
            <Icon name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.accountAction}
            onPress={() => Alert.alert('Two-Factor Authentication', '2FA setup coming soon!')}
          >
            <Icon name="shield-checkmark" size={20} color="#6366f1" />
            <Text style={styles.accountActionText}>Two-Factor Authentication</Text>
            <Icon name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.accountAction, styles.dangerAction]}
            onPress={() => Alert.alert('Deactivate Account', 'Account deactivation functionality coming soon!')}
          >
            <Icon name="pause-circle" size={20} color="#ef4444" />
            <Text style={[styles.accountActionText, styles.dangerText]}>Deactivate Account</Text>
            <Icon name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
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
  imageSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  imageHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    padding: 0,
  },
  formContent: {
    padding: 20,
    gap: 16,
  },
  input: {
    marginBottom: 0,
  },
  privacySection: {
    paddingVertical: 8,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  privacyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
  },
  privacyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyValue: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  cancelButton: {
    borderColor: '#d1d5db',
  },
  accountActions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  accountAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  accountActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  dangerAction: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#ef4444',
  },
});

export default ProfileEditScreen;