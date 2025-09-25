import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToasterProvider } from '@/components/providers/toaster-provider'
import { ModalProvider } from '@/components/providers/modal-provider'
import { EdgeStoreProvider } from '@/lib/edgestore'
import '@/app/globals.css'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
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