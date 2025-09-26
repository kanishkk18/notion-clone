import NextAuth, { type NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { DEFAULT_USER, isTestMode } from '@/lib/default-user'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        // For demo purposes - in production, you'd have a password field
        // const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        // if (!isPasswordValid) {
        //   return null
        // }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // In test mode, use default user
      if (isTestMode && !token.id) {
        token.id = DEFAULT_USER.id
        token.name = DEFAULT_USER.name
        token.email = DEFAULT_USER.email
        token.picture = DEFAULT_USER.image
      }
      
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // In test mode, use default user
      if (isTestMode) {
        session.user = {
          id: DEFAULT_USER.id,
          name: DEFAULT_USER.name,
          email: DEFAULT_USER.email,
          image: DEFAULT_USER.image,
        }
        return session
      }
      
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

export default NextAuth(authOptions)