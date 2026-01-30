'use client'

import { cancelInvoiceAction } from '@/app/actions/documents'
import { useTransition } from 'react'

interface CancelInvoiceButtonProps {
  invoiceId: string
}

export default function CancelInvoiceButton({ invoiceId }: CancelInvoiceButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleCancel = () => {
    if (!confirm('Weet je zeker dat je deze factuur wilt annuleren?')) {
      return
    }

    startTransition(async () => {
      const result = await cancelInvoiceAction(invoiceId)
      if (result.error) {
        alert(`Error: ${result.error}`)
      }
    })
  }

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="inline-flex items-center rounded-full border border-transparent bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'Annuleren...' : 'Factuur annuleren'}
    </button>
  )
}
