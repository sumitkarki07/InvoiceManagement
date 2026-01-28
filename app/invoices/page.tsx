import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Layout from '@/components/Layout'
import Link from 'next/link'
import DeleteInvoiceButton from '@/components/DeleteInvoiceButton'

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  await requireAuth()

  const query = searchParams?.q?.trim()
  const invoices = await prisma.document.findMany({
    where: {
      type: 'INVOICE',
      ...(query
        ? {
            OR: [
              { number: { contains: query, mode: 'insensitive' } },
              { client: { name: { contains: query, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Factuur historie</h1>
            <p className="mt-1 text-sm text-amber-800">Overzicht van opgeslagen facturen.</p>
          </div>
          <Link
            href="/invoices/new"
            className="inline-flex items-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50"
          >
            Terug naar factuur
          </Link>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Zoeken
              </label>
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Factuurnummer of klantnaam"
                className="mt-2 w-72 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              className="rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50"
            >
              Zoeken
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-amber-100 bg-amber-50/60 text-amber-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Factuurnummer</th>
                  <th className="px-4 py-3 font-semibold">Datum</th>
                  <th className="px-4 py-3 font-semibold">Vervaldatum</th>
                  <th className="px-4 py-3 font-semibold">Klant</th>
                  <th className="px-4 py-3 font-semibold text-right">Totaal</th>
                  <th className="px-4 py-3 font-semibold text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-amber-700" colSpan={6}>
                      Geen facturen gevonden.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="text-amber-900">
                      <td className="px-4 py-3 font-semibold">{invoice.number}</td>
                      <td className="px-4 py-3">
                        {new Date(invoice.date).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-4 py-3">
                        {invoice.dueDate
                          ? new Date(invoice.dueDate).toLocaleDateString('nl-NL')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">{invoice.client.name}</td>
                      <td className="px-4 py-3 text-right">
                        € {parseFloat(invoice.total.toString()).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-3 text-sm">
                          <Link href={`/invoices/${invoice.id}`} className="text-amber-800 hover:text-amber-900">
                            Bewerken
                          </Link>
                          <Link
                            href={`/invoices/${invoice.id}/print`}
                            target="_blank"
                            className="text-amber-800 hover:text-amber-900"
                          >
                            Print
                          </Link>
                          <a
                            href={`/api/pdf/${invoice.id}`}
                            target="_blank"
                            className="text-amber-800 hover:text-amber-900"
                          >
                            PDF
                          </a>
                          <DeleteInvoiceButton invoiceId={invoice.id} label="Verwijderen" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
