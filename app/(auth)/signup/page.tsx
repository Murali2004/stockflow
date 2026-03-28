'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Signup page — form only, layout provided by (auth)/layout.tsx.
 * Creates a new Organisation + User in one step.
 * On success the server sets a session cookie and we redirect to /dashboard.
 */
export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    orgName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'h-11 border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50 focus:bg-white transition-colors'

  return (
    <div>
      {/* Heading */}
      <div className="mb-5">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h2>
        <p className="mt-2 text-sm text-gray-500">
          Start managing your inventory in minutes — free forever
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Organisation name */}
        <div className="space-y-1.5">
          <Label htmlFor="orgName" className="text-sm font-medium text-gray-700">
            Organisation name
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="orgName"
              type="text"
              placeholder="Acme Inc."
              value={form.orgName}
              onChange={(e) => update('orgName', e.target.value)}
              className={`pl-9 ${inputClass}`}
              required
              autoFocus
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={`pl-9 ${inputClass}`}
              required
            />
          </div>
        </div>

        {/* Password row — two fields side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 chars"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className={`pl-9 pr-9 ${inputClass}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                className={`pl-9 ${inputClass}`}
                required
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 font-semibold text-sm mt-1"
          disabled={loading}
        >
          {loading ? (
            'Creating account…'
          ) : (
            <span className="flex items-center gap-2">
              Create account <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
