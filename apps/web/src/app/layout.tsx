import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body style={{ fontFamily: 'system-ui', maxWidth: 1000, margin: '0 auto', padding: 24 }}>{children}</body>
    </html>
  );
}
