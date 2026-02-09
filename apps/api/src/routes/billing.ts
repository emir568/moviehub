import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { authGuard, type AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../services/prisma.js';
import { stripe } from '../services/stripe.js';

const oneTimeSchema = z.object({ movieId: z.string() });

export const billingRouter = Router();

billingRouter.post('/checkout/subscription', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
    success_url: `${env.CLIENT_ORIGIN}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CLIENT_ORIGIN}/pricing`,
    client_reference_id: req.user?.userId
  });

  res.json({ url: session.url });
});

billingRouter.post('/checkout/one-time', authGuard, async (req: AuthenticatedRequest, res: Response) => {
  const payload = oneTimeSchema.parse(req.body);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: env.STRIPE_MOVIE_BUNDLE_PRICE_ID, quantity: 1 }],
    success_url: `${env.CLIENT_ORIGIN}/movies/${payload.movieId}?purchase=success`,
    cancel_url: `${env.CLIENT_ORIGIN}/movies/${payload.movieId}`,
    client_reference_id: req.user?.userId,
    metadata: { movieId: payload.movieId }
  });

  res.json({ url: session.url });
});

billingRouter.post('/webhooks/stripe', async (req: Request, res: Response) => {
  const signature = req.header('stripe-signature');
  if (!signature) {
    res.status(400).send('Missing signature');
    return;
  }

  const event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;

    if (userId && session.mode === 'subscription') {
      await prisma.user.update({ where: { id: userId }, data: { plan: 'PREMIUM' } });
    }

    if (userId && session.mode === 'payment' && session.metadata?.movieId) {
      await prisma.purchase.create({
        data: {
          userId,
          movieId: session.metadata.movieId,
          stripeSessionId: session.id,
          amountCents: session.amount_total ?? 0
        }
      });
    }
  }

  res.json({ received: true });
});
