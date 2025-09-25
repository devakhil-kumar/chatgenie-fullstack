import React from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';

const Avatar = ({
  source,
  name,
  size = 40,
  onPress,
  showOnlineStatus = false,
  isOnline = false,
  style,
}) => {
  const avatarSize = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : '?';

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container onPress={onPress} style={[styles.container, style]}>
      <View style={[styles.avatar, avatarSize]}>
        {source ? (
          <Image source={source} style={[styles.image, avatarSize]} />
        ) : (
          <View style={[styles.placeholder, avatarSize]}>
            <Text style={[styles.initials, {fontSize: size * 0.4}]}>
              {initials}
            </Text>
          </View>
        )}
      </View>

      {showOnlineStatus && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: size * 0.125,
              right: size * 0.05,
              bottom: size * 0.05,
            },
            isOnline ? styles.online : styles.offline,
          ]}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
  },
  online: {
    backgroundColor: '#10b981',
  },
  offline: {
    backgroundColor: '#9ca3af',
  },
});

export default Avatar;