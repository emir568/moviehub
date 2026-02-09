'use client';

import { useSession } from 'next-auth/react';

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const startCheckout = async (path: string, body?: Record<string, string>) => {
  if (!apiUrl) throw new Error('NEXT_PUBLIC_BACKEND_API_URL is not configured');

  const sessionResponse = await fetch('/api/session-token');
  const { accessToken } = await sessionResponse.json();

  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();
  if (data.url) window.location.href = data.url;
};

export const PricingCards = () => {
  const { status } = useSession();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(200px, 1fr))', gap: 16 }}>
      <article>
        <h3>Premium Subscription</h3>
        <p>Unlimited premium streaming access.</p>
        <button disabled={status !== 'authenticated'} onClick={() => startCheckout('/billing/checkout/subscription')}>
          Subscribe with Stripe
        </button>
      </article>
      <article>
        <h3>Movie Bundle</h3>
        <p>One-time payment for pay-per-view content.</p>
        <button disabled={status !== 'authenticated'} onClick={() => startCheckout('/billing/checkout/one-time', { movieId: 'inception' })}>
          Buy One-Time Access
        </button>
      </article>
    </div>
  );
};
