import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id

  if (req.method === 'GET') {
    try {
      const document = await prisma.document.findFirst({
        where: {
          id: id as string,
          OR: [
            { userId },
            { isPublished: true, isArchived: false }
          ]
        },
      })

      if (!document) {
        return res.status(404).json({ error: 'Document not found' })
      }

      return res.status(200).json(document)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch document' })
    }
  }

  if (req.method === 'PATCH') {
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

      const updatedDocument = await prisma.document.update({
        where: { id: id as string },
        data: req.body,
      })

      return res.status(200).json(updatedDocument)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update document' })
    }
  }

  if (req.method === 'DELETE') {
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

      await prisma.document.delete({
        where: { id: id as string },
      })

      return res.status(200).json({ message: 'Document deleted' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete document' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}