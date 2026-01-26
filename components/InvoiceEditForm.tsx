'use client'

import DocumentForm from './DocumentForm'
import { updateInvoiceAction } from '@/app/actions/documents'

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

interface InvoiceEditFormProps {
  invoiceId: string
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

export default function InvoiceEditForm({
  invoiceId,
  clients,
  initialData,
}: InvoiceEditFormProps) {
  return (
    <DocumentForm
      type="INVOICE"
      clients={clients}
      initialData={initialData}
      onSubmit={updateInvoiceAction.bind(null, invoiceId)}
    />
  )
}
