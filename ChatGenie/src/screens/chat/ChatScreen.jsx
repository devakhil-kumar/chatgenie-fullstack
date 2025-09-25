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
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Icon from '@react-native-vector-icons/ionicons';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';

const ChatScreen = ({route, navigation}) => {
  const {chatId, chatName} = route.params || {};
  const [message, setMessage] = useState('');
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const flatListRef = useRef(null);
  const aiAnimatedValue = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();
  const {messages, aiSuggestions, loadingAISuggestions} = useSelector(state => state.chat);
  const {user} = useSelector(state => state.auth);

  // Mock messages for demo
  const mockMessages = [
    {
      id: '1',
      senderId: 'other',
      content: 'Hey! How are you doing today?',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'read',
      type: 'text',
    },
    {
      id: '2',
      senderId: user?.id || 'me',
      content: 'I\'m doing great! Just working on some exciting projects.',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      status: 'read',
      type: 'text',
    },
    {
      id: '3',
      senderId: 'other',
      content: 'That sounds awesome! What kind of projects?',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      status: 'read',
      type: 'text',
    },
    {
      id: '4',
      senderId: user?.id || 'me',
      content: 'I\'m building a chat app with AI assistance! 🤖',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'delivered',
      type: 'text',
    },
  ];

  const mockAISuggestions = [
    {id: '1', content: 'That sounds really exciting! 🚀', tone: 'casual'},
    {id: '2', content: 'Wow, AI-powered chat is the future!', tone: 'formal'},
    {id: '3', content: 'Haha, chatbots taking over the world! 😄', tone: 'funny'},
  ];

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity style={styles.headerTitleContainer}>
          {/* <Avatar
            name={chatName}
            size={35}
            showOnlineStatus
            isOnline={true}
          /> */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{chatName}</Text>
            <Text style={styles.headerSubtitle}>online</Text>
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="videocam" size={24} color="#ececefff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="call" size={24} color="#ececefff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="ellipsis-vertical" size={24} color="#ececefff" />
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
        content: message.trim(),
        timestamp: new Date().toISOString(),
        status: 'sending',
        type: 'text',
      };

      // Add message logic here
      setMessage('');
      setShowAISuggestions(false);

      // Auto-scroll to bottom
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

  const renderMessage = ({item, index}) => {
    const isMe = item.senderId === (user?.id || 'me');
    const isLastMessage = index === mockMessages.length - 1;

    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}>
        {!isMe && (
          <Avatar name={chatName} size={32} style={styles.messageAvatar} />
        )}

        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}>
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

        {showAISuggestions && renderAISuggestions()}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton}>
              <Icon name="add" size={24} color="#6366f1" />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
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
});

export default ChatScreen;