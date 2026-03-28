import { redirect } from 'next/navigation'

/**
 * Root route — redirects straight to the dashboard.
 * Middleware handles the auth check; if not logged in,
 * it will redirect to /login before this page renders.
 */
export default function Home() {
  redirect('/dashboard')
}
