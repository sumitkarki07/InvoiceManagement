'use client'

import { deleteInvoiceAction } from '@/app/actions/documents'

interface DeleteInvoiceButtonProps {
  invoiceId: string
}

export default function DeleteInvoiceButton({ invoiceId }: DeleteInvoiceButtonProps) {
  return (
    <div className="mt-6">
      <form action={deleteInvoiceAction.bind(null, invoiceId)}>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          onClick={(e) => {
            if (!confirm('Are you sure you want to delete this invoice?')) {
              e.preventDefault()
            }
          }}
        >
          Delete Invoice
        </button>
      </form>
    </div>
  )
}
