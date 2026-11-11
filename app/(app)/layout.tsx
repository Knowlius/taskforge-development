import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { auth } from '@/lib/auth'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <div className="min-h-svh bg-background">
      <AppHeader name={session.user.name} email={session.user.email} />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
