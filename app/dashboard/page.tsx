import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default async function DashboardPage() {
  await requireAuth()

  const [offersCount, invoicesCount, recentOffers, recentInvoices] = await Promise.all([
    prisma.document.count({ where: { type: 'OFFER' } }),
    prisma.document.count({ where: { type: 'INVOICE' } }),
    prisma.document.findMany({
      where: { type: 'OFFER' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    }),
    prisma.document.findMany({
      where: { type: 'INVOICE' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    }),
  ])

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-amber-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-amber-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-amber-700 truncate">Totaal offertes</dt>
                    <dd className="text-lg font-medium text-amber-900">{offersCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  href="/offers"
                  className="font-medium text-amber-800 hover:text-amber-900"
                >
                  Bekijk alle offertes
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-amber-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-amber-700 truncate">Totaal facturen</dt>
                    <dd className="text-lg font-medium text-amber-900">{invoicesCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  href="/invoices"
                  className="font-medium text-amber-800 hover:text-amber-900"
                >
                  Bekijk alle facturen
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white shadow-sm rounded-lg border border-amber-100">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-amber-900 mb-4">
                Recente offertes
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-amber-100">
                  {recentOffers.map((offer) => (
                    <li key={offer.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-amber-900 truncate">
                            {offer.number}
                          </p>
                          <p className="text-sm text-amber-700 truncate">{offer.client.name}</p>
                        </div>
                        <div>
                          <Link
                            href={`/offers/${offer.id}`}
                            className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-amber-300 text-sm leading-5 font-medium rounded-full text-amber-800 bg-white hover:bg-amber-50"
                          >
                            Bekijk
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-amber-100">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-amber-900 mb-4">
                Recente facturen
              </h3>
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-amber-100">
                  {recentInvoices.map((invoice) => (
                    <li key={invoice.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-amber-900 truncate">
                            {invoice.number}
                          </p>
                          <p className="text-sm text-amber-700 truncate">{invoice.client.name}</p>
                        </div>
                        <div>
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-amber-300 text-sm leading-5 font-medium rounded-full text-amber-800 bg-white hover:bg-amber-50"
                          >
                            Bekijk
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
