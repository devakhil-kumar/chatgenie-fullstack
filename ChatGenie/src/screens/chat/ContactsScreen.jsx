import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SectionList,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from '@react-native-vector-icons/ionicons';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const ContactsScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showInviteSection, setShowInviteSection] = useState(true);

  const dispatch = useDispatch();
  const {contacts, loadingContacts} = useSelector(state => state.user);

  // Mock contacts data
  const mockContacts = [
    {
      id: '1',
      name: 'Alice Johnson',
      phone: '+1234567890',
      avatar: null,
      isRegistered: true,
      lastSeen: '2 minutes ago',
      status: 'Working on something amazing!',
    },
    {
      id: '2',
      name: 'Bob Smith',
      phone: '+1234567891',
      avatar: null,
      isRegistered: true,
      lastSeen: '5 minutes ago',
      status: 'Available',
    },
    {
      id: '3',
      name: 'Carol Williams',
      phone: '+1234567892',
      avatar: null,
      isRegistered: false,
      lastSeen: null,
      status: null,
    },
    {
      id: '4',
      name: 'David Brown',
      phone: '+1234567893',
      avatar: null,
      isRegistered: true,
      lastSeen: '1 hour ago',
      status: 'Busy',
    },
    {
      id: '5',
      name: 'Emma Davis',
      phone: '+1234567894',
      avatar: null,
      isRegistered: false,
      lastSeen: null,
      status: null,
    },
  ];

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const registeredContacts = filteredContacts.filter(contact => contact.isRegistered);
  const unregisteredContacts = filteredContacts.filter(contact => !contact.isRegistered);

  const sectionData = [
    ...(registeredContacts.length > 0 ? [{
      title: 'On ChatGenie',
      data: registeredContacts,
      type: 'registered'
    }] : []),
    ...(unregisteredContacts.length > 0 ? [{
      title: 'Invite to ChatGenie',
      data: unregisteredContacts,
      type: 'unregistered'
    }] : []),
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleContactPress = (contact) => {
    if (contact.isRegistered) {
      // Navigate to chat
      navigation.navigate('Chat', {
        chatId: `chat_${contact.id}`,
        chatName: contact.name,
      });
    } else {
      // Show invite options
      handleInviteContact(contact);
    }
  };

  const handleInviteContact = (contact) => {
    Alert.alert(
      'Invite Friend',
      `Invite ${contact.name} to join ChatGenie?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Send SMS', onPress: () => sendSMSInvite(contact)},
        {text: 'Share Link', onPress: () => shareInviteLink(contact)},
      ]
    );
  };

  const sendSMSInvite = (contact) => {
    Alert.alert('SMS Sent', `Invitation sent to ${contact.name}`);
  };

  const shareInviteLink = (contact) => {
    Alert.alert('Link Shared', `Invite link shared with ${contact.name}`);
  };

  const handleSelectContact = (contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.find(c => c.id === contact.id);
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const createGroupChat = () => {
    if (selectedContacts.length < 2) {
      Alert.alert('Error', 'Please select at least 2 contacts for a group chat');
      return;
    }

    Alert.alert(
      'Create Group',
      `Create group chat with ${selectedContacts.length} members?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Create', onPress: () => {
          setSelectedContacts([]);
          navigation.navigate('Chat', {
            chatId: `group_${Date.now()}`,
            chatName: 'New Group',
          });
        }},
      ]
    );
  };

  const renderSectionHeader = ({section}) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.type === 'registered' && (
        <Text style={styles.sectionCount}>{section.data.length}</Text>
      )}
    </View>
  );

  const renderContactItem = ({item, section}) => {
    const isSelected = selectedContacts.find(c => c.id === item.id);
    const isUnregistered = section.type === 'unregistered';

    return (
      <Card style={styles.contactCard} padding={false}>
        <TouchableOpacity
          style={styles.contactItem}
          onPress={() => handleContactPress(item)}
          onLongPress={() => !isUnregistered && handleSelectContact(item)}>

          <View style={styles.contactLeft}>
            <Avatar
              name={item.name}
              source={item.avatar ? {uri: item.avatar} : null}
              size={50}
              showOnlineStatus={item.isRegistered}
              isOnline={item.lastSeen && item.lastSeen.includes('minute')}
            />

            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              {item.isRegistered ? (
                <>
                  <Text style={styles.contactStatus} numberOfLines={1}>
                    {item.status || 'Available'}
                  </Text>
                  <Text style={styles.contactLastSeen}>
                    Last seen {item.lastSeen}
                  </Text>
                </>
              ) : (
                <Text style={styles.contactPhone}>{item.phone}</Text>
              )}
            </View>
          </View>

          <View style={styles.contactRight}>
            {isUnregistered ? (
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => handleInviteContact(item)}>
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            ) : (
              <>
                {isSelected && (
                  <Icon name="checkmark-circle" size={24} color="#6366f1" />
                )}
                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => Alert.alert('More Options', 'Contact options')}>
                  <Icon name="ellipsis-horizontal" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Input
        placeholder="Search contacts..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        leftIcon="search"
        style={styles.searchInput}
      />

      {selectedContacts.length > 0 && (
        <View style={styles.selectionActions}>
          <Text style={styles.selectionText}>
            {selectedContacts.length} selected
          </Text>
          <Button
            title="Create Group"
            onPress={createGroupChat}
            size="small"
            style={styles.createGroupButton}
          />
          <TouchableOpacity
            onPress={() => setSelectedContacts([])}
            style={styles.clearButton}>
            <Icon name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="qr-code" size={24} color="#6366f1" />
          <Text style={styles.quickActionText}>QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="person-add" size={24} color="#6366f1" />
          <Text style={styles.quickActionText}>Add Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton}>
          <Icon name="people" size={24} color="#6366f1" />
          <Text style={styles.quickActionText}>New Group</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sectionData}
        keyExtractor={item => item.id}
        renderItem={renderContactItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={80} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No contacts found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try adjusting your search'
                : 'Start by adding some contacts'}
            </Text>
          </View>
        }
      />

      {selectedContacts.length > 0 && (
        <View style={styles.floatingActions}>
          <TouchableOpacity
            style={styles.fab}
            onPress={createGroupChat}>
            <Icon name="people" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  selectionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  createGroupButton: {
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  sectionCount: {
    fontSize: 14,
    color: '#9ca3af',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  contactCard: {
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  contactStatus: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  contactLastSeen: {
    fontSize: 12,
    color: '#9ca3af',
  },
  contactPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  floatingActions: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default ContactsScreen;