import type { ReactNode } from 'react';
import { Providers } from '../components/Providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body style={{ fontFamily: 'system-ui', maxWidth: 1000, margin: '0 auto', padding: 24 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
