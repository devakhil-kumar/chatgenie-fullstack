import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Clipboard,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from '@react-native-vector-icons/ionicons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';

const ReferralScreen = ({navigation}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 12,
    pendingReferrals: 3,
    earnedCredits: 1200,
    totalEarnings: 240,
  });

  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);

  const referralCode = user?.referralCode || 'CHATGENIE123';
  const referralLink = `https://chatgenie.app/invite/${referralCode}`;

  const mockReferrals = [
    {
      id: '1',
      name: 'Alice Johnson',
      avatar: null,
      status: 'completed',
      joinedAt: '2 days ago',
      earned: 100,
    },
    {
      id: '2',
      name: 'Bob Smith',
      avatar: null,
      status: 'pending',
      joinedAt: '1 week ago',
      earned: 0,
    },
    {
      id: '3',
      name: 'Carol Williams',
      avatar: null,
      status: 'completed',
      joinedAt: '2 weeks ago',
      earned: 100,
    },
    {
      id: '4',
      name: 'David Brown',
      avatar: null,
      status: 'pending',
      joinedAt: '3 weeks ago',
      earned: 0,
    },
  ];

  const handleCopyCode = async () => {
    try {
      await Clipboard.setString(referralCode);
      setCopiedCode(true);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy referral code');
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setString(referralLink);
      Alert.alert('Copied!', 'Referral link copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy referral link');
    }
  };

  const handleShareCode = async () => {
    try {
      const shareOptions = {
        title: 'Join ChatGenie with my referral code!',
        message: `Hey! Join ChatGenie using my referral code: ${referralCode}\n\nDownload the app and start chatting with AI assistance!\n\n${referralLink}`,
        url: referralLink,
      };

      await Share.share(shareOptions);
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral code');
    }
  };

  const handleShareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `Hey! Join ChatGenie using my referral code: ${referralCode}\n\nDownload the app and start chatting with AI assistance!\n\n${referralLink}`
    );
    const url = `whatsapp://send?text=${message}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed');
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to open WhatsApp'));
  };

  const handleShareViaTelegram = () => {
    const message = encodeURIComponent(
      `Hey! Join ChatGenie using my referral code: ${referralCode}\n\nDownload the app: ${referralLink}`
    );
    const url = `tg://msg?text=${message}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Telegram is not installed');
        }
      })
      .catch(() => Alert.alert('Error', 'Failed to open Telegram'));
  };

  const handleShareViaSMS = () => {
    const message = encodeURIComponent(
      `Hey! Join ChatGenie using my referral code: ${referralCode}. Download: ${referralLink}`
    );
    const url = Platform.OS === 'ios'
      ? `sms:&body=${message}`
      : `sms:?body=${message}`;

    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Failed to open SMS')
    );
  };

  const renderStatCard = (title, value, subtitle, icon, color = '#6366f1') => (
    <Card style={styles.statCard}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, {backgroundColor: `${color}20`}]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </Card>
  );

  const renderReferralItem = (referral) => (
    <Card key={referral.id} style={styles.referralCard}>
      <View style={styles.referralItem}>
        <Avatar
          name={referral.name}
          size={45}
          source={referral.avatar ? {uri: referral.avatar} : null}
        />

        <View style={styles.referralInfo}>
          <Text style={styles.referralName}>{referral.name}</Text>
          <Text style={styles.referralJoined}>Joined {referral.joinedAt}</Text>
        </View>

        <View style={styles.referralStatus}>
          <View style={[
            styles.statusBadge,
            referral.status === 'completed' ? styles.completedBadge : styles.pendingBadge
          ]}>
            <Text style={[
              styles.statusText,
              referral.status === 'completed' ? styles.completedText : styles.pendingText
            ]}>
              {referral.status === 'completed' ? 'Completed' : 'Pending'}
            </Text>
          </View>

          {referral.earned > 0 && (
            <Text style={styles.earnedAmount}>+${referral.earned}</Text>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Refer Friends</Text>
          <Text style={styles.subtitle}>
            Earn rewards for every friend you invite to ChatGenie
          </Text>
        </View>

        {/* Referral Code Section */}
        <Card style={styles.codeSection}>
          <View style={styles.codeHeader}>
            <Icon name="gift" size={24} color="#6366f1" />
            <Text style={styles.codeTitle}>Your Referral Code</Text>
          </View>

          <View style={styles.codeContainer}>
            <Text style={styles.code}>{referralCode}</Text>
            <TouchableOpacity
              style={[styles.copyButton, copiedCode && styles.copiedButton]}
              onPress={handleCopyCode}
            >
              <Icon
                name={copiedCode ? 'checkmark' : 'copy'}
                size={16}
                color={copiedCode ? '#10b981' : '#6366f1'}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.codeDescription}>
            Share this code with friends to earn $10 for each successful referral
          </Text>
        </Card>

        {/* Share Options */}
        <Card style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share Your Code</Text>

          <View style={styles.shareButtons}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShareCode}>
              <Icon name="share-social" size={20} color="#6366f1" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={handleShareViaWhatsApp}>
              <Icon name="logo-whatsapp" size={20} color="#25d366" />
              <Text style={styles.shareButtonText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={handleShareViaTelegram}>
              <Icon name="paper-plane" size={20} color="#0088cc" />
              <Text style={styles.shareButtonText}>Telegram</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={handleShareViaSMS}>
              <Icon name="chatbox" size={20} color="#34d399" />
              <Text style={styles.shareButtonText}>SMS</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Copy Referral Link"
            onPress={handleCopyLink}
            variant="outline"
            style={styles.copyLinkButton}
            leftIcon="link"
          />
        </Card>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Referral Stats</Text>

          <View style={styles.statsGrid}>
            {renderStatCard(
              'Total Referrals',
              referralStats.totalReferrals.toString(),
              'All time',
              'people',
              '#6366f1'
            )}

            {renderStatCard(
              'Pending',
              referralStats.pendingReferrals.toString(),
              'Not completed yet',
              'hourglass',
              '#f59e0b'
            )}

            {renderStatCard(
              'Credits Earned',
              referralStats.earnedCredits.toString(),
              'Total credits',
              'diamond',
              '#10b981'
            )}

            {renderStatCard(
              'Total Earnings',
              `$${referralStats.totalEarnings}`,
              'Cash rewards',
              'wallet',
              '#ef4444'
            )}
          </View>
        </View>

        {/* Recent Referrals */}
        <View style={styles.referralsSection}>
          <View style={styles.referralsHeader}>
            <Text style={styles.sectionTitle}>Recent Referrals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ReferralHistory')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.referralsList}>
            {mockReferrals.map(renderReferralItem)}
          </View>
        </View>

        {/* How it Works */}
        <Card style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Share your referral code with friends</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>They sign up using your code</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>You both earn $10 when they complete their first chat</Text>
            </View>
          </View>
        </Card>

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
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  codeSection: {
    marginBottom: 20,
    padding: 20,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  code: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  copiedButton: {
    backgroundColor: '#dcfce7',
  },
  codeDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  shareSection: {
    marginBottom: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shareButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shareButtonText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
    fontWeight: '500',
  },
  copyLinkButton: {
    marginTop: 8,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    padding: 16,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  referralsSection: {
    marginBottom: 20,
  },
  referralsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  referralsList: {
    gap: 12,
  },
  referralCard: {
    padding: 16,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralInfo: {
    flex: 1,
    marginLeft: 12,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  referralJoined: {
    fontSize: 14,
    color: '#6b7280',
  },
  referralStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  completedText: {
    color: '#166534',
  },
  pendingText: {
    color: '#92400e',
  },
  earnedAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  howItWorksSection: {
    padding: 20,
  },
  stepsList: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
});

export default ReferralScreen;