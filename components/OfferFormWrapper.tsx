'use client'

import DocumentForm from './DocumentForm'
import { createOfferAction } from '@/app/actions/documents'

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

interface Item {
  id: string
  description: string
  price: number
}

interface OfferFormWrapperProps {
  clients: Client[]
  items?: Item[]
}

export default function OfferFormWrapper({ clients, items }: OfferFormWrapperProps) {
  return <DocumentForm type="OFFER" clients={clients} items={items} onSubmit={createOfferAction} />
}
