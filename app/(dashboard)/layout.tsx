import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Sidebar from './_components/Sidebar'

/**
 * Dashboard layout — server component.
 *
 * Responsibilities:
 *  1. Verify the session is valid (defence-in-depth, middleware already did this)
 *  2. Fetch the org name once here so the Sidebar doesn't need a client-side fetch
 *  3. Render the fixed sidebar + scrollable main content area
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  // Fetch only the org name — no need to pull the entire org record
  const org = await db.organisation.findUnique({
    where: { id: session.orgId },
    select: { name: true },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar orgName={org?.name ?? ''} />

      {/* Main content area scrolls independently of the sidebar */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
