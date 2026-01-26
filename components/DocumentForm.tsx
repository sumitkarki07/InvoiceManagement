'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  street?: string | null
  city?: string | null
  postcode?: string | null
  phone?: string | null
  vatNumber?: string | null
}

interface Item {
  id: string
  description: string
  price: number
}

interface LineItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
}

interface DocumentFormProps {
  type: 'OFFER' | 'INVOICE'
  clients: Client[]
  items?: Item[]
  initialData?: {
    id: string
    clientId: string
    date: string
    dueDate?: string | null
    lineItems: LineItem[]
  }
  onSubmit: (formData: FormData) => Promise<{ success?: boolean; error?: string; documentId?: string }>
}

export default function DocumentForm({
  type,
  clients,
  items = [],
  initialData,
  onSubmit,
}: DocumentFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.lineItems || [{ description: '', quantity: 0, unitPrice: 0 }]
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    // Add line items to form data
    lineItems.forEach((item, index) => {
      if (item.id) formData.append(`lineItems[${index}].id`, item.id)
      formData.append(`lineItems[${index}].description`, item.description)
      formData.append(`lineItems[${index}].quantity`, item.quantity.toString())
      formData.append(`lineItems[${index}].unitPrice`, item.unitPrice.toString())
    })

    const result = await onSubmit(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.success) {
      router.push(`/${type === 'OFFER' ? 'offers' : 'invoices'}/${result.documentId || initialData?.id}`)
    }
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 0, unitPrice: 0 }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.21
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
              Client *
            </label>
            <select
              id="clientId"
              name="clientId"
              required
              defaultValue={initialData?.clientId || ''}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              defaultValue={
                initialData?.date
                  ? new Date(initialData.date).toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0]
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {type === 'INVOICE' && (
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                required
                defaultValue={
                  initialData?.dueDate
                    ? new Date(initialData.dueDate).toISOString().split('T')[0]
                    : ''
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          {type === 'OFFER' && (
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date (optional)
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                defaultValue={
                  initialData?.dueDate
                    ? new Date(initialData.dueDate).toISOString().split('T')[0]
                    : ''
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
          <button
            type="button"
            onClick={addLineItem}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="space-y-2">
                  {items.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedItem = items.find(i => i.id === e.target.value)
                          if (selectedItem) {
                            updateLineItem(index, 'description', selectedItem.description)
                            updateLineItem(index, 'unitPrice', selectedItem.price)
                          }
                        }
                      }}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      defaultValue=""
                    >
                      <option value="">Select from inventory...</option>
                      {items.map((invItem) => (
                        <option key={invItem.id} value={invItem.id}>
                          {invItem.description} (€ {invItem.price.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    placeholder={items.length > 0 ? "Or enter custom description" : "Item description"}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <div className="mt-1 block w-full border border-gray-200 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm">
                  € {(item.quantity * item.unitPrice).toFixed(2)}
                </div>
              </div>
              <div className="col-span-1">
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex justify-end space-x-6">
            <div className="text-right">
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="text-lg font-medium text-gray-900">€ {calculateSubtotal().toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tax (21%)</p>
              <p className="text-lg font-medium text-gray-900">€ {calculateTax().toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">€ {calculateTotal().toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push(`/${type === 'OFFER' ? 'offers' : 'invoices'}`)}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}
