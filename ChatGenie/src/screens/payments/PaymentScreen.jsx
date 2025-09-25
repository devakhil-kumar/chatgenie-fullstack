import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import Icon from '@react-native-vector-icons/ionicons';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PaymentScreen = ({navigation}) => {
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);

  const currentSubscription = {
    plan: 'ChatGenie Premium',
    type: 'Yearly',
    price: 79.99,
    nextBilling: '2024-11-15',
    status: 'active',
  };

  const paymentMethods = [
    {
      id: '1',
      type: 'credit_card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: true,
    },
    {
      id: '2',
      type: 'credit_card',
      brand: 'mastercard',
      last4: '8888',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
    },
  ];

  const billingHistory = [
    {
      id: '1',
      date: '2024-10-15',
      description: 'ChatGenie Premium - Yearly',
      amount: 79.99,
      status: 'paid',
      invoiceUrl: 'https://example.com/invoice/1',
    },
    {
      id: '2',
      date: '2024-07-15',
      description: 'ChatGenie Premium - Quarterly',
      amount: 24.99,
      status: 'paid',
      invoiceUrl: 'https://example.com/invoice/2',
    },
    {
      id: '3',
      date: '2024-04-15',
      description: 'ChatGenie Premium - Monthly',
      amount: 9.99,
      status: 'paid',
      invoiceUrl: 'https://example.com/invoice/3',
    },
    {
      id: '4',
      date: '2024-03-15',
      description: 'ChatGenie Premium - Monthly',
      amount: 9.99,
      status: 'failed',
      invoiceUrl: null,
    },
  ];

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Payment method integration will be available with Stripe/PayPal SDK',
      [
        {text: 'Credit Card', onPress: () => addCreditCard()},
        {text: 'PayPal', onPress: () => addPayPal()},
        {text: 'Apple Pay', onPress: () => addApplePay()},
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  const addCreditCard = () => {
    Alert.alert('Credit Card', 'Credit card form will be implemented with Stripe');
  };

  const addPayPal = () => {
    Alert.alert('PayPal', 'PayPal integration will be implemented');
  };

  const addApplePay = () => {
    Alert.alert('Apple Pay', 'Apple Pay integration will be implemented');
  };

  const handleSetDefaultPayment = (methodId) => {
    Alert.alert('Success', 'Default payment method updated');
  };

  const handleRemovePaymentMethod = (methodId) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Remove', style: 'destructive', onPress: () => {
          Alert.alert('Success', 'Payment method removed');
        }},
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing cycle.',
      [
        {text: 'Keep Subscription', style: 'cancel'},
        {text: 'Cancel Subscription', style: 'destructive', onPress: () => {
          Alert.alert('Subscription Cancelled', 'Your subscription will end on November 15, 2024. You can reactivate at any time.');
        }},
      ]
    );
  };

  const handleDownloadInvoice = (invoiceUrl) => {
    if (invoiceUrl) {
      Alert.alert('Download Invoice', 'Invoice download will be implemented');
    } else {
      Alert.alert('Error', 'Invoice not available for this transaction');
    }
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Support chat will be available for billing inquiries');
  };

  const getCardIcon = (brand) => {
    switch (brand) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
      default:
        return 'card';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'past_due':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderPaymentMethod = (method) => (
    <Card key={method.id} style={styles.paymentMethodCard}>
      <View style={styles.paymentMethodHeader}>
        <View style={styles.paymentMethodLeft}>
          <View style={styles.cardIcon}>
            <Icon name={getCardIcon(method.brand)} size={24} color="#6366f1" />
          </View>
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.cardBrand}>
              {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
            </Text>
            <Text style={styles.cardExpiry}>
              Expires {method.expiryMonth}/{method.expiryYear}
            </Text>
          </View>
        </View>

        <View style={styles.paymentMethodActions}>
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              Alert.alert(
                'Payment Method Actions',
                '',
                [
                  {text: 'Set as Default', onPress: () => handleSetDefaultPayment(method.id)},
                  {text: 'Remove', style: 'destructive', onPress: () => handleRemovePaymentMethod(method.id)},
                  {text: 'Cancel', style: 'cancel'},
                ]
              );
            }}
          >
            <Icon name="ellipsis-horizontal" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderBillingItem = (item) => (
    <Card key={item.id} style={styles.billingItem}>
      <View style={styles.billingHeader}>
        <View style={styles.billingLeft}>
          <Text style={styles.billingDescription}>{item.description}</Text>
          <Text style={styles.billingDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.billingRight}>
          <Text style={styles.billingAmount}>${item.amount}</Text>
          <View style={[styles.statusBadge, {backgroundColor: getPaymentStatusColor(item.status)}]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {item.status === 'paid' && (
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleDownloadInvoice(item.invoiceUrl)}
        >
          <Icon name="download" size={16} color="#6366f1" />
          <Text style={styles.downloadText}>Download Invoice</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Current Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Subscription</Text>

          <Card style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionLeft}>
                <Icon name="diamond" size={24} color="#6366f1" />
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionPlan}>{currentSubscription.plan}</Text>
                  <Text style={styles.subscriptionType}>{currentSubscription.type} Plan</Text>
                </View>
              </View>
              <View style={styles.subscriptionRight}>
                <Text style={styles.subscriptionPrice}>${currentSubscription.price}/year</Text>
                <View style={[styles.statusBadge, {backgroundColor: getStatusColor(currentSubscription.status)}]}>
                  <Text style={styles.statusText}>{currentSubscription.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            <View style={styles.subscriptionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next billing date:</Text>
                <Text style={styles.detailValue}>{formatDate(currentSubscription.nextBilling)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Auto-renewal:</Text>
                <Switch
                  value={autoRenewal}
                  onValueChange={setAutoRenewal}
                  trackColor={{false: '#e5e7eb', true: '#6366f1'}}
                  thumbColor={autoRenewal ? '#fff' : '#f9fafb'}
                />
              </View>
            </View>

            <View style={styles.subscriptionActions}>
              <Button
                title="Change Plan"
                variant="outline"
                size="medium"
                onPress={() => navigation.navigate('Premium')}
                style={styles.changePlanButton}
              />
              <Button
                title="Cancel Subscription"
                variant="destructive"
                size="medium"
                onPress={handleCancelSubscription}
                style={styles.cancelButton}
              />
            </View>
          </Card>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity onPress={handleAddPaymentMethod}>
              <Text style={styles.addButton}>Add New</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentMethodsList}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
        </View>

        {/* Billing Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Settings</Text>

          <Card style={styles.billingSettingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingTitle}>Email receipts</Text>
                <Text style={styles.settingDescription}>
                  Get email notifications for all billing activities
                </Text>
              </View>
              <Switch
                value={emailReceipts}
                onValueChange={setEmailReceipts}
                trackColor={{false: '#e5e7eb', true: '#6366f1'}}
                thumbColor={emailReceipts ? '#fff' : '#f9fafb'}
              />
            </View>

            <TouchableOpacity style={styles.settingRow} onPress={handleContactSupport}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingTitle}>Billing support</Text>
                <Text style={styles.settingDescription}>
                  Get help with your billing and payments
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Billing History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing History</Text>

          <View style={styles.billingHistoryList}>
            {billingHistory.map(renderBillingItem)}
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  addButton: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  subscriptionCard: {
    padding: 20,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  subscriptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subscriptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  subscriptionPlan: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subscriptionType: {
    fontSize: 14,
    color: '#6b7280',
  },
  subscriptionRight: {
    alignItems: 'flex-end',
  },
  subscriptionPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subscriptionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  subscriptionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  changePlanButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  paymentMethodsList: {
    gap: 12,
  },
  paymentMethodCard: {
    padding: 16,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  moreButton: {
    padding: 4,
  },
  billingSettingsCard: {
    padding: 0,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  billingHistoryList: {
    gap: 12,
  },
  billingItem: {
    padding: 16,
  },
  billingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billingLeft: {
    flex: 1,
  },
  billingDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  billingDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  billingRight: {
    alignItems: 'flex-end',
  },
  billingAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  downloadText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default PaymentScreen;