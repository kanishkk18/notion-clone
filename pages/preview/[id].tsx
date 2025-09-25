import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Cover } from '@/components/cover'
import { Toolbar } from '@/components/toolbar'
import { Skeleton } from '@/components/ui/skeleton'

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

type PreviewPageProps = {
  documentId: string
}

const Editor = dynamic(() => import('@/components/editor'), { ssr: false })

export default function PreviewPage({ documentId }: PreviewPageProps) {
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
        setDocument(null)
      } finally {
        setLoading(false)
      }
    }

    if (documentId) {
      fetchDocument()
    }
  }, [documentId])

  const onChange = () => {
    // No-op for preview mode
  }

  if (loading) {
    return (
      <div className="pb-40 dark:bg-[#1F1F1F]">
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
    )
  }

  if (!document) {
    return (
      <div className="pb-40 dark:bg-[#1F1F1F]">
        <div className="text-center mt-10">Not found.</div>
      </div>
    )
  }

  return (
    <div className="pb-40 dark:bg-[#1F1F1F]">
      <Cover preview url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-3xl mx-auto">
        <Toolbar preview initialData={document} />
        <Editor
          editable={false}
          onChange={onChange}
          initialContent={document.content}
        />
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!

  return {
    props: {
      documentId: id,
    },
  }
}