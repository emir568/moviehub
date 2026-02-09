import Link from 'next/link';
import { PricingCards } from '@/components/PricingCards';

export default function HomePage() {
  return (
    <main>
      <h1>MovieHub Production Platform</h1>
      <p>Freemium + paywall architecture with subscriptions, one-time checkout, and OAuth/auth accounts.</p>
      <PricingCards />
      <p>
        <Link href='/dashboard'>Go to Dashboard</Link>
      </p>
    </main>
  );
}
