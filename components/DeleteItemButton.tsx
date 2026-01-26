'use client'

import { useState } from 'react'
import { deleteItemAction } from '@/app/actions/items'

export default function DeleteItemButton({
  id,
  description,
}: {
  id: string
  description: string
}) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteItemAction(id)
      setShowConfirm(false)
    } catch (error) {
      console.error('Failed to delete item:', error)
    } finally {
      setLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? 'Deleting...' : 'Confirm'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 disabled:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
    >
      Delete
    </button>
  )
}
