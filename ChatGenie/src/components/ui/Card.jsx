import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';

const Card = ({
  children,
  onPress,
  style,
  padding = true,
  shadow = true,
  ...props
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.card,
        shadow && styles.shadow,
        padding && styles.padding,
        style,
      ]}
      activeOpacity={onPress ? 0.7 : 1}
      {...props}>
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 4,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  padding: {
    padding: 16,
  },
});

export default Card;