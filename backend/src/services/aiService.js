import axios from 'axios';
import crypto from 'crypto';

export class AIService {
  constructor() {
    this.apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1';
    this.apiKey = process.env.AI_API_KEY;
    this.model = process.env.AI_MODEL || 'gpt-3.5-turbo';
    this.encryptionKey = process.env.AI_ENCRYPTION_KEY;
  }

  // Encrypt data before sending to AI service
  encryptData(data) {
    if (!this.encryptionKey) return data;

    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Decrypt data received from AI service
  decryptData(encryptedData) {
    if (!this.encryptionKey) return encryptedData;

    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }

  // Generate AI reply suggestions
  async generateReply(messageText, tone = 'neutral', customPrompt = null, context = null) {
    try {
      if (!this.apiKey) {
        // Return mock responses for development
        return this.getMockReplies(messageText, tone);
      }

      const systemPrompt = this.buildSystemPrompt(tone, customPrompt);
      const userPrompt = this.buildUserPrompt(messageText, context);

      // Encrypt the request if encryption is configured
      const requestData = {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
        temperature: this.getTemperatureForTone(tone),
        n: 3, // Generate 3 suggestions
        stop: ['\n', '.', '!', '?']
      };

      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      const suggestions = response.data.choices.map(choice => ({
        text: choice.message.content.trim(),
        confidence: this.calculateConfidence(choice),
        tone: tone
      }));

      return {
        success: true,
        suggestions,
        usage: response.data.usage
      };

    } catch (error) {
      console.error('AI service error:', error);

      if (error.response?.status === 429) {
        throw new Error('AI service rate limit exceeded. Please try again later.');
      }

      if (error.response?.status === 401) {
        throw new Error('AI service authentication failed.');
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('AI service timeout. Please try again.');
      }

      // Return fallback suggestions on error
      return this.getMockReplies(messageText, tone);
    }
  }

  buildSystemPrompt(tone, customPrompt) {
    const basePrompt = `You are a helpful AI assistant that suggests reply messages for a chat conversation. Generate appropriate, contextual replies that match the requested tone.`;

    const toneInstructions = {
      neutral: 'Generate neutral, balanced replies that are friendly but not overly casual.',
      funny: 'Generate humorous, witty replies that are appropriate and not offensive. Use light humor, puns, or playful language.',
      romantic: 'Generate romantic, affectionate replies that express love, care, and intimacy appropriately.',
      formal: 'Generate professional, polite, and formal replies suitable for business or formal conversations.',
      casual: 'Generate relaxed, friendly, conversational replies using casual language and expressions.',
      professional: 'Generate professional replies that are courteous, clear, and business-appropriate.'
    };

    let systemPrompt = basePrompt + '\n\n' + (toneInstructions[tone] || toneInstructions.neutral);

    if (customPrompt) {
      systemPrompt += '\n\nAdditional instructions: ' + customPrompt;
    }

    systemPrompt += '\n\nRules:\n- Keep replies under 100 characters\n- Make replies feel natural and human\n- Avoid repetitive responses\n- Consider the context of the conversation\n- Generate 3 different reply options';

    return systemPrompt;
  }

  buildUserPrompt(messageText, context) {
    let prompt = `Please suggest replies to this message: "${messageText}"`;

    if (context) {
      prompt += `\n\nConversation context: ${context}`;
    }

    return prompt;
  }

  getTemperatureForTone(tone) {
    const temperatures = {
      neutral: 0.7,
      funny: 0.9,
      romantic: 0.8,
      formal: 0.3,
      casual: 0.8,
      professional: 0.4
    };

    return temperatures[tone] || 0.7;
  }

  calculateConfidence(choice) {
    // Simple confidence calculation based on logprobs if available
    // For now, return a mock confidence score
    return Math.random() * 0.3 + 0.7; // Between 0.7 and 1.0
  }

  getMockReplies(messageText, tone) {
    const mockReplies = {
      neutral: [
        "That's interesting!",
        "I see what you mean.",
        "Thanks for sharing!"
      ],
      funny: [
        "Haha, that's hilarious! 😂",
        "You're too funny!",
        "LOL, I can't even! 🤣"
      ],
      romantic: [
        "You make my heart skip a beat ❤️",
        "I love you so much!",
        "You're absolutely amazing! 💕"
      ],
      formal: [
        "Thank you for your message.",
        "I appreciate your communication.",
        "That is very informative."
      ],
      casual: [
        "Cool stuff!",
        "Awesome!",
        "Sounds good to me!"
      ],
      professional: [
        "Thank you for the update.",
        "I'll review this and get back to you.",
        "That sounds like a great approach."
      ]
    };

    const replies = mockReplies[tone] || mockReplies.neutral;

    return {
      success: true,
      suggestions: replies.map((text, index) => ({
        text,
        confidence: 0.8 + (index * 0.05),
        tone
      })),
      usage: { prompt_tokens: 50, completion_tokens: 30, total_tokens: 80 }
    };
  }

  // Generate emoji suggestions
  async generateEmojis(messageText, count = 5) {
    try {
      const emojiMap = {
        'happy': ['😊', '😄', '🎉', '❤️', '😍'],
        'sad': ['😢', '😭', '💔', '😞', '☹️'],
        'angry': ['😠', '😡', '🤬', '👿', '💢'],
        'love': ['❤️', '💕', '💖', '💝', '😍'],
        'funny': ['😂', '🤣', '😄', '😆', '🙃'],
        'surprised': ['😮', '😯', '🤯', '😲', '😱'],
        'thinking': ['🤔', '💭', '🧐', '😕', '🤷'],
        'celebration': ['🎉', '🎊', '🥳', '🎈', '🍾'],
        'food': ['🍕', '🍔', '🍰', '🍗', '🥗'],
        'travel': ['✈️', '🚗', '🏖️', '🗺️', '📍']
      };

      // Simple keyword matching for emoji suggestions
      const lowerMessage = messageText.toLowerCase();
      let suggestedEmojis = [];

      for (const [category, emojis] of Object.entries(emojiMap)) {
        if (lowerMessage.includes(category) || this.matchesCategory(lowerMessage, category)) {
          suggestedEmojis.push(...emojis.slice(0, 2));
        }
      }

      // Default emojis if no matches
      if (suggestedEmojis.length === 0) {
        suggestedEmojis = ['👍', '😊', '❤️', '🎉', '🤔'];
      }

      return suggestedEmojis.slice(0, count);

    } catch (error) {
      console.error('Emoji generation error:', error);
      return ['👍', '😊', '❤️', '🎉', '🤔'];
    }
  }

  matchesCategory(message, category) {
    const categoryKeywords = {
      'happy': ['good', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic'],
      'sad': ['bad', 'terrible', 'awful', 'sad', 'disappointed', 'upset'],
      'angry': ['angry', 'mad', 'furious', 'annoyed', 'frustrated'],
      'love': ['love', 'adore', 'romantic', 'date', 'kiss', 'heart'],
      'funny': ['funny', 'hilarious', 'joke', 'laugh', 'comedy'],
      'surprised': ['wow', 'amazing', 'incredible', 'unbelievable'],
      'thinking': ['think', 'wonder', 'consider', 'maybe', 'perhaps'],
      'celebration': ['party', 'celebrate', 'birthday', 'congratulations'],
      'food': ['eat', 'hungry', 'delicious', 'restaurant', 'cooking'],
      'travel': ['trip', 'vacation', 'travel', 'flight', 'hotel']
    };

    const keywords = categoryKeywords[category] || [];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Check if user can use AI features
  async checkAIAccess(user) {
    if (!user.canUseAI()) {
      const remainingUses = Math.max(0, user.aiRepliesLimit - user.aiRepliesUsed);

      return {
        hasAccess: false,
        reason: user.isPremium ? 'premium_expired' :
                user.hasUnlockedAI ? 'unlimited_access' : 'limit_exceeded',
        remainingUses,
        isPremium: user.isPremium,
        hasUnlockedAI: user.hasUnlockedAI,
        referralCount: user.referralCount
      };
    }

    return {
      hasAccess: true,
      remainingUses: user.isPremium || user.hasUnlockedAI ? -1 :
                    Math.max(0, user.aiRepliesLimit - user.aiRepliesUsed),
      isPremium: user.isPremium,
      hasUnlockedAI: user.hasUnlockedAI
    };
  }
}