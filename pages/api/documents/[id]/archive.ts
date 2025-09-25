import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id

  try {
    const document = await prisma.document.findFirst({
      where: {
        id: id as string,
        userId,
      },
    })

    if (!document) {
      return res.status(404).json({ error: 'Document not found' })
    }

    // Archive the document and all its children recursively
    const archiveRecursively = async (documentId: string) => {
      await prisma.document.update({
        where: { id: documentId },
        data: { isArchived: true },
      })

      const children = await prisma.document.findMany({
        where: {
          parentId: documentId,
          userId,
        },
      })

      for (const child of children) {
        await archiveRecursively(child.id)
      }
    }

    await archiveRecursively(id as string)

    const updatedDocument = await prisma.document.findUnique({
      where: { id: id as string },
    })

    return res.status(200).json(updatedDocument)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to archive document' })
  }
}