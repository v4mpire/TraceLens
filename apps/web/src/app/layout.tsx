import './globals.css'
import { ThemeProvider } from '../components/theme-provider'

export const metadata = {
  title: 'TraceLens Dashboard',
  description: 'Runtime Truth Engine for Web Applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          defaultTheme="system"
          storageKey="tracelens-ui-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
