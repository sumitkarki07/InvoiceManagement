import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default async function InvoicesPage() {
  await requireAuth()

  const invoices = await prisma.document.findMany({
    where: { type: 'INVOICE' },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <Link
            href="/invoices/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            New Invoice
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                No invoices yet. Create your first invoice to get started.
              </li>
            ) : (
              invoices.map((invoice) => (
                <li key={invoice.id}>
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="block hover:bg-gray-50 px-6 py-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <p className="text-sm font-medium text-indigo-600">{invoice.number}</p>
                          <p className="text-sm text-gray-500">{invoice.client.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            € {parseFloat(invoice.total.toString()).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(invoice.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              invoice.status === 'DRAFT'
                                ? 'bg-yellow-100 text-yellow-800'
                                : invoice.status === 'PAID'
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </Layout>
  )
}
