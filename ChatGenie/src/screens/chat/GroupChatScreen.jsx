import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  Modal,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from '@react-native-vector-icons/ionicons';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const GroupChatScreen = ({route, navigation}) => {
  const {chatId, chatName, participants} = route.params || {};
  const [message, setMessage] = useState('');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const flatListRef = useRef(null);
  const aiAnimatedValue = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();
  const {messages, aiSuggestions} = useSelector(state => state.chat);
  const {user} = useSelector(state => state.auth);

  const mockParticipants = participants || [
    {
      id: '1',
      name: 'Alice Johnson',
      avatar: null,
      isOnline: true,
      lastSeen: new Date(),
      role: 'admin',
    },
    {
      id: '2',
      name: 'Bob Smith',
      avatar: null,
      isOnline: true,
      lastSeen: new Date(),
      role: 'member',
    },
    {
      id: '3',
      name: 'Carol Williams',
      avatar: null,
      isOnline: false,
      lastSeen: new Date(Date.now() - 1800000),
      role: 'member',
    },
    {
      id: '4',
      name: 'David Brown',
      avatar: null,
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000),
      role: 'member',
    },
  ];

  const mockMessages = [
    {
      id: '1',
      senderId: '1',
      senderName: 'Alice Johnson',
      content: 'Hey everyone! Welcome to our project group 👋',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'read',
      type: 'text',
    },
    {
      id: '2',
      senderId: user?.id || 'me',
      senderName: user?.name || 'You',
      content: 'Thanks Alice! Excited to work with you all',
      timestamp: new Date(Date.now() - 6600000).toISOString(),
      status: 'read',
      type: 'text',
    },
    {
      id: '3',
      senderId: '2',
      senderName: 'Bob Smith',
      content: 'Should we set up a meeting for tomorrow?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'read',
      type: 'text',
    },
    {
      id: '4',
      senderId: '3',
      senderName: 'Carol Williams',
      content: 'I\'m free after 2 PM tomorrow',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'delivered',
      type: 'text',
    },
    {
      id: '5',
      senderId: user?.id || 'me',
      senderName: user?.name || 'You',
      content: '2:30 PM works for me too!',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: 'sent',
      type: 'text',
    },
  ];

  const mockAISuggestions = [
    {id: '1', content: 'That sounds like a great plan! 👍', tone: 'positive'},
    {id: '2', content: 'I can join the meeting as well.', tone: 'formal'},
    {id: '3', content: 'Perfect timing! See you all there 😊', tone: 'casual'},
  ];

  const onlineParticipants = mockParticipants.filter(p => p.isOnline);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerTitleContainer}
          onPress={() => setShowParticipants(true)}
        >
          <View style={styles.groupAvatarContainer}>
            {mockParticipants.slice(0, 2).map((participant, index) => (
              <Avatar
                key={participant.id}
                name={participant.name}
                size={28}
                style={[
                  styles.groupAvatar,
                  index > 0 && styles.groupAvatarOverlap
                ]}
              />
            ))}
            {mockParticipants.length > 2 && (
              <View style={[styles.groupAvatar, styles.groupAvatarOverlap, styles.moreAvatar]}>
                <Text style={styles.moreAvatarText}>+{mockParticipants.length - 2}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{chatName || 'Group Chat'}</Text>
            <Text style={styles.headerSubtitle}>
              {onlineParticipants.length} of {mockParticipants.length} online
            </Text>
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowParticipants(true)}
          >
            <Icon name="people" size={24} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="videocam" size={24} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => Alert.alert('Group Options', 'Group management options coming soon!')}
          >
            <Icon name="ellipsis-vertical" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, chatName]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        senderId: user?.id || 'me',
        senderName: user?.name || 'You',
        content: message.trim(),
        timestamp: new Date().toISOString(),
        status: 'sending',
        type: 'text',
      };

      setMessage('');
      setShowAISuggestions(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  };

  const handleAIToggle = () => {
    const toValue = showAISuggestions ? 0 : 1;
    setShowAISuggestions(!showAISuggestions);

    Animated.spring(aiAnimatedValue, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleAISuggestionPress = (suggestion) => {
    setMessage(suggestion.content);
    setShowAISuggestions(false);
    Animated.spring(aiAnimatedValue, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const getParticipantById = (id) => {
    return mockParticipants.find(p => p.id === id) || {name: 'Unknown User'};
  };

  const renderMessage = ({item, index}) => {
    const isMe = item.senderId === (user?.id || 'me');
    const participant = getParticipantById(item.senderId);
    const showAvatar = !isMe;
    const showSenderName = !isMe;

    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}>
        {showAvatar && (
          <Avatar
            name={participant.name}
            size={32}
            style={styles.messageAvatar}
          />
        )}

        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}>
          {showSenderName && (
            <Text style={styles.senderName}>{participant.name}</Text>
          )}

          <Text style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.otherMessageText,
          ]}>
            {item.content}
          </Text>

          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isMe ? styles.myMessageTime : styles.otherMessageTime,
            ]}>
              {formatTime(item.timestamp)}
            </Text>

            {isMe && (
              <Icon
                name={
                  item.status === 'read' ? 'checkmark-done' :
                  item.status === 'delivered' ? 'checkmark' :
                  item.status === 'sent' ? 'checkmark' : 'time'
                }
                size={16}
                color={item.status === 'read' ? '#6366f1' : '#9ca3af'}
                style={styles.messageStatus}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderAISuggestions = () => (
    <Animated.View style={[
      styles.aiSuggestionsContainer,
      {
        transform: [{
          translateY: aiAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [200, 0],
          }),
        }],
        opacity: aiAnimatedValue,
      },
    ]}>
      <View style={styles.aiHeader}>
        <Icon name="sparkles" size={20} color="#6366f1" />
        <Text style={styles.aiTitle}>AI Suggestions</Text>
        <TouchableOpacity onPress={handleAIToggle}>
          <Icon name="close" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockAISuggestions}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.aiSuggestionCard}
            onPress={() => handleAISuggestionPress(item)}>
            <Text style={styles.aiSuggestionText}>{item.content}</Text>
            <Text style={styles.aiSuggestionTone}>{item.tone}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.aiSuggestionsList}
      />
    </Animated.View>
  );

  const renderParticipantModal = () => (
    <Modal
      visible={showParticipants}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowParticipants(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Group Members</Text>
            <TouchableOpacity onPress={() => setShowParticipants(false)}>
              <Icon name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={mockParticipants}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <View style={styles.participantItem}>
                <Avatar
                  name={item.name}
                  size={45}
                  showOnlineStatus={true}
                  isOnline={item.isOnline}
                />

                <View style={styles.participantInfo}>
                  <View style={styles.participantHeader}>
                    <Text style={styles.participantName}>{item.name}</Text>
                    {item.role === 'admin' && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>Admin</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.participantStatus}>
                    {item.isOnline ? 'Online' : `Last seen ${formatTime(item.lastSeen)}`}
                  </Text>
                </View>

                <TouchableOpacity style={styles.participantAction}>
                  <Icon name="ellipsis-horizontal" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.modalActions}>
            <Button
              title="Add Member"
              leftIcon="person-add"
              variant="outline"
              style={styles.modalButton}
              onPress={() => {
                setShowParticipants(false);
                Alert.alert('Add Member', 'Add member functionality coming soon!');
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTypingIndicator = () => (
    showTypingIndicator && (
      <View style={styles.typingContainer}>
        <Avatar name="Alice Johnson" size={24} />
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>Alice is typing...</Text>
        </View>
      </View>
    )
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>

        <FlatList
          ref={flatListRef}
          data={mockMessages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated: true})}
        />

        {renderTypingIndicator()}

        {showAISuggestions && renderAISuggestions()}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton}>
              <Icon name="add" size={24} color="#6366f1" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Message..."
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={styles.aiButton}
              onPress={handleAIToggle}>
              <Icon
                name="sparkles"
                size={20}
                color={showAISuggestions ? '#6366f1' : '#9ca3af'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                message.trim() ? styles.sendButtonActive : null,
              ]}
              onPress={handleSend}
              disabled={!message.trim()}>
              <Icon
                name="send"
                size={20}
                color={message.trim() ? '#fff' : '#9ca3af'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {renderParticipantModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupAvatarOverlap: {
    marginLeft: -8,
  },
  moreAvatar: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAvatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#10b981',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#111827',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  myMessageTime: {
    color: '#e0e7ff',
  },
  otherMessageTime: {
    color: '#9ca3af',
  },
  messageStatus: {
    marginLeft: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  aiSuggestionsContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginLeft: 8,
  },
  aiSuggestionsList: {
    paddingHorizontal: 16,
  },
  aiSuggestionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 200,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aiSuggestionText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  aiSuggestionTone: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#111827',
  },
  aiButton: {
    padding: 8,
    marginLeft: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonActive: {
    backgroundColor: '#6366f1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  adminBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  participantStatus: {
    fontSize: 14,
    color: '#6b7280',
  },
  participantAction: {
    padding: 8,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalButton: {
    borderColor: '#6366f1',
  },
});

export default GroupChatScreen;