import { requireAuth } from '@/lib/auth'
import { getClientsAction } from '@/app/actions/clients'
import { getItemsAction } from '@/app/actions/items'
import Layout from '@/components/Layout'
import OfferFormWrapper from '@/components/OfferFormWrapper'

export default async function NewOfferPage() {
  await requireAuth()
  const clients = await getClientsAction()
  const items = await getItemsAction()

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">New Offer</h1>
        <OfferFormWrapper clients={clients} items={items} />
      </div>
    </Layout>
  )
}
