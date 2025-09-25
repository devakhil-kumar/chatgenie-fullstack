import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';

const WelcomeScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Logo size={120} style={styles.logo} />
          <Text style={styles.title}>Welcome to ChatGenie</Text>
          <Text style={styles.subtitle}>
            AI-powered conversations that understand you better
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureText}>Smart AI Suggestions</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>Real-time Messaging</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎭</Text>
            <Text style={styles.featureText}>Multiple Tones</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('Login')}
            size="large"
            style={styles.getStartedButton}
          />
          <Button
            title="Already have an account? Sign In"
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
            size="medium"
            style={styles.signInButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginVertical: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  actions: {
    marginBottom: 40,
  },
  getStartedButton: {
    marginBottom: 16,
  },
  signInButton: {
    marginTop: 8,
  },
});

export default WelcomeScreen;