import './globals.css'

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
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
