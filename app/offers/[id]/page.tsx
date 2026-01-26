import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout'
import OfferEditForm from '@/components/OfferEditForm'
import DeleteOfferButton from '@/components/DeleteOfferButton'
import ConvertToInvoiceForm from '@/components/ConvertToInvoiceForm'
import { getClientsAction } from '@/app/actions/clients'
import Link from 'next/link'

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuth()
  const { id } = await params

  const offer = await prisma.document.findUnique({
    where: { id, type: 'OFFER' },
    include: {
      client: true,
      lineItems: true,
    },
  })

  if (!offer) {
    notFound()
  }

  const clients = await getClientsAction()

  const canEdit = offer.status === 'DRAFT'
  const canDelete = offer.status === 'DRAFT'
  const canConvert = offer.status !== 'CONVERTED'

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Offer {offer.number}</h1>
          <div className="flex space-x-3">
            <a
              href={`/api/pdf/${offer.id}`}
              target="_blank"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Download PDF
            </a>
            {canConvert && (
              <ConvertToInvoiceForm offerId={offer.id} defaultDueDate={offer.dueDate} />
            )}
          </div>
        </div>

        {canEdit ? (
          <OfferEditForm
            offerId={offer.id}
            clients={clients}
            initialData={{
              id: offer.id,
              clientId: offer.clientId,
              date: offer.date.toISOString(),
              dueDate: offer.dueDate?.toISOString() || null,
              lineItems: offer.lineItems.map((li) => ({
                id: li.id,
                description: li.description,
                quantity: parseFloat(li.quantity.toString()),
                unitPrice: parseFloat(li.unitPrice.toString()),
              })),
            }}
          />
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Client</dt>
                  <dd className="mt-1 text-sm text-gray-900">{offer.client.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(offer.date).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{offer.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    € {parseFloat(offer.total.toString()).toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {canDelete && <DeleteOfferButton offerId={offer.id} />}
      </div>
    </Layout>
  )
}
