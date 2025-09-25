import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';

const ReferralHistoryScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('all');

  const mockReferrals = [
    {
      id: '1',
      name: 'Alice Johnson',
      avatar: null,
      status: 'completed',
      joinedAt: '2024-10-15',
      completedAt: '2024-10-16',
      earned: 100,
      referralCode: 'ALICE123',
    },
    {
      id: '2',
      name: 'Bob Smith',
      avatar: null,
      status: 'pending',
      joinedAt: '2024-10-10',
      completedAt: null,
      earned: 0,
      referralCode: 'BOB456',
    },
    {
      id: '3',
      name: 'Carol Williams',
      avatar: null,
      status: 'completed',
      joinedAt: '2024-10-05',
      completedAt: '2024-10-07',
      earned: 100,
      referralCode: 'CAROL789',
    },
    {
      id: '4',
      name: 'David Brown',
      avatar: null,
      status: 'pending',
      joinedAt: '2024-09-28',
      completedAt: null,
      earned: 0,
      referralCode: 'DAVID012',
    },
    {
      id: '5',
      name: 'Emma Davis',
      avatar: null,
      status: 'expired',
      joinedAt: '2024-09-15',
      completedAt: null,
      earned: 0,
      referralCode: 'EMMA345',
    },
    {
      id: '6',
      name: 'Frank Miller',
      avatar: null,
      status: 'completed',
      joinedAt: '2024-09-10',
      completedAt: '2024-09-12',
      earned: 100,
      referralCode: 'FRANK678',
    },
  ];

  const filteredReferrals = mockReferrals.filter(referral => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return referral.status === 'completed';
    if (activeTab === 'pending') return referral.status === 'pending';
    if (activeTab === 'expired') return referral.status === 'expired';
    return true;
  });

  const totalStats = {
    all: mockReferrals.length,
    completed: mockReferrals.filter(r => r.status === 'completed').length,
    pending: mockReferrals.filter(r => r.status === 'pending').length,
    expired: mockReferrals.filter(r => r.status === 'expired').length,
  };

  const renderTabButton = (tab, title, count) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
      <View style={[styles.tabBadge, activeTab === tab && styles.activeTabBadge]}>
        <Text style={[styles.tabBadgeText, activeTab === tab && styles.activeTabBadgeText]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'expired':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'pending':
        return 'hourglass';
      case 'expired':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderReferralItem = ({item}) => (
    <Card style={styles.referralCard}>
      <View style={styles.referralHeader}>
        <View style={styles.referralLeft}>
          <Avatar
            name={item.name}
            size={50}
            source={item.avatar ? {uri: item.avatar} : null}
          />
          <View style={styles.referralInfo}>
            <Text style={styles.referralName}>{item.name}</Text>
            <Text style={styles.referralCode}>Code: {item.referralCode}</Text>
          </View>
        </View>

        <View style={styles.referralRight}>
          <View style={[styles.statusIndicator, {backgroundColor: getStatusColor(item.status)}]}>
            <Icon name={getStatusIcon(item.status)} size={16} color="#fff" />
          </View>
        </View>
      </View>

      <View style={styles.referralDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Joined:</Text>
          <Text style={styles.detailValue}>{formatDate(item.joinedAt)}</Text>
        </View>

        {item.completedAt && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Completed:</Text>
            <Text style={styles.detailValue}>{formatDate(item.completedAt)}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text style={[styles.detailValue, {color: getStatusColor(item.status)}]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Earned:</Text>
          <Text style={[styles.detailValue, styles.earnedAmount]}>
            ${item.earned}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Referral Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalStats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalStats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalStats.expired}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              ${mockReferrals.reduce((sum, r) => sum + r.earned, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </View>
      </Card>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            {renderTabButton('all', 'All', totalStats.all)}
            {renderTabButton('completed', 'Completed', totalStats.completed)}
            {renderTabButton('pending', 'Pending', totalStats.pending)}
            {renderTabButton('expired', 'Expired', totalStats.expired)}
          </View>
        </ScrollView>
      </View>

      {/* Referrals List */}
      <FlatList
        data={filteredReferrals}
        keyExtractor={(item) => item.id}
        renderItem={renderReferralItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="people-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No referrals found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all'
                ? 'Start referring friends to see them here'
                : `No ${activeTab} referrals yet`
              }
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  statsCard: {
    margin: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeTabButton: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginRight: 6,
  },
  activeTabText: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabBadgeText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  referralCard: {
    marginBottom: 12,
    padding: 16,
  },
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  referralLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  referralInfo: {
    marginLeft: 12,
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  referralCode: {
    fontSize: 14,
    color: '#6b7280',
  },
  referralRight: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  referralDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  earnedAmount: {
    color: '#10b981',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ReferralHistoryScreen;