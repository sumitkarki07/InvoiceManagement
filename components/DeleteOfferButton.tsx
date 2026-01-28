'use client'

import { useState } from 'react'
import { deleteOfferAction } from '@/app/actions/documents'

interface DeleteOfferButtonProps {
  offerId: string
  className?: string
  label?: string
}

export default function DeleteOfferButton({
  offerId,
  className,
  label = 'Verwijderen',
}: DeleteOfferButtonProps) {
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setError(null)
    if (!confirm('Weet je zeker dat je deze offerte wilt verwijderen?')) {
      return
    }

    const result = await deleteOfferAction(offerId)
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
