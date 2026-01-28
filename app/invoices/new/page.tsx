import { requireAuth } from '@/lib/auth'
import { getClientsAction } from '@/app/actions/clients'
import { getItemsAction } from '@/app/actions/items'
import Layout from '@/components/Layout'
import InvoiceFormWrapper from '@/components/InvoiceFormWrapper'
import { getNextDocumentNumberPreview } from '@/lib/numbering'

export default async function NewInvoicePage() {
  await requireAuth()
  const clients = await getClientsAction()
  const items = await getItemsAction()
  const nextNumber = await getNextDocumentNumberPreview('INVOICE')

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-amber-900">Factuur maken</h1>
          <p className="mt-1 text-sm text-amber-800">
            Vul de gegevens hieronder in. De vervaldatum wordt automatisch op 15 dagen gezet.
          </p>
        </div>
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
                  <span>{nextNumber}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-amber-700">Datum</span>
                  <span>{new Date().toLocaleDateString('nl-NL')}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-amber-700">Vervaldatum</span>
                  <span>
                    {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <InvoiceFormWrapper clients={clients} items={items} />
      </div>
    </Layout>
  )
}
