'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { convertOfferToInvoiceAction } from '@/app/actions/documents'

interface ConvertToInvoiceFormProps {
  offerId: string
  defaultDueDate?: Date | null
}

export default function ConvertToInvoiceForm({
  offerId,
  defaultDueDate,
}: ConvertToInvoiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultDate = defaultDueDate
    ? new Date(defaultDueDate).toISOString().split('T')[0]
    : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await convertOfferToInvoiceAction(offerId, formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.success && result.invoiceId) {
      router.push(`/invoices/${result.invoiceId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded text-sm">
          {error}
        </div>
      )}
      <input
        type="date"
        name="dueDate"
        required
        defaultValue={defaultDate}
        className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center rounded-full border border-transparent bg-amber-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800 disabled:opacity-50"
      >
        {loading ? 'Omzetten...' : 'Zet om naar factuur'}
      </button>
    </form>
  )
}
