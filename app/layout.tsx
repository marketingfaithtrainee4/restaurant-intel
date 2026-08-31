export const metadata = {
  title: 'Restaurant Marketing Intelligence',
  description: 'Multi-tenant restaurant marketing + competitor intelligence platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
