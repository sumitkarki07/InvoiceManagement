import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default async function OffersPage() {
  await requireAuth()

  const offers = await prisma.document.findMany({
    where: { type: 'OFFER' },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Offers</h1>
          <Link
            href="/offers/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            New Offer
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {offers.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                No offers yet. Create your first offer to get started.
              </li>
            ) : (
              offers.map((offer) => (
                <li key={offer.id}>
                  <Link
                    href={`/offers/${offer.id}`}
                    className="block hover:bg-gray-50 px-6 py-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <p className="text-sm font-medium text-indigo-600">{offer.number}</p>
                          <p className="text-sm text-gray-500">{offer.client.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            € {parseFloat(offer.total.toString()).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(offer.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              offer.status === 'DRAFT'
                                ? 'bg-yellow-100 text-yellow-800'
                                : offer.status === 'CONVERTED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {offer.status}
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
