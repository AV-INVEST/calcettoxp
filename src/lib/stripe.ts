import Stripe from 'stripe';

type StripeConstructor = new (
  apiKey: string,
  opts: { apiVersion: string; typescript?: boolean },
) => Stripe;

const STRIPE_API_VERSION = '2025-03-31.basil';

function createStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY environment variable is required when using Stripe APIs.',
    );
  }
  return new (Stripe as unknown as StripeConstructor)(key, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  });
}

declare const globalThis: { stripeGlobal?: Stripe } & typeof global;

let cachedClient: Stripe | null = null;

function getClient(): Stripe {
  if (!cachedClient) {
    cachedClient = globalThis.stripeGlobal ?? createStripeClient();
    if (process.env.NODE_ENV !== 'production') {
      globalThis.stripeGlobal = cachedClient;
    }
  }
  return cachedClient;
}

const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
  ownKeys(_target) {
    return Reflect.ownKeys(getClient());
  },
  getOwnPropertyDescriptor(_target, prop) {
    const client = getClient();
    const desc = Reflect.getOwnPropertyDescriptor(client, prop);
    if (desc) Object.defineProperty(_target, prop, desc);
    return desc;
  },
});

export default stripe;
