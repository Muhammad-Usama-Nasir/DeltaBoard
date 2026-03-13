// app/layout.tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Deltaboard',
  description: 'Change tracker for your projects',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 text-gray-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}