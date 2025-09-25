import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]'
import { Footer } from '@/components/marketing/footer'
import { Heading } from '@/components/marketing/heading'
import { Heros } from '@/components/marketing/heros'
import { Navbar } from '@/components/marketing/navbar'

export default function MarketingPage() {
  return (
    <div className="h-full dark:bg-[#1F1F1F]">
      <Navbar />
      <main className="h-full pt-40">
        <div className="min-h-full flex flex-col dark:bg-[#1F1F1F]">
          <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
            <Heading />
            <Heros />
          </div>
          <Footer />
        </div>
      </main>
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

  return {
    props: {},
  }
}