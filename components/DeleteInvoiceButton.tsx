'use client'

import { useState } from 'react'
import { deleteInvoiceAction } from '@/app/actions/documents'

interface DeleteInvoiceButtonProps {
  invoiceId: string
  className?: string
  label?: string
}

export default function DeleteInvoiceButton({
  invoiceId,
  className,
  label = 'Verwijderen',
}: DeleteInvoiceButtonProps) {
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setError(null)
    if (!confirm('Weet je zeker dat je deze factuur wilt verwijderen?')) {
      return
    }

    const result = await deleteInvoiceAction(invoiceId)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        className="text-sm font-semibold text-red-600 hover:text-red-800"
      >
        {label}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}
