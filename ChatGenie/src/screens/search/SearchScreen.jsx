import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from '@react-native-vector-icons/ionicons';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const SearchScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'messages', 'contacts', 'groups'
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'Alice Johnson',
    'project meeting',
    'Group chat setup',
    'Bob Smith',
  ]);

  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);

  const mockSearchResults = {
    contacts: [
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
        name: 'Alice Cooper',
        phone: '+1234567891',
        avatar: null,
        isRegistered: true,
        lastSeen: '1 hour ago',
        status: 'Available',
      },
    ],
    messages: [
      {
        id: '1',
        chatId: 'chat_1',
        chatName: 'Alice Johnson',
        content: 'Hey! How are you doing today? I wanted to discuss the project.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        senderId: '1',
        senderName: 'Alice Johnson',
        snippet: 'Hey! How are you doing today? I wanted to...',
      },
      {
        id: '2',
        chatId: 'group_1',
        chatName: 'Project Team',
        content: 'Alice mentioned that we should schedule a meeting for next week.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        senderId: 'me',
        senderName: 'You',
        snippet: 'Alice mentioned that we should schedule...',
      },
      {
        id: '3',
        chatId: 'chat_1',
        chatName: 'Alice Johnson',
        content: 'The meeting went well. Alice was very helpful with the presentation.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        senderId: 'me',
        senderName: 'You',
        snippet: 'The meeting went well. Alice was very...',
      },
    ],
    groups: [
      {
        id: 'group_1',
        name: 'Project Team',
        description: 'Main project discussion group',
        participants: ['Alice Johnson', 'Bob Smith', 'Carol Williams'],
        lastMessage: 'Alice: Great work everyone!',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchType]);

  const performSearch = async (query) => {
    setIsSearching(true);

    setTimeout(() => {
      const results = [];

      if (searchType === 'all' || searchType === 'contacts') {
        const filteredContacts = mockSearchResults.contacts.filter(contact =>
          contact.name.toLowerCase().includes(query.toLowerCase()) ||
          contact.phone.includes(query)
        );
        if (filteredContacts.length > 0) {
          results.push({
            title: 'Contacts',
            data: filteredContacts,
            type: 'contacts'
          });
        }
      }

      if (searchType === 'all' || searchType === 'messages') {
        const filteredMessages = mockSearchResults.messages.filter(message =>
          message.content.toLowerCase().includes(query.toLowerCase()) ||
          message.chatName.toLowerCase().includes(query.toLowerCase()) ||
          message.senderName.toLowerCase().includes(query.toLowerCase())
        );
        if (filteredMessages.length > 0) {
          results.push({
            title: 'Messages',
            data: filteredMessages,
            type: 'messages'
          });
        }
      }

      if (searchType === 'all' || searchType === 'groups') {
        const filteredGroups = mockSearchResults.groups.filter(group =>
          group.name.toLowerCase().includes(query.toLowerCase()) ||
          group.description.toLowerCase().includes(query.toLowerCase())
        );
        if (filteredGroups.length > 0) {
          results.push({
            title: 'Groups',
            data: filteredGroups,
            type: 'groups'
          });
        }
      }

      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
  };

  const handleRecentSearchPress = (query) => {
    setSearchQuery(query);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
  };

  const handleContactPress = (contact) => {
    navigation.navigate('Chat', {
      chatId: `chat_${contact.id}`,
      chatName: contact.name,
    });
  };

  const handleMessagePress = (message) => {
    navigation.navigate('Chat', {
      chatId: message.chatId,
      chatName: message.chatName,
    });
  };

  const handleGroupPress = (group) => {
    navigation.navigate('GroupChat', {
      chatId: group.id,
      chatName: group.name,
      participants: group.participants,
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes > 0 ? `${diffInMinutes}m ago` : 'Now';
    }
  };

  const highlightSearchTerm = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <Text key={index} style={styles.highlightedText}>{part}</Text>;
      }
      return part;
    });
  };

  const renderSearchFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          {key: 'all', label: 'All', icon: 'search'},
          {key: 'messages', label: 'Messages', icon: 'chatbubble'},
          {key: 'contacts', label: 'Contacts', icon: 'people'},
          {key: 'groups', label: 'Groups', icon: 'people-circle'},
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              searchType === filter.key && styles.filterButtonActive
            ]}
            onPress={() => handleSearchTypeChange(filter.key)}
          >
            <Icon
              name={filter.icon}
              size={16}
              color={searchType === filter.key ? '#fff' : '#6366f1'}
            />
            <Text style={[
              styles.filterButtonText,
              searchType === filter.key && styles.filterButtonTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSectionHeader = ({section}) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderItem = ({item, section}) => {
    switch (section.type) {
      case 'contacts':
        return (
          <Card style={styles.resultCard}>
            <TouchableOpacity
              style={styles.contactResult}
              onPress={() => handleContactPress(item)}
            >
              <Avatar
                name={item.name}
                size={45}
                showOnlineStatus={item.isRegistered}
                isOnline={item.lastSeen && item.lastSeen.includes('minute')}
              />

              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {highlightSearchTerm(item.name, searchQuery)}
                </Text>
                <Text style={styles.contactStatus} numberOfLines={1}>
                  {item.status || 'Available'}
                </Text>
                <Text style={styles.contactLastSeen}>
                  Last seen {item.lastSeen}
                </Text>
              </View>

              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Card>
        );

      case 'messages':
        return (
          <Card style={styles.resultCard}>
            <TouchableOpacity
              style={styles.messageResult}
              onPress={() => handleMessagePress(item)}
            >
              <Avatar name={item.chatName} size={45} />

              <View style={styles.messageInfo}>
                <View style={styles.messageHeader}>
                  <Text style={styles.messageChatName} numberOfLines={1}>
                    {highlightSearchTerm(item.chatName, searchQuery)}
                  </Text>
                  <Text style={styles.messageTime}>
                    {formatTime(item.timestamp)}
                  </Text>
                </View>

                <Text style={styles.messageSnippet} numberOfLines={2}>
                  <Text style={styles.messageSender}>
                    {item.senderName === 'You' ? 'You: ' : `${item.senderName}: `}
                  </Text>
                  {highlightSearchTerm(item.snippet, searchQuery)}
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        );

      case 'groups':
        return (
          <Card style={styles.resultCard}>
            <TouchableOpacity
              style={styles.groupResult}
              onPress={() => handleGroupPress(item)}
            >
              <View style={styles.groupAvatar}>
                <Icon name="people" size={24} color="#6366f1" />
              </View>

              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>
                  {highlightSearchTerm(item.name, searchQuery)}
                </Text>
                <Text style={styles.groupDescription} numberOfLines={1}>
                  {item.description}
                </Text>
                <Text style={styles.groupParticipants}>
                  {item.participants.length} members
                </Text>
              </View>

              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderRecentSearches = () => (
    recentSearches.length > 0 && (
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          <TouchableOpacity onPress={handleClearRecentSearches}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentList}>
          {recentSearches.map((query, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentItem}
              onPress={() => handleRecentSearchPress(query)}
            >
              <Icon name="time" size={16} color="#9ca3af" />
              <Text style={styles.recentQuery}>{query}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search" size={80} color="#d1d5db" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No results found' : 'Search messages, contacts, and groups'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try adjusting your search terms'
          : 'Start typing to search across all your conversations'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <Input
          placeholder="Search messages, contacts, groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          style={styles.searchInput}
          autoFocus={true}
        />
      </View>

      {renderSearchFilter()}

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : searchQuery.length > 0 ? (
        searchResults.length > 0 ? (
          <SectionList
            sections={searchResults}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState()
        )
      ) : (
        <ScrollView contentContainerStyle={styles.defaultContent}>
          {renderRecentSearches()}
          {renderEmptyState()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    marginBottom: 0,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6366f1',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    paddingVertical: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  resultCard: {
    marginBottom: 8,
    padding: 0,
  },
  contactResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
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
  messageResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  messageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageChatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  messageSnippet: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  messageSender: {
    fontWeight: '500',
    color: '#374151',
  },
  groupResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  groupAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  groupParticipants: {
    fontSize: 12,
    color: '#9ca3af',
  },
  highlightedText: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    fontWeight: '600',
  },
  defaultContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  recentSection: {
    marginBottom: 30,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  clearButton: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recentQuery: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});

export default SearchScreen;