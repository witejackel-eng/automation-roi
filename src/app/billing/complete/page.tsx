'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function BillingCompletePage() {
  const params = useSearchParams();
  const status = params.get('status');
  const isSuccess = status === 'success';

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      {isSuccess ? (
        <>
          <h1>Payment received</h1>
          <p>Your plan is being activated. This usually takes a few seconds.</p>
        </>
      ) : (
        <>
          <h1>Checkout did not complete</h1>
          <p>No charge was made. You can try again from the pricing page.</p>
        </>
      )}
      <Link href="/start?start=1">Go to your dashboard</Link>
    </div>
  );
}
