import Stripe from 'stripe';

const stripeClientSingleton = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
    typescript: true,
  });
};

declare const globalThis: {
  stripeGlobal: ReturnType<typeof stripeClientSingleton>;
} & typeof global;

const stripe = globalThis.stripeGlobal ?? stripeClientSingleton();

export default stripe;

if (process.env.NODE_ENV !== 'production') globalThis.stripeGlobal = stripe;
