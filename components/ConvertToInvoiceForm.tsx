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
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

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
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
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
        className="border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Converting...' : 'Convert to Invoice'}
      </button>
    </form>
  )
}
