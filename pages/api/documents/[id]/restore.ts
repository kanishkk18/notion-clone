import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { DEFAULT_USER, isTestMode } from '@/lib/default-user'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session?.user?.id && !isTestMode) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = isTestMode ? DEFAULT_USER.id : session.user.id

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

    // Restore the document and all its children recursively
    const restoreRecursively = async (documentId: string) => {
      await prisma.document.update({
        where: { id: documentId },
        data: { isArchived: false },
      })

      const children = await prisma.document.findMany({
        where: {
          parentId: documentId,
          userId,
        },
      })

      for (const child of children) {
        await restoreRecursively(child.id)
      }
    }

    // Check if parent is archived, if so, remove parent reference
    let updateData: any = { isArchived: false }
    
    if (document.parentId) {
      const parent = await prisma.document.findUnique({
        where: { id: document.parentId },
      })

      if (parent?.isArchived) {
        updateData.parentId = null
      }
    }

    await prisma.document.update({
      where: { id: id as string },
      data: updateData,
    })

    await restoreRecursively(id as string)

    const updatedDocument = await prisma.document.findUnique({
      where: { id: id as string },
    })

    return res.status(200).json(updatedDocument)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to restore document' })
  }
}