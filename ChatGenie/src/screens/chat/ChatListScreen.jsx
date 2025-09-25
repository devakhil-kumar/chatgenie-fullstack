import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from '@react-native-vector-icons/ionicons';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';

const {width} = Dimensions.get('window');

const ChatListScreen = ({navigation}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChats, setSelectedChats] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const scrollY = new Animated.Value(0);

  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);
  const {chats, loading} = useSelector(state => state.chat);

  const mockChats = [
    {
      id: 'chat_1',
      type: 'direct',
      name: 'Sarah Chen',
      avatar: null,
      lastMessage: {
        content: 'The presentation went amazing! <� Thanks for all your help',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        senderId: '1',
      },
      unreadCount: 2,
      isOnline: true,
      isPinned: true,
      isTyping: false,
      isMuted: false,
      isVerified: true,
    },
    {
      id: 'chat_2',
      type: 'direct',
      name: 'Alex Rivera',
      avatar: null,
      lastMessage: {
        content: 'Just saw your story! That place looks incredible =',
        timestamp: new Date(Date.now() - 480000).toISOString(),
        senderId: '2',
      },
      unreadCount: 0,
      isOnline: true,
      isPinned: false,
      isTyping: true,
      isMuted: false,
      isVerified: false,
    },
    {
      id: 'group_1',
      type: 'group',
      name: 'Design Team',
      emoji: '<�',
      avatar: null,
      participants: ['Emma', 'John', 'Lisa', 'Mike'],
      lastMessage: {
        content: 'Emma: The new mockups are ready for review',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        senderId: '3',
      },
      unreadCount: 12,
      isPinned: true,
      isTyping: false,
      isMuted: false,
      memberCount: 4,
    },
    {
      id: 'chat_3',
      type: 'direct',
      name: 'Mom',
      emoji: 'd',
      avatar: null,
      lastMessage: {
        content: 'Call me when you get a chance, honey',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        senderId: '4',
      },
      unreadCount: 1,
      isOnline: false,
      isPinned: false,
      isTyping: false,
      isMuted: false,
      isVerified: false,
    },
    {
      id: 'chat_4',
      type: 'direct',
      name: 'David Kim',
      avatar: null,
      lastMessage: {
        content: 'Perfect! See you at 3 PM tomorrow',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        senderId: 'me',
      },
      unreadCount: 0,
      isOnline: false,
      isPinned: false,
      isTyping: false,
      isMuted: false,
      isVerified: true,
    },
    {
      id: 'group_2',
      type: 'group',
      name: 'Weekend Squad',
      emoji: '<�',
      avatar: null,
      participants: ['Jake', 'Sophie', 'Tom', 'Anna', 'Chris'],
      lastMessage: {
        content: 'Jake: Who\'s up for hiking this Saturday?',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        senderId: '6',
      },
      unreadCount: 0,
      isPinned: false,
      isTyping: false,
      isMuted: true,
      memberCount: 5,
    },
    {
      id: 'chat_5',
      type: 'direct',
      name: 'Jessica Wong',
      avatar: null,
      lastMessage: {
        content: 'Thanks for the recommendation! =�',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        senderId: '7',
      },
      unreadCount: 0,
      isOnline: false,
      isPinned: false,
      isTyping: false,
      isMuted: false,
      isVerified: false,
    },
    {
      id: 'group_3',
      type: 'group',
      name: 'Study Group',
      emoji: '=�',
      avatar: null,
      participants: ['Mark', 'Lily', 'Ben'],
      lastMessage: {
        content: 'Mark: Quiz tomorrow at 2 PM, don\'t forget!',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        senderId: '8',
      },
      unreadCount: 3,
      isPinned: false,
      isTyping: false,
      isMuted: false,
      memberCount: 3,
    },
  ];

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const unpinnedChats = filteredChats.filter(chat => !chat.isPinned);
  const allSortedChats = [...pinnedChats, ...unpinnedChats];

  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#ffffff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTitle: () => (
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>{allSortedChats.length} conversations</Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Icon name="search" size={22} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Contacts')}
          >
            <Icon name="person-add" size={22} color="#6366f1" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, showSearch, allSortedChats.length]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleChatPress = (chat) => {
    if (selectedChats.length > 0) {
      handleSelectChat(chat);
      return;
    }

    if (chat.type === 'group') {
      navigation.navigate('GroupChat', {
        chatId: chat.id,
        chatName: chat.name,
        participants: chat.participants,
      });
    } else {
      navigation.navigate('Chat', {
        chatId: chat.id,
        chatName: chat.name,
      });
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChats(prev => {
      const isSelected = prev.find(c => c.id === chat.id);
      if (isSelected) {
        return prev.filter(c => c.id !== chat.id);
      } else {
        return [...prev, chat];
      }
    });
  };

  const handleLongPress = (chat) => {
    handleSelectChat(chat);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderChatItem = ({item: chat, index}) => {
    const isSelected = selectedChats.find(c => c.id === chat.id);
    const hasUnread = chat.unreadCount > 0;
    const isPinned = chat.isPinned && !searchQuery;

    return (
      <Animated.View
        style={[
          styles.chatItemWrapper,
          isPinned && styles.pinnedChatWrapper,
          {
            transform: [{
              scale: scrollY.interpolate({
                inputRange: [-1, 0, index * 84, (index + 2) * 84],
                outputRange: [1, 1, 1, 0.97],
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
            }],
            opacity: scrollY.interpolate({
              inputRange: [-1, 0, index * 84, (index + 4) * 84],
              outputRange: [1, 1, 1, 0.5],
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.chatItem,
            isSelected && styles.selectedChatItem,
            hasUnread && styles.unreadChatItem,
            isPinned && styles.pinnedChatItem
          ]}
          onPress={() => handleChatPress(chat)}
          onLongPress={() => handleLongPress(chat)}
          activeOpacity={0.7}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {chat.type === 'group' ? (
                <View style={styles.groupAvatarWrapper}>
                  <View style={[
                    styles.groupAvatar,
                    hasUnread && styles.unreadGroupAvatar,
                    isPinned && styles.pinnedGroupAvatar
                  ]}>
                    <Text style={[
                      styles.groupEmoji,
                      isPinned && styles.pinnedGroupEmoji
                    ]}>
                      {chat.emoji || '=e'}
                    </Text>
                  </View>
                  {chat.memberCount && (
                    <View style={[
                      styles.memberCountBadge,
                      isPinned && styles.pinnedMemberBadge
                    ]}>
                      <Text style={styles.memberCountText}>{chat.memberCount}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <Avatar
                  name={chat.name}
                  size={60}
                  showOnlineStatus={true}
                  isOnline={chat.isOnline}
                  style={[
                    styles.avatar,
                    hasUnread && styles.unreadAvatar,
                    isPinned && styles.pinnedAvatar
                  ]}
                />
              )}

              {/* Status Badges */}
              {isPinned && (
                <View style={styles.pinnedBadge}>
                  <Icon name="pin" size={10} color="#ff8c42" />
                </View>
              )}

              {chat.isVerified && chat.type === 'direct' && (
                <View style={styles.verifiedBadge}>
                  <Icon name="checkmark-circle" size={18} color="#0ea5e9" />
                </View>
              )}
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            <View style={styles.topRow}>
              <View style={styles.nameContainer}>
                <Text style={[
                  styles.chatName,
                  hasUnread && styles.unreadChatName,
                  isPinned && styles.pinnedChatName
                ]} numberOfLines={1}>
                  {chat.name}
                  {chat.emoji && chat.type === 'direct' && (
                    <Text style={styles.nameEmoji}> {chat.emoji}</Text>
                  )}
                </Text>
              </View>

              <View style={styles.metaContainer}>
                <View style={styles.metaRow}>
                  {chat.isMuted && (
                    <Icon name="volume-mute" size={14} color="#94a3b8" style={styles.mutedIcon} />
                  )}
                  <Text style={[
                    styles.timeText,
                    hasUnread && styles.unreadTimeText,
                    isPinned && styles.pinnedTimeText
                  ]}>
                    {formatTime(chat.lastMessage.timestamp)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.messageContainer}>
                {chat.isTyping ? (
                  <View style={styles.typingContainer}>
                    <View style={styles.typingIndicator}>
                      <View style={styles.typingDots}>
                        <Animated.View style={[styles.typingDot, styles.typingDot1]} />
                        <Animated.View style={[styles.typingDot, styles.typingDot2]} />
                        <Animated.View style={[styles.typingDot, styles.typingDot3]} />
                      </View>
                    </View>
                    <Text style={[
                      styles.typingText,
                      isPinned && styles.pinnedTypingText
                    ]}>typing...</Text>
                  </View>
                ) : (
                  <Text style={[
                    styles.lastMessage,
                    hasUnread && styles.unreadLastMessage,
                    isPinned && styles.pinnedLastMessage
                  ]} numberOfLines={1}>
                    {chat.lastMessage.senderId === 'me' && (
                      <Text style={[
                        styles.youPrefix,
                        isPinned && styles.pinnedYouPrefix
                      ]}>You: </Text>
                    )}
                    {chat.lastMessage.content}
                  </Text>
                )}
              </View>

              <View style={styles.rightSection}>
                {hasUnread ? (
                  <View style={[
                    styles.unreadBadge,
                    chat.unreadCount > 99 && styles.largeBadge,
                    isPinned && styles.pinnedUnreadBadge
                  ]}>
                    <Text style={styles.unreadCount}>
                      {chat.unreadCount > 999 ? '999+' : chat.unreadCount}
                    </Text>
                  </View>
                ) : (
                  chat.lastMessage.senderId === 'me' && (
                    <Icon
                      name="checkmark-done"
                      size={16}
                      color={isPinned ? "#10b981" : "#22c55e"}
                    />
                  )
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.selectionOverlay}>
            <Icon name="checkmark-circle" size={24} color="#6366f1" />
          </View>
        )}
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {showSearch && (
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search"
            style={styles.searchInput}
          />
        </View>
      )}

      {pinnedChats.length > 0 && !searchQuery && (
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Icon name="pin" size={16} color="#ff8c42" />
            <Text style={styles.sectionTitle}>Pinned Conversations</Text>
          </View>
          <Text style={styles.sectionCount}>{pinnedChats.length}</Text>
        </View>
      )}
    </View>
  );

  const renderSectionSeparator = () => {
    if (!searchQuery && pinnedChats.length > 0 && unpinnedChats.length > 0) {
      return (
        <View style={styles.sectionSeparator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>Recent Conversations</Text>
          <View style={styles.separatorLine} />
        </View>
      );
    }
    return null;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="chatbubbles-outline" size={80} color="#e2e8f0" />
      </View>
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Start chatting with friends and family
      </Text>
      <TouchableOpacity
        style={styles.startChatButton}
        onPress={() => navigation.navigate('Contacts')}
      >
        <Icon name="add" size={20} color="#fff" />
        <Text style={styles.startChatButtonText}>Start a Chat</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFloatingButton = () => (
    <View style={styles.fabContainer}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Contacts')}
        activeOpacity={0.8}
      >
        <Icon name="chatbubble" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  if (allSortedChats.length === 0 && !searchQuery) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        {renderHeader()}
        {renderEmptyState()}
      </View>
    );
  }

  const pinnedData = pinnedChats.map(chat => ({...chat, isPinnedSection: true}));
  const unpinnedData = unpinnedChats.map(chat => ({...chat, isPinnedSection: false}));
  const combinedData = [...pinnedData, ...(pinnedData.length > 0 && unpinnedData.length > 0 ? [{type: 'separator'}] : []), ...unpinnedData];

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <Animated.FlatList
        data={combinedData}
        keyExtractor={(item, index) => item.id || `separator-${index}`}
        renderItem={({item, index}) => {
          if (item.type === 'separator') {
            return renderSectionSeparator();
          }
          return renderChatItem({item, index});
        }}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />

      {renderFloatingButton()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    padding: 10,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
  },
  listHeader: {
    paddingBottom: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderWidth: 0,
    borderRadius: 25,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fef9f5',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ea580c',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ea580c',
    backgroundColor: '#fed7aa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#f8fafc',
    marginVertical: 8,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#e2e8f0',
    flex: 1,
  },
  separatorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  chatItemWrapper: {
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pinnedChatWrapper: {
    backgroundColor: '#fefbf3',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.12,
    elevation: 4,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
  },
  selectedChatItem: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  unreadChatItem: {
    backgroundColor: '#fefffe',
  },
  pinnedChatItem: {
    backgroundColor: '#fffbeb',
  },
  avatarSection: {
    marginRight: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  unreadAvatar: {
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  pinnedAvatar: {
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  groupAvatarWrapper: {
    position: 'relative',
  },
  groupAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  unreadGroupAvatar: {
    backgroundColor: '#eef2ff',
    borderWidth: 3,
    borderColor: '#6366f1',
  },
  pinnedGroupAvatar: {
    backgroundColor: '#fefbf3',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  groupEmoji: {
    fontSize: 26,
  },
  pinnedGroupEmoji: {
    fontSize: 28,
  },
  memberCountBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#64748b',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  pinnedMemberBadge: {
    backgroundColor: '#ea580c',
  },
  memberCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  pinnedBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  contentSection: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.3,
  },
  unreadChatName: {
    fontWeight: '800',
    color: '#111827',
  },
  pinnedChatName: {
    color: '#92400e',
    fontWeight: '800',
  },
  nameEmoji: {
    fontSize: 16,
  },
  metaContainer: {
    alignItems: 'flex-end',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutedIcon: {
    marginRight: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
  },
  unreadTimeText: {
    color: '#6366f1',
    fontWeight: '700',
  },
  pinnedTimeText: {
    color: '#ea580c',
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    marginRight: 12,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingIndicator: {
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6366f1',
    marginRight: 3,
  },
  typingDot1: {
    // Animation can be added later
  },
  typingDot2: {
    // Animation can be added later
  },
  typingDot3: {
    // Animation can be added later
  },
  typingText: {
    fontSize: 16,
    color: '#6366f1',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  pinnedTypingText: {
    color: '#ea580c',
  },
  lastMessage: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
  },
  unreadLastMessage: {
    color: '#374151',
    fontWeight: '600',
  },
  pinnedLastMessage: {
    color: '#78350f',
    fontWeight: '500',
  },
  youPrefix: {
    color: '#9ca3af',
    fontWeight: '600',
  },
  pinnedYouPrefix: {
    color: '#a16207',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  unreadBadge: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  pinnedUnreadBadge: {
    backgroundColor: '#ea580c',
    shadowColor: '#ea580c',
  },
  largeBadge: {
    borderRadius: 16,
    minWidth: 32,
    height: 32,
  },
  unreadCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIconContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 60,
    padding: 30,
    marginBottom: 32,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 32,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startChatButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 28,
    right: 28,
  },
  fab: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
});

export default ChatListScreen;