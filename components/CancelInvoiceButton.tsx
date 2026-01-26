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
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        onClick={(e) => {
          if (!confirm('Are you sure you want to cancel this invoice?')) {
            e.preventDefault()
          }
        }}
      >
        Cancel Invoice
      </button>
    </form>
  )
}
