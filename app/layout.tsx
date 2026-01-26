import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Grishma Bill - Invoice Management',
  description: 'Admin invoice and offer management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
