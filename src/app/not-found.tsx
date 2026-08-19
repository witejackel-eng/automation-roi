import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', gap: '1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Page not found</h1>
      <p style={{ maxWidth: '32rem', color: 'inherit', opacity: 0.75 }}>
        This page doesn&apos;t exist, or the link you followed may be broken,
        expired, or revoked. Nothing on your account was affected.
      </p>
      <Link href="/" style={{ textDecoration: 'underline' }}>Return to the homepage</Link>
    </div>
  );
}
