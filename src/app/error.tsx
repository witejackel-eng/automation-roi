'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[app-error-boundary]', error);
  }, [error]);

  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', gap: '1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Something went wrong</h1>
      <p style={{ maxWidth: '32rem', color: 'inherit', opacity: 0.75 }}>
        We hit an unexpected error loading this page. Nothing on your account
        was affected. You can try again, or head back to the homepage.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => reset()} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Try again</button>
        <Link href="/" style={{ textDecoration: 'underline' }}>Return to the homepage</Link>
      </div>
    </div>
  );
}
