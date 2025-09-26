import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import dynamic from 'next/dynamic'
import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'sonner'
import { authOptions } from '../api/auth/[...nextauth]'
import { isTestMode } from '@/lib/default-user'
import { Cover } from '@/components/cover'
import { Toolbar } from '@/components/toolbar'
import { Skeleton } from '@/components/ui/skeleton'
import { Navigation } from '@/components/main/navigation'
import { SearchCommand } from '@/components/search-command'

type Document = {
  id: string
  title: string
  content?: string
  coverImage?: string
  icon?: string
  isArchived: boolean
  isPublished: boolean
  userId: string
  parentId?: string
  createdAt: string
  updatedAt: string
}

type DocumentPageProps = {
  documentId: string
}

const Editor = dynamic(() => import('@/components/editor'), { ssr: false })

export default function DocumentPage({ documentId }: DocumentPageProps) {
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`)
        if (!response.ok) {
          throw new Error('Document not found')
        }
        const doc = await response.json()
        setDocument(doc)
      } catch (error) {
        toast.error('Failed to load document')
        router.push('/documents')
      } finally {
        setLoading(false)
      }
    }

    if (documentId) {
      fetchDocument()
    }
  }, [documentId, router])

  const onChange = async (content: string) => {
    if (!document) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to update document')
      }
    } catch (error) {
      toast.error('Failed to save changes')
    }
  }

  if (loading) {
    return (
      <div className="h-full flex dark:bg-[#1F1F1F]">
        <Navigation />
        <main className="flex-1 h-full overflow-y-auto">
          <div>
            <Cover.Skeleton />
            <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
              <div className="space-y-4 pl-8 pt-4">
                <Skeleton className="h-14 w-[50%]" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[40%]" />
                <Skeleton className="h-4 w-[60%]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="h-full flex dark:bg-[#1F1F1F]">
        <Navigation />
        <main className="flex-1 h-full overflow-y-auto">
          <p className="text-center mt-10">Not found.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="h-full flex dark:bg-[#1F1F1F]">
      <Navigation />
      <main className="flex-1 h-full overflow-y-auto">
        <SearchCommand />
        <div className="pb-40">
          <Cover preview={document.isArchived} url={document.coverImage} />
          <div className="md:max-w-3xl lg:max-w-3xl mx-auto">
            <Toolbar preview={document.isArchived} initialData={document} />
            <Editor
              editable={!document.isArchived}
              onChange={onChange}
              initialContent={document.content}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const { id } = context.params!

  if (!session && !isTestMode) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      documentId: id,
    },
  }
}