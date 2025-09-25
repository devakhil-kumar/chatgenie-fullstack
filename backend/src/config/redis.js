import { createClient } from 'redis';

let redisClient;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('🔴 Redis Connected');
    });

    redisClient.on('ready', () => {
      console.log('🔴 Redis Ready');
    });

    redisClient.on('end', () => {
      console.log('🔴 Redis Connection Ended');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    process.exit(1);
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

// Helper functions for common Redis operations
export const setUserOnline = async (userId, socketId) => {
  try {
    const client = getRedisClient();
    await client.setEx(`user:${userId}:online`, 3600, socketId);
    await client.sAdd('online_users', userId);
  } catch (error) {
    console.error('Error setting user online:', error);
  }
};

export const setUserOffline = async (userId) => {
  try {
    const client = getRedisClient();
    await client.del(`user:${userId}:online`);
    await client.sRem('online_users', userId);
  } catch (error) {
    console.error('Error setting user offline:', error);
  }
};

export const isUserOnline = async (userId) => {
  try {
    const client = getRedisClient();
    const isOnline = await client.exists(`user:${userId}:online`);
    return Boolean(isOnline);
  } catch (error) {
    console.error('Error checking user online status:', error);
    return false;
  }
};

export const setTypingIndicator = async (chatId, userId, isTyping) => {
  try {
    const client = getRedisClient();
    const key = `typing:${chatId}`;

    if (isTyping) {
      await client.setEx(`${key}:${userId}`, 10, Date.now().toString());
    } else {
      await client.del(`${key}:${userId}`);
    }
  } catch (error) {
    console.error('Error setting typing indicator:', error);
  }
};

export const getTypingUsers = async (chatId) => {
  try {
    const client = getRedisClient();
    const keys = await client.keys(`typing:${chatId}:*`);
    const typingUsers = keys.map(key => key.split(':')[2]);
    return typingUsers;
  } catch (error) {
    console.error('Error getting typing users:', error);
    return [];
  }
};