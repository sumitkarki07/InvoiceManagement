import { getItemsAction } from '@/app/actions/items'
import ItemForm from '@/components/ItemForm'
import DeleteItemButton from '@/components/DeleteItemButton'
import Layout from '@/components/Layout'

export default async function ItemsPage() {
  const items = await getItemsAction()

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold mb-8 text-amber-900">Voorraadbeheer</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Item Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-100">
              <h2 className="text-xl font-semibold mb-4 text-amber-900">Nieuw item toevoegen</h2>
              <ItemForm />
            </div>
          </div>

          {/* Items List */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-100">
              <h2 className="text-xl font-semibold mb-4 text-amber-900">Voorraadlijst</h2>

              {items.length === 0 ? (
                <p className="text-amber-700">Geen items gevonden. Voeg er één toe om te beginnen.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-amber-100 text-amber-900">
                        <th className="text-left py-2 px-4 font-semibold">Beschrijving</th>
                        <th className="text-left py-2 px-4 font-semibold">Prijs</th>
                        <th className="text-left py-2 px-4 font-semibold">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: { id: string; description: string; price: number }) => (
                        <tr key={item.id} className="border-b border-amber-100 hover:bg-amber-50">
                          <td className="py-3 px-4">{item.description}</td>
                          <td className="py-3 px-4">€ {item.price.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <DeleteItemButton id={item.id} description={item.description} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
