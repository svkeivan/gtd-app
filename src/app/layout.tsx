import './globals.css'
import { Inter } from 'next/font/google'
import { Navbar } from './components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'GTD App',
  description: 'A personal productivity app based on the Getting Things Done methodology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}

