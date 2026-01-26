import './globals.css'
import { ThemeProvider } from 'next-themes'

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
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="tracelens-ui-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
