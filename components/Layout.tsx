import { logoutAction } from '@/app/actions/auth'
import Link from 'next/link'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-amber-50">
      <nav className="bg-white shadow-sm border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="text-xl font-bold text-amber-900">
                  Offerte & Factuur Management
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-amber-700 hover:border-amber-300 hover:text-amber-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/offers"
                  className="border-transparent text-amber-700 hover:border-amber-300 hover:text-amber-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Offerte
                </Link>
                <Link
                  href="/invoices"
                  className="border-transparent text-amber-700 hover:border-amber-300 hover:text-amber-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Factuur
                </Link>
                <Link
                  href="/items"
                  className="border-transparent text-amber-700 hover:border-amber-300 hover:text-amber-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Voorraad
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-amber-700 hover:text-amber-900 px-3 py-2 text-sm font-medium"
                >
                  Uitloggen
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
