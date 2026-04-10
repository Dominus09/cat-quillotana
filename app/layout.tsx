import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Catálogo Mayorista | Distribuidora La Quillotana',
  description: 'Catálogo mayorista de productos - Distribuidora La Quillotana',
  icons: {
    icon: [
      { url: '/favicon_32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_64.png', sizes: '64x64', type: 'image/png' },
    ],
    shortcut: '/favicon_32.png',
    apple: '/favicon_128.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
