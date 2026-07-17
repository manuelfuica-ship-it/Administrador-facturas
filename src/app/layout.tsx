import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DTE Chile - Recreación de Facturas Electrónicas',
  description: 'Aplicación para consultar y recrear facturas electrónicas DTE del SII Chile',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
