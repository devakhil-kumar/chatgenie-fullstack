import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import Icon from '@react-native-vector-icons/ionicons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const {width} = Dimensions.get('window');

const PremiumScreen = ({navigation}) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const subscriptionPlans = {
    monthly: {
      id: 'premium_monthly',
      name: 'Monthly',
      price: 9.99,
      period: 'month',
      savings: null,
      popular: false,
    },
    quarterly: {
      id: 'premium_quarterly',
      name: 'Quarterly',
      price: 24.99,
      originalPrice: 29.97,
      period: '3 months',
      savings: '17%',
      popular: false,
    },
    yearly: {
      id: 'premium_yearly',
      name: 'Yearly',
      price: 79.99,
      originalPrice: 119.88,
      period: 'year',
      savings: '33%',
      popular: true,
    },
  };

  const premiumFeatures = [
    {
      icon: 'sparkles',
      title: 'Unlimited AI Conversations',
      description: 'No limits on AI chat interactions',
      free: '50/day',
      premium: 'Unlimited',
    },
    {
      icon: 'flash',
      title: 'Priority AI Processing',
      description: 'Faster response times for all AI features',
      free: 'Standard',
      premium: '3x Faster',
    },
    {
      icon: 'brain',
      title: 'Advanced AI Models',
      description: 'Access to GPT-4, Claude, and other premium models',
      free: 'Basic AI',
      premium: 'All Models',
    },
    {
      icon: 'color-wand',
      title: 'AI Tone Customization',
      description: 'Customize AI personality and response style',
      free: '3 Tones',
      premium: 'Unlimited',
    },
    {
      icon: 'document-text',
      title: 'AI Content Generation',
      description: 'Generate articles, emails, and creative content',
      free: 'Limited',
      premium: 'Unlimited',
    },
    {
      icon: 'language',
      title: 'AI Translation',
      description: 'Real-time translation in 100+ languages',
      free: '5 Languages',
      premium: '100+ Languages',
    },
    {
      icon: 'school',
      title: 'AI Learning Assistant',
      description: 'Personalized learning paths and explanations',
      free: 'Basic',
      premium: 'Advanced',
    },
    {
      icon: 'briefcase',
      title: 'AI Business Tools',
      description: 'Meeting summaries, email drafting, presentations',
      free: null,
      premium: 'Full Access',
    },
    {
      icon: 'image',
      title: 'AI Image Generation',
      description: 'Create images from text descriptions',
      free: '5/day',
      premium: '100/day',
    },
    {
      icon: 'code-slash',
      title: 'AI Code Assistant',
      description: 'Code generation, debugging, and optimization',
      free: 'Basic',
      premium: 'Advanced',
    },
    {
      icon: 'analytics',
      title: 'AI Analytics & Insights',
      description: 'Detailed usage analytics and AI recommendations',
      free: null,
      premium: 'Full Access',
    },
    {
      icon: 'cloud-offline',
      title: 'Offline AI Features',
      description: 'Access some AI features without internet',
      free: null,
      premium: 'Available',
    },
  ];

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
  };

  const handleSubscribe = async () => {
    setIsLoading(true);

    try {
      const plan = subscriptionPlans[selectedPlan];

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Subscription Successful!',
        `You've successfully subscribed to ChatGenie Premium (${plan.name}). Welcome to unlimited AI features!`,
        [
          {
            text: 'Start Using Premium',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = () => {
    Alert.alert('Restore Purchases', 'No previous purchases found.');
  };

  const renderPlanCard = (planKey, plan) => (
    <TouchableOpacity
      key={planKey}
      style={[
        styles.planCard,
        selectedPlan === planKey && styles.selectedPlanCard,
      ]}
      onPress={() => handlePlanSelect(planKey)}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        {plan.savings && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>Save {plan.savings}</Text>
          </View>
        )}
      </View>

      <View style={styles.planPricing}>
        <Text style={styles.planPrice}>${plan.price}</Text>
        <Text style={styles.planPeriod}>/{plan.period}</Text>
        {plan.originalPrice && (
          <Text style={styles.originalPrice}>${plan.originalPrice}</Text>
        )}
      </View>

      <View style={styles.planValue}>
        <Text style={styles.planValueText}>
          ${(plan.price / (planKey === 'yearly' ? 12 : planKey === 'quarterly' ? 3 : 1)).toFixed(2)}/month
        </Text>
      </View>

      <View style={styles.planSelector}>
        <View style={[
          styles.radioButton,
          selectedPlan === planKey && styles.radioButtonSelected
        ]}>
          {selectedPlan === planKey && (
            <Icon name="checkmark" size={16} color="#fff" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeatureRow = (feature) => (
    <View key={feature.title} style={styles.featureRow}>
      <View style={styles.featureLeft}>
        <View style={styles.featureIcon}>
          <Icon name={feature.icon} size={20} color="#6366f1" />
        </View>
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDescription}>{feature.description}</Text>
        </View>
      </View>

      <View style={styles.featureComparison}>
        <View style={styles.freeColumn}>
          <Text style={styles.freeValue}>
            {feature.free || '—'}
          </Text>
        </View>
        <View style={styles.premiumColumn}>
          <Text style={styles.premiumValue}>
            {feature.premium}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Icon name="diamond" size={40} color="#fff" />
          <Text style={styles.headerTitle}>ChatGenie Premium</Text>
          <Text style={styles.headerSubtitle}>
            Unlock the full power of AI with unlimited features
          </Text>
        </View>

        {/* Subscription Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>

          <View style={styles.plansContainer}>
            {Object.entries(subscriptionPlans).map(([key, plan]) =>
              renderPlanCard(key, plan)
            )}
          </View>
        </View>

        {/* Feature Comparison */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Feature Comparison</Text>

          <Card style={styles.comparisonCard}>
            <View style={styles.comparisonHeader}>
              <View style={styles.comparisonLeft}>
                <Text style={styles.comparisonTitle}>Features</Text>
              </View>
              <View style={styles.comparisonRight}>
                <View style={styles.freeHeader}>
                  <Text style={styles.tierTitle}>Free</Text>
                </View>
                <View style={styles.premiumHeader}>
                  <Text style={styles.tierTitle}>Premium</Text>
                  <Icon name="diamond" size={16} color="#6366f1" />
                </View>
              </View>
            </View>

            <View style={styles.featuresList}>
              {premiumFeatures.map(renderFeatureRow)}
            </View>
          </Card>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Why Choose Premium?</Text>

          <View style={styles.benefitsGrid}>
            <Card style={styles.benefitCard}>
              <Icon name="rocket" size={32} color="#6366f1" />
              <Text style={styles.benefitTitle}>10x Productivity</Text>
              <Text style={styles.benefitDescription}>
                Get more done with advanced AI that understands context
              </Text>
            </Card>

            <Card style={styles.benefitCard}>
              <Icon name="shield-checkmark" size={32} color="#10b981" />
              <Text style={styles.benefitTitle}>Priority Support</Text>
              <Text style={styles.benefitDescription}>
                24/7 premium support with faster response times
              </Text>
            </Card>

            <Card style={styles.benefitCard}>
              <Icon name="trending-up" size={32} color="#f59e0b" />
              <Text style={styles.benefitTitle}>Always Updated</Text>
              <Text style={styles.benefitDescription}>
                First access to new AI models and features
              </Text>
            </Card>

            <Card style={styles.benefitCard}>
              <Icon name="infinite" size={32} color="#ef4444" />
              <Text style={styles.benefitTitle}>No Limits</Text>
              <Text style={styles.benefitDescription}>
                Unlimited usage of all AI features and models
              </Text>
            </Card>
          </View>
        </View>

        {/* Subscribe Button */}
        <View style={styles.subscribeSection}>
          <Button
            title={`Start Premium - $${subscriptionPlans[selectedPlan].price}/${subscriptionPlans[selectedPlan].period}`}
            onPress={handleSubscribe}
            loading={isLoading}
            size="large"
            style={styles.subscribeButton}
            leftIcon="diamond"
          />

          <TouchableOpacity onPress={handleRestorePurchases}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Cancel anytime.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#6366f1',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  plansSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  plansContainer: {
    gap: 12,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  savingsBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  planPeriod: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  planValue: {
    marginBottom: 16,
  },
  planValueText: {
    fontSize: 14,
    color: '#6b7280',
  },
  planSelector: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  featuresSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  comparisonCard: {
    padding: 0,
    overflow: 'hidden',
  },
  comparisonHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  comparisonLeft: {
    flex: 2,
  },
  comparisonRight: {
    flex: 1,
    flexDirection: 'row',
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  freeHeader: {
    flex: 1,
    alignItems: 'center',
  },
  premiumHeader: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },
  featuresList: {
    paddingBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  featureLeft: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  featureComparison: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  premiumColumn: {
    flex: 1,
    alignItems: 'center',
  },
  freeValue: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  premiumValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    textAlign: 'center',
  },
  benefitsSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  benefitCard: {
    width: (width - 44) / 2,
    alignItems: 'center',
    padding: 20,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  subscribeSection: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  subscribeButton: {
    width: '100%',
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginBottom: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

export default PremiumScreen;