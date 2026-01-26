import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout'
import InvoiceEditForm from '@/components/InvoiceEditForm'
import CancelInvoiceButton from '@/components/CancelInvoiceButton'
import { getClientsAction } from '@/app/actions/clients'
import Link from 'next/link'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuth()
  const { id } = await params

  const invoice = await prisma.document.findUnique({
    where: { id, type: 'INVOICE' },
    include: {
      client: true,
      lineItems: true,
    },
  })

  if (!invoice) {
    notFound()
  }

  const clients = await getClientsAction()

  const canEdit = invoice.status === 'DRAFT'
  const canCancel = invoice.status !== 'CANCELLED' && invoice.status !== 'PAID'

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.number}</h1>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/invoices/${invoice.id}/print`}
              target="_blank"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Print Invoice
            </Link>
            <a
              href={`/api/pdf/${invoice.id}`}
              target="_blank"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Download PDF
            </a>
            {canCancel && (
              <CancelInvoiceButton invoiceId={invoice.id} />
            )}
          </div>
        </div>

        {canEdit ? (
          <InvoiceEditForm
            invoiceId={invoice.id}
            clients={clients}
            initialData={{
              id: invoice.id,
              clientId: invoice.clientId,
              date: invoice.date.toISOString(),
              dueDate: invoice.dueDate?.toISOString() || null,
              lineItems: invoice.lineItems.map((li) => ({
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
                  <dd className="mt-1 text-sm text-gray-900">{invoice.client.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString()
                      : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{invoice.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    € {parseFloat(invoice.subtotal.toString()).toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tax (21%)</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    € {parseFloat(invoice.tax.toString()).toFixed(2)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Total</dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900">
                    € {parseFloat(invoice.total.toString()).toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
