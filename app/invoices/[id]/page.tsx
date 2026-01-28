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
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Factuur {invoice.number}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/invoices/${invoice.id}/print`}
              target="_blank"
              className="inline-flex items-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50"
            >
              Factuur printen
            </Link>
            <a
              href={`/api/pdf/${invoice.id}`}
              target="_blank"
              className="inline-flex items-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50"
            >
              PDF downloaden
            </a>
            {canCancel && (
              <CancelInvoiceButton invoiceId={invoice.id} />
            )}
          </div>
        </div>

        {canEdit ? (
          <>
            <div className="mb-6 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <img src="/logo.png" alt="Logo" className="h-16 w-16 object-contain" />
                  <div className="space-y-1 text-sm text-amber-900">
                    <div className="text-base font-semibold">Allround bouwbedrijf JP</div>
                    <div>Grimbeerstraat 16C</div>
                    <div>6217 BE Maastricht</div>
                    <div>+31 6 44063955</div>
                    <div>AllroundbouwbedrijfJP@hotmail.com</div>
                    <div className="text-xs text-amber-700">KvK: 97906018</div>
                    <div className="text-xs text-amber-700">BTW: NL005298395B09</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold tracking-[0.4em] text-amber-800">FACTUUR</div>
                  <div className="mt-4 space-y-2 text-sm text-amber-900">
                    <div className="flex justify-between gap-6">
                      <span className="text-amber-700">Factuurnummer</span>
                      <span>{invoice.number}</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-amber-700">Datum</span>
                      <span>{new Date(invoice.date).toLocaleDateString('nl-NL')}</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-amber-700">Vervaldatum</span>
                      <span>
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString('nl-NL')
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <InvoiceEditForm
              invoiceId={invoice.id}
              clients={clients}
              initialData={{
              id: invoice.id,
              clientId: invoice.clientId,
              date: invoice.date.toISOString(),
              dueDate: invoice.dueDate?.toISOString() || null,
              taxRate: invoice.taxRate ?? 21,
              lineItems: invoice.lineItems.map((li) => ({
                id: li.id,
                description: li.description,
                quantity: parseFloat(li.quantity.toString()),
                unitPrice: parseFloat(li.unitPrice.toString()),
                })),
              }}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-amber-100 bg-white shadow-sm">
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-amber-700">Klant</dt>
                  <dd className="mt-1 text-sm text-amber-900">{invoice.client.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-amber-700">Datum</dt>
                  <dd className="mt-1 text-sm text-amber-900">
                    {new Date(invoice.date).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-amber-700">Vervaldatum</dt>
                  <dd className="mt-1 text-sm text-amber-900">
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString()
                      : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-amber-700">Status</dt>
                  <dd className="mt-1 text-sm text-amber-900">{invoice.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-amber-700">Subtotaal</dt>
                  <dd className="mt-1 text-sm text-amber-900">
                    € {parseFloat(invoice.subtotal.toString()).toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-amber-700">BTW (21%)</dt>
                  <dd className="mt-1 text-sm text-amber-900">
                    € {parseFloat(invoice.tax.toString()).toFixed(2)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-amber-700">Totaal</dt>
                  <dd className="mt-1 text-2xl font-bold text-amber-900">
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
