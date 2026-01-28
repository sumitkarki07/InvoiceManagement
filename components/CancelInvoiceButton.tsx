'use client'

import { cancelInvoiceAction } from '@/app/actions/documents'

interface CancelInvoiceButtonProps {
  invoiceId: string
}

export default function CancelInvoiceButton({ invoiceId }: CancelInvoiceButtonProps) {
  return (
    <form action={cancelInvoiceAction.bind(null, invoiceId)}>
      <button
        type="submit"
        className="inline-flex items-center rounded-full border border-transparent bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
        onClick={(e) => {
          if (!confirm('Weet je zeker dat je deze factuur wilt annuleren?')) {
            e.preventDefault()
          }
        }}
      >
        Factuur annuleren
      </button>
    </form>
  )
}
