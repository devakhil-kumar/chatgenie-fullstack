import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';

const AboutScreen = ({navigation}) => {
  const appVersion = '1.0.0';
  const buildNumber = '100';
  const releaseDate = 'October 2024';

  const handleEmailSupport = () => {
    const email = 'support@chatgenie.app';
    const subject = 'ChatGenie Support Request';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Email app not available');
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to open email app'));
  };

  const handleOpenWebsite = () => {
    const url = 'https://chatgenie.app';

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open website');
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to open website'));
  };

  const handleOpenPrivacyPolicy = () => {
    const url = 'https://chatgenie.app/privacy';

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Privacy Policy', 'Privacy policy will be available on our website at chatgenie.app/privacy');
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to open privacy policy'));
  };

  const handleOpenTerms = () => {
    const url = 'https://chatgenie.app/terms';

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Terms of Service', 'Terms of service will be available on our website at chatgenie.app/terms');
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to open terms of service'));
  };

  const handleRateApp = () => {
    Alert.alert('Rate ChatGenie', 'Thank you for your interest in rating our app! Rating functionality will be available when the app is published to the App Store and Google Play.');
  };

  const handleShareApp = () => {
    Alert.alert('Share ChatGenie', 'App sharing functionality will be available when the app is published.');
  };

  const renderInfoItem = (title, value, icon) => (
    <View style={styles.infoItem}>
      <View style={styles.infoLeft}>
        <Icon name={icon} size={20} color="#6366f1" />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const renderLinkItem = (title, subtitle, icon, onPress, showArrow = true) => (
    <TouchableOpacity style={styles.linkItem} onPress={onPress}>
      <View style={styles.linkLeft}>
        <View style={styles.linkIcon}>
          <Icon name={icon} size={20} color="#6366f1" />
        </View>
        <View style={styles.linkInfo}>
          <Text style={styles.linkTitle}>{title}</Text>
          {subtitle && <Text style={styles.linkSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Icon name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* App Header */}
        <View style={styles.header}>
          <Logo size={80} style={styles.logo} />
          <Text style={styles.appName}>ChatGenie</Text>
          <Text style={styles.appTagline}>AI-powered conversations</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
        </View>

        {/* App Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>App Information</Text>

          {renderInfoItem('Version', appVersion, 'information-circle')}
          {renderInfoItem('Build', buildNumber, 'construct')}
          {renderInfoItem('Release Date', releaseDate, 'calendar')}
          {renderInfoItem('Developer', 'ChatGenie Inc.', 'business')}
          {renderInfoItem('Platform', 'React Native', 'phone-portrait')}
        </Card>

        {/* Features */}
        <Card style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>Key Features</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Icon name="sparkles" size={24} color="#6366f1" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>AI-Powered Suggestions</Text>
                <Text style={styles.featureDescription}>Get smart reply suggestions with different tones</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Icon name="chatbubbles" size={24} color="#6366f1" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Real-time Messaging</Text>
                <Text style={styles.featureDescription}>Instant messaging with read receipts and typing indicators</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Icon name="people" size={24} color="#6366f1" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Group Chats</Text>
                <Text style={styles.featureDescription}>Create and manage group conversations</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Icon name="shield-checkmark" size={24} color="#6366f1" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Privacy Focused</Text>
                <Text style={styles.featureDescription}>End-to-end encryption and privacy controls</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Links */}
        <Card style={styles.linksCard}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>

          {renderLinkItem(
            'Website',
            'Visit our official website',
            'globe',
            handleOpenWebsite
          )}

          {renderLinkItem(
            'Contact Support',
            'Get help with the app',
            'mail',
            handleEmailSupport
          )}

          {renderLinkItem(
            'Privacy Policy',
            'How we handle your data',
            'shield-checkmark',
            handleOpenPrivacyPolicy
          )}

          {renderLinkItem(
            'Terms of Service',
            'Terms and conditions',
            'document-text',
            handleOpenTerms
          )}
        </Card>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Rate ChatGenie"
            onPress={handleRateApp}
            variant="outline"
            size="large"
            leftIcon="star"
            style={styles.actionButton}
          />

          <Button
            title="Share App"
            onPress={handleShareApp}
            variant="outline"
            size="large"
            leftIcon="share-social"
            style={styles.actionButton}
          />
        </View>

        {/* Credits */}
        <View style={styles.creditsSection}>
          <Text style={styles.creditsTitle}>Credits</Text>

          <View style={styles.creditsList}>
            <Text style={styles.creditItem}>• React Native Community</Text>
            <Text style={styles.creditItem}>• Ionicons by Ionic</Text>
            <Text style={styles.creditItem}>• Redux Toolkit</Text>
            <Text style={styles.creditItem}>• React Navigation</Text>
            <Text style={styles.creditItem}>• Socket.IO</Text>
            <Text style={styles.creditItem}>• OpenAI API</Text>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>© 2024 ChatGenie Inc.</Text>
          <Text style={styles.copyrightText}>All rights reserved.</Text>
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
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logo: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: '#9ca3af',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  infoCard: {
    padding: 20,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  featuresCard: {
    padding: 20,
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureText: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  linksCard: {
    padding: 0,
    marginBottom: 16,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsSection: {
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    borderColor: '#d1d5db',
  },
  creditsSection: {
    marginBottom: 20,
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  creditsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  creditItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default AboutScreen;