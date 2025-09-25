import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const Logo = ({size = 80, style}) => {
  return (
    <View style={[styles.container, {width: size, height: size}, style]}>
      <Text style={[styles.text, {fontSize: size * 0.3}]}>CG</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Logo;