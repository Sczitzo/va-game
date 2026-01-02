import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VA Group Psychoeducation',
  description: 'Facilitator-led interactive group psychoeducation for veterans',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

