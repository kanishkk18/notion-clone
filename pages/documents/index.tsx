import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { useSession } from 'next-auth/react'
import { PlusCircle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { toast } from 'sonner'
import { authOptions } from '../api/auth/[...nextauth]'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/main/navigation'
import { SearchCommand } from '@/components/search-command'

export default function DocumentsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const onCreate = async () => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Untitled' }),
      })

      if (!response.ok) {
        throw new Error('Failed to create document')
      }

      const document = await response.json()
      router.push(`/documents/${document.id}`)
      toast.success('New note created.')
    } catch (error) {
      toast.error('Failed to create a new note.')
    }
  }

  return (
    <div className="h-full flex dark:bg-[#1F1F1F]">
      <Navigation />
      <main className="flex-1 h-full overflow-y-auto">
        <SearchCommand />
        <div className="h-full flex flex-col items-center justify-center space-y-4">
          <Image
            src="/empty.png"
            alt="Empty"
            height={300}
            width={300}
            className="dark:hidden"
          />
          <Image
            src="/empty-dark.png"
            alt="Empty"
            height={300}
            width={300}
            className="hidden dark:block"
          />

          <h2 className="text-lg font-medium">
            Welcome to {session?.user?.name}&apos;s Jotion.
          </h2>
          <Button onClick={onCreate}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create a note
          </Button>
        </div>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session && !isTestMode) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}