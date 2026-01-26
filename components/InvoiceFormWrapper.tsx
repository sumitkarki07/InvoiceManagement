'use client'

import DocumentForm from './DocumentForm'
import { createInvoiceAction } from '@/app/actions/documents'

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

interface InvoiceFormWrapperProps {
  clients: Client[]
  items?: Item[]
}

export default function InvoiceFormWrapper({ clients, items }: InvoiceFormWrapperProps) {
  return <DocumentForm type="INVOICE" clients={clients} items={items} onSubmit={createInvoiceAction} />
}
