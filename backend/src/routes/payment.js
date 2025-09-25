import express from 'express';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { validate, createPaymentSchema } from '../utils/validators.js';

const router = express.Router();

// Initialize payment gateways
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// Get pricing plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'premium_monthly',
        name: 'Premium Monthly',
        description: 'Unlimited AI replies and premium features',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Unlimited AI reply suggestions',
          'All AI tones and emotions',
          'Priority customer support',
          'Advanced chat features',
          'No ads'
        ],
        popular: false
      },
      {
        id: 'premium_yearly',
        name: 'Premium Yearly',
        description: 'Best value - 2 months free!',
        price: 99.99,
        currency: 'USD',
        interval: 'year',
        originalPrice: 119.88,
        discount: '17% OFF',
        features: [
          'Everything in Monthly',
          '2 months free',
          'Early access to new features',
          'Priority feature requests',
          'Exclusive premium stickers'
        ],
        popular: true
      },
      {
        id: 'ai_credits_50',
        name: '50 AI Credits',
        description: 'Perfect for occasional use',
        price: 4.99,
        currency: 'USD',
        interval: 'one-time',
        credits: 50,
        features: [
          '50 AI reply suggestions',
          'Valid for 30 days',
          'All AI tones available',
          'No subscription required'
        ],
        popular: false
      },
      {
        id: 'ai_credits_200',
        name: '200 AI Credits',
        description: 'Great value for regular users',
        price: 14.99,
        currency: 'USD',
        interval: 'one-time',
        credits: 200,
        originalPrice: 19.96,
        discount: '25% OFF',
        features: [
          '200 AI reply suggestions',
          'Valid for 60 days',
          'All AI tones available',
          'Bonus emoji suggestions'
        ],
        popular: false
      }
    ];

    res.status(200).json({
      success: true,
      data: { plans }
    });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing plans'
    });
  }
});

// Create payment intent (Stripe)
router.post('/create-intent', validate(createPaymentSchema), async (req, res) => {
  try {
    const { type, amount, currency, paymentMethod, subscription, credits } = req.validatedData;

    if (paymentMethod !== 'stripe') {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is for Stripe payments only'
      });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Stripe not configured'
      });
    }

    // Create payment record
    const payment = new Payment({
      user: req.user._id,
      amount,
      currency,
      paymentMethod,
      type,
      subscription,
      credits,
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'web'
      }
    });

    await payment.save();

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        paymentId: payment._id.toString(),
        userId: req.user._id.toString(),
        type,
        ...(subscription && { plan: subscription.plan }),
        ...(credits && { credits: credits.amount.toString() })
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    // Update payment with Stripe payment intent ID
    payment.stripePaymentIntentId = paymentIntent.id;
    payment.status = 'processing';
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
        transactionId: payment.transactionId
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create Razorpay order
router.post('/create-order', validate(createPaymentSchema), async (req, res) => {
  try {
    const { type, amount, currency, paymentMethod, subscription, credits } = req.validatedData;

    if (paymentMethod !== 'razorpay') {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is for Razorpay payments only'
      });
    }

    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay not configured'
      });
    }

    // Create payment record
    const payment = new Payment({
      user: req.user._id,
      amount,
      currency,
      paymentMethod,
      type,
      subscription,
      credits,
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'web'
      }
    });

    await payment.save();

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise for INR
      currency: currency,
      receipt: payment.transactionId,
      notes: {
        paymentId: payment._id.toString(),
        userId: req.user._id.toString(),
        type,
        ...(subscription && { plan: subscription.plan }),
        ...(credits && { credits: credits.amount.toString() })
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // Update payment with Razorpay order ID
    payment.razorpayOrderId = order.id;
    payment.status = 'processing';
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id,
        transactionId: payment.transactionId,
        key: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify Razorpay payment
router.post('/verify-razorpay', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await payment.markFailed('SIGNATURE_MISMATCH', 'Invalid payment signature');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update payment record
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.markCompleted();

    res.status(200).json({
      success: true,
      message: 'Payment verified and completed successfully',
      data: {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Stripe webhook handler
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata.paymentId;

        if (paymentId) {
          const payment = await Payment.findById(paymentId);
          if (payment) {
            await payment.markCompleted();
            console.log(`Payment ${paymentId} completed via Stripe webhook`);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        const failedPaymentId = failedPayment.metadata.paymentId;

        if (failedPaymentId) {
          const payment = await Payment.findById(failedPaymentId);
          if (payment) {
            await payment.markFailed(
              'PAYMENT_FAILED',
              failedPayment.last_payment_error?.message || 'Payment failed',
              failedPayment.last_payment_error
            );
            console.log(`Payment ${failedPaymentId} failed via Stripe webhook`);
          }
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Get user's payment history
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let query = { user: req.user._id };
    if (status && ['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .select('-stripePaymentIntentId -razorpayPaymentId -error')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
});

// Get payment details
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({
      _id: paymentId,
      user: req.user._id
    }).select('-stripePaymentIntentId -razorpayPaymentId -error.details');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { payment }
    });

  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
});

// Cancel pending payment
router.post('/:paymentId/cancel', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({
      _id: paymentId,
      user: req.user._id,
      status: 'pending'
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or cannot be cancelled'
      });
    }

    payment.status = 'cancelled';
    payment.cancelledAt = new Date();
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel payment'
    });
  }
});

export default router;