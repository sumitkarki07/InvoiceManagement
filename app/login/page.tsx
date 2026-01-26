import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { loginAction } from '@/app/actions/auth'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
  const session = await getSession()
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage invoices and offers
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
