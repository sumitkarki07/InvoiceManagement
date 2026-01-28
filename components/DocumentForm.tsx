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
  selectedItemId?: string
  extraDescription?: string
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
    taxRate?: number | null
    lineItems: LineItem[]
  }
  onSubmit: (formData: FormData) => Promise<{ success?: boolean; error?: string; documentId?: string }>
}

const DEFAULT_INVOICE_DUE_DAYS = 15
const DEFAULT_TAX_RATE = 21

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatDateInput(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toISOString().split('T')[0]
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
  const [clientMode, setClientMode] = useState<'existing' | 'new'>(() => {
    if (initialData?.clientId) return 'existing'
    return 'new'
  })
  const [dateValue, setDateValue] = useState<string>(
    initialData?.date ? formatDateInput(initialData.date) : formatDateInput(new Date())
  )
  const [dueDateValue, setDueDateValue] = useState<string>(() => {
    if (initialData?.dueDate) {
      return formatDateInput(initialData.dueDate)
    }
    if (type === 'INVOICE') {
      return formatDateInput(addDays(new Date(), DEFAULT_INVOICE_DUE_DAYS))
    }
    return ''
  })
  const [dueDateTouched, setDueDateTouched] = useState<boolean>(Boolean(initialData?.dueDate))
  const [taxRate, setTaxRate] = useState<number>(
    typeof initialData?.taxRate === 'number' ? initialData.taxRate : DEFAULT_TAX_RATE
  )
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.lineItems || [{ description: '', quantity: 0, unitPrice: 0 }]
  )

  useEffect(() => {
    if (type !== 'INVOICE') return
    if (dueDateTouched) return

    const baseDate = new Date(dateValue)
    const autoDueDate = addDays(baseDate, DEFAULT_INVOICE_DUE_DAYS)
    setDueDateValue(formatDateInput(autoDueDate))
  }, [dateValue, dueDateTouched, type])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    // Add line items to form data
    lineItems.forEach((item, index) => {
      const selectedDescription = item.selectedItemId
        ? items.find((inv) => inv.id === item.selectedItemId)?.description || ''
        : ''
      const extraText = (item.extraDescription || '').trim()
      const descriptionToSave = selectedDescription
        ? extraText
          ? `${selectedDescription} - ${extraText}`
          : selectedDescription
        : item.description

      if (item.id) formData.append(`lineItems[${index}].id`, item.id)
      if (item.selectedItemId) formData.append(`lineItems[${index}].itemId`, item.selectedItemId)
      formData.append(`lineItems[${index}].description`, descriptionToSave)
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

  const updateLineItemFields = (index: number, updates: Partial<LineItem>) => {
    setLineItems((current) => {
      const updated = [...current]
      updated[index] = { ...updated[index], ...updates }
      return updated
    })
  }

  const getSelectedDescription = (item: LineItem) => {
    if (!item.selectedItemId) return ''
    return items.find((inv) => inv.id === item.selectedItemId)?.description || ''
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="clientMode" value={clientMode} />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-amber-100 bg-white px-4 py-5 shadow-sm sm:p-6">
        {type === 'INVOICE' && (
          <p className="mb-4 text-sm text-amber-800">
            Vervaldatum wordt automatisch {DEFAULT_INVOICE_DUE_DAYS} dagen na de factuurdatum gezet.
          </p>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-amber-900">Klant *</label>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-amber-800">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="clientModeSelect"
                  checked={clientMode === 'existing'}
                  onChange={() => setClientMode('existing')}
                  className="text-amber-700"
                />
                Bestaande klant
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="clientModeSelect"
                  checked={clientMode === 'new'}
                  onChange={() => setClientMode('new')}
                  className="text-amber-700"
                />
                Nieuwe klant
              </label>
            </div>
            <select
              id="clientId"
              name="clientId"
              required={clientMode === 'existing'}
              disabled={clientMode !== 'existing'}
              defaultValue={initialData?.clientId || ''}
              className="mt-3 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:cursor-not-allowed disabled:bg-amber-50"
            >
              <option value="">Selecteer een klant</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-amber-900">
              Datum *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {type === 'INVOICE' && (
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-amber-900">
                Vervaldatum *
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                required
                value={dueDateValue}
                min={dateValue}
                onChange={(e) => {
                  setDueDateTouched(true)
                  setDueDateValue(e.target.value)
                }}
                className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          )}

          {type === 'OFFER' && (
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-amber-900">
                Vervaldatum (optioneel)
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                defaultValue={initialData?.dueDate ? formatDateInput(initialData.dueDate) : ''}
                className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          )}
        </div>

        {clientMode === 'new' && (
          <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50/30 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="clientName" className="block text-sm font-medium text-amber-900">
                  Naam *
                </label>
                <input
                  id="clientName"
                  name="clientName"
                  required={clientMode === 'new'}
                  className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label htmlFor="clientStreet" className="block text-sm font-medium text-amber-900">
                  Straat
                </label>
                <input
                  id="clientStreet"
                  name="clientStreet"
                  className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-amber-900">Plaats + Postcode</label>
                <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    id="clientPostcode"
                    name="clientPostcode"
                    placeholder="1234 AB"
                    className="block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <input
                    id="clientCity"
                    name="clientCity"
                    placeholder="Plaats"
                    className="block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="clientPhone" className="block text-sm font-medium text-amber-900">
                  Telefoon
                </label>
                <input
                  id="clientPhone"
                  name="clientPhone"
                  className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="clientVatNumber" className="block text-sm font-medium text-amber-900">
                  BTW nummer
                </label>
                <input
                  id="clientVatNumber"
                  name="clientVatNumber"
                  className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-amber-100 bg-white px-4 py-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-amber-900">Regels</h3>
          <button
            type="button"
            onClick={addLineItem}
            className="inline-flex items-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 shadow-sm transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
          >
            + Regel toevoegen
          </button>
        </div>

        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 items-end gap-4 rounded-xl border border-amber-100 bg-amber-50/40 p-4"
            >
              <div className="col-span-5">
                <label className="mb-1 block text-sm font-medium text-amber-900">Beschrijving</label>
                <div className="space-y-2">
                  {items.length > 0 && (
                    <select
                      value={item.selectedItemId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedItem = items.find(i => i.id === e.target.value)
                          if (selectedItem) {
                            updateLineItemFields(index, {
                              selectedItemId: selectedItem.id,
                              description: selectedItem.description,
                              unitPrice: selectedItem.price,
                              extraDescription: '',
                            })
                          }
                        } else {
                          updateLineItemFields(index, {
                            selectedItemId: '',
                          })
                        }
                      }}
                      className="block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">Kies uit inventaris...</option>
                      {items.map((invItem) => (
                        <option key={invItem.id} value={invItem.id}>
                          {invItem.description} (€ {invItem.price.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    value={item.selectedItemId ? (item.extraDescription || '') : item.description}
                    onChange={(e) => {
                      if (item.selectedItemId) {
                        updateLineItem(index, 'extraDescription', e.target.value)
                      } else {
                        updateLineItem(index, 'description', e.target.value)
                      }
                    }}
                    placeholder={
                      item.selectedItemId
                        ? 'Optionele extra beschrijving'
                        : items.length > 0
                        ? 'Of voer een eigen beschrijving in'
                        : 'Beschrijf de regel'
                    }
                    className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-amber-900">Aantal</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  required
                  className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-amber-900">Eenheidsprijs</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  required
                  className="mt-1 block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-amber-900">Bedrag</label>
                <div className="mt-1 block w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 shadow-sm">
                  € {(item.quantity * item.unitPrice).toFixed(2)}
                </div>
              </div>
              <div className="col-span-1">
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="text-sm font-medium text-red-600 transition hover:text-red-800"
                  >
                    Verwijder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-amber-100 pt-4">
          <div className="ml-auto w-full max-w-sm space-y-3 text-amber-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-amber-700">Subtotaal</span>
              <span className="text-lg font-semibold">€ {calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-amber-700">
                <span>BTW (%)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="taxRate"
                  value={Number.isNaN(taxRate) ? '' : taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-20 rounded-lg border border-amber-200 bg-white px-2 py-1 text-sm text-amber-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <span className="text-lg font-semibold">€ {calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-amber-100 pt-3">
              <span className="text-sm text-amber-700">Totaal</span>
              <span className="text-xl font-bold">€ {calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(`/${type === 'OFFER' ? 'offers' : 'invoices'}`)}
          className="rounded-full border border-amber-300 bg-white px-5 py-2 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
        >
          {type === 'INVOICE' ? 'Factuur historie' : 'Offerte historie'}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-full border border-transparent bg-amber-700 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading
            ? 'Opslaan...'
            : initialData
            ? 'Bijwerken'
            : type === 'OFFER'
            ? 'Offerte opslaan'
            : 'Factuur opslaan'}
        </button>
      </div>
    </form>
  )
}



