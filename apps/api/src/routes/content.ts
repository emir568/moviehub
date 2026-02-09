import { Router } from 'express';
import { authGuard, type AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../services/prisma.js';

export const contentRouter = Router();

contentRouter.get('/movies/:id/stream-url', authGuard, async (req: AuthenticatedRequest, res) => {
  const movieId = req.params.id;
  const userId = req.user!.userId;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const purchase = await prisma.purchase.findFirst({ where: { userId, movieId } });

  const canAccess = user.plan === 'PREMIUM' || Boolean(purchase);

  if (!canAccess) {
    res.status(402).json({
      message: 'Payment required for this content.',
      paywall: {
        subscriptionCheckoutPath: '/billing/checkout/subscription',
        oneTimeCheckoutPath: '/billing/checkout/one-time'
      }
    });
    return;
  }

  res.json({ streamUrl: `https://cdn.moviehub.com/streams/${movieId}/master.m3u8` });
});
