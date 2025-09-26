import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { DEFAULT_USER, isTestMode } from '@/lib/default-user'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id && !isTestMode) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = isTestMode ? DEFAULT_USER.id : session.user.id

  try {
    const documents = await prisma.document.findMany({
      where: {
        userId,
        isArchived: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return res.status(200).json(documents)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch trash documents' })
  }
}