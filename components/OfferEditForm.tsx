'use client'

import DocumentForm from './DocumentForm'
import { updateOfferAction } from '@/app/actions/documents'
import { Decimal } from '@prisma/client/runtime/library'

interface Client {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
}

interface OfferEditFormProps {
  offerId: string
  clients: Client[]
  initialData: {
    id: string
    clientId: string
    date: string
    dueDate?: string | null
    lineItems: Array<{
      id?: string
      description: string
      quantity: number
      unitPrice: number
    }>
  }
}

export default function OfferEditForm({
  offerId,
  clients,
  initialData,
}: OfferEditFormProps) {
  return (
    <DocumentForm
      type="OFFER"
      clients={clients}
      initialData={initialData}
      onSubmit={updateOfferAction.bind(null, offerId)}
    />
  )
}
