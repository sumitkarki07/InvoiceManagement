import { getItemsAction } from '@/app/actions/items'
import ItemForm from '@/components/ItemForm'
import DeleteItemButton from '@/components/DeleteItemButton'
import Layout from '@/components/Layout'

export default async function ItemsPage() {
  const items = await getItemsAction()

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Item Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
              <ItemForm />
            </div>
          </div>

          {/* Items List */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Items List</h2>

              {items.length === 0 ? (
                <p className="text-gray-500">No items found. Create one to get started.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-semibold">Description</th>
                        <th className="text-left py-2 px-4 font-semibold">Price</th>
                        <th className="text-left py-2 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: { id: string; description: string; price: number }) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
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
