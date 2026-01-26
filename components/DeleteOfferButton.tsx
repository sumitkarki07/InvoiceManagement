'use client'

import { deleteOfferAction } from '@/app/actions/documents'

interface DeleteOfferButtonProps {
  offerId: string
}

export default function DeleteOfferButton({ offerId }: DeleteOfferButtonProps) {
  return (
    <div className="mt-6">
      <form action={deleteOfferAction.bind(null, offerId)}>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          onClick={(e) => {
            if (!confirm('Are you sure you want to delete this offer?')) {
              e.preventDefault()
            }
          }}
        >
          Delete Offer
        </button>
      </form>
    </div>
  )
}
