import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToasterProvider } from '@/components/providers/toaster-provider'
import { ModalProvider } from '@/components/providers/modal-provider'
import { EdgeStoreProvider } from '@/lib/edgestore'
import { DEFAULT_USER, isTestMode } from '@/lib/default-user'
import '@/app/globals.css'

// Create a mock session for test mode
const createMockSession = () => ({
  user: DEFAULT_USER,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
})
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  // In test mode, provide a default session
  const effectiveSession = isTestMode ? createMockSession() : session

  return (
    <SessionProvider session={effectiveSession}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="jotion-theme"
      >
        <EdgeStoreProvider>
          <ToasterProvider />
          <ModalProvider />
          <Component {...pageProps} />
        </EdgeStoreProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}