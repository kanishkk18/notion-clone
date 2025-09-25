import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { signIn, getProviders } from 'next-auth/react'
import { authOptions } from '../api/auth/[...nextauth]'
import { Button } from '@/components/ui/button'

type Provider = {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

type SignInPageProps = {
  providers: Record<string, Provider>
}

export default function SignInPage({ providers }: SignInPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1F1F1F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to Jotion
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            The connected workspace where better, faster work happens
          </p>
        </div>
        <div className="mt-8 space-y-4">
          {Object.values(providers).map((provider) => (
            <div key={provider.name}>
              <Button
                onClick={() => signIn(provider.id, { callbackUrl: '/documents' })}
                className="w-full"
                variant="outline"
              >
                Sign in with {provider.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (session) {
    return {
      redirect: {
        destination: '/documents',
        permanent: false,
      },
    }
  }

  const providers = await getProviders()

  return {
    props: {
      providers: providers ?? {},
    },
  }
}