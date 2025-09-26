import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { DEFAULT_USER, isTestMode } from '@/lib/default-user'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id && !isTestMode) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = isTestMode ? DEFAULT_USER.id : session.user.id

  if (req.method === 'GET') {
    try {
      const { parentId } = req.query
      
      const documents = await prisma.document.findMany({
        where: {
          userId,
          parentId: parentId as string || null,
          isArchived: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return res.status(200).json(documents)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch documents' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, parentId } = req.body

      const document = await prisma.document.create({
        data: {
          title,
          userId,
          parentId: parentId || null,
        },
      })

      return res.status(201).json(document)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create document' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}