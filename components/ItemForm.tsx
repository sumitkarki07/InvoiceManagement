'use client'

import { useState, useRef } from 'react'
import { createItemAction } from '@/app/actions/items'

export default function ItemForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await createItemAction(formData)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        setSuccess(true)
        formRef.current?.reset()
        setLoading(false)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          name="description"
          required
          placeholder="e.g., Cement, Sand, Labor"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price (€)
        </label>
        <input
          type="number"
          name="price"
          required
          step="0.01"
          min="0"
          placeholder="0.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">✓ Item saved successfully!</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? 'Creating...' : 'Create Item'}
      </button>
    </form>
  )
}
