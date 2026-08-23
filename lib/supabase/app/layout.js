import './globals.css'

export const metadata = {
  title: 'Skur',
  description: 'Lej værktøj lokalt',
}

export default function RootLayout({ children }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  )
}
