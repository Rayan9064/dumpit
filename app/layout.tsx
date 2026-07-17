import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'
import { RootLayoutClient } from './RootLayoutClient'

// Space Grotesk — geometric, modern, developer-centric (primary/heading font)
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

// Inter — highly legible UI sans-serif (secondary/body font)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DumpIt — Your AI Second Brain',
  description: 'Index everything you save — links, notes, PDFs — and ask questions across it all. Via web, browser extension, API, or Claude MCP.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'DumpIt — Your AI Second Brain',
    description: 'Stop losing what you learn. DumpIt indexes your saved content and lets you ask anything.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body suppressHydrationWarning>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  )
}
