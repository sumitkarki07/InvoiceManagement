'use server'

import { requireAuth } from '@/lib/auth'
import {
  createDocument,
  updateDocument,
  deleteDocument,
  convertOfferToInvoice,
  cancelInvoice,
  type CreateDocumentInput,
  type UpdateDocumentInput,
} from '@/lib/documents'
import { revalidatePath } from 'next/cache'

export async function createOfferAction(formData: FormData) {
  await requireAuth()

  const clientId = formData.get('clientId') as string
  const dateStr = formData.get('date') as string
  const dueDateStr = formData.get('dueDate') as string | null

  if (!clientId || !dateStr) {
    return { error: 'Client and date are required' }
  }

  // Parse line items from form data
  const lineItems: Array<{ description: string; quantity: number; unitPrice: number }> = []
  let index = 0
  while (formData.get(`lineItems[${index}].description`)) {
    const description = formData.get(`lineItems[${index}].description`) as string
    const quantity = parseFloat(formData.get(`lineItems[${index}].quantity`) as string) || 0
    const unitPrice = parseFloat(formData.get(`lineItems[${index}].unitPrice`) as string) || 0

    if (description) {
      lineItems.push({ description, quantity, unitPrice })
    }
    index++
  }

  if (lineItems.length === 0) {
    return { error: 'At least one line item is required' }
  }

  try {
    const document = await createDocument({
      type: 'OFFER',
      clientId,
      date: new Date(dateStr),
      dueDate: dueDateStr ? new Date(dueDateStr) : undefined,
      lineItems,
    })

    revalidatePath('/offers')
    return { success: true, documentId: document.id }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create offer' }
  }
}

export async function createInvoiceAction(formData: FormData) {
  await requireAuth()

  const clientId = formData.get('clientId') as string
  const dateStr = formData.get('date') as string
  const dueDateStr = formData.get('dueDate') as string | null

  if (!clientId || !dateStr || !dueDateStr) {
    return { error: 'Client, date, and due date are required' }
  }

  // Parse line items from form data
  const lineItems: Array<{ description: string; quantity: number; unitPrice: number }> = []
  let index = 0
  while (formData.get(`lineItems[${index}].description`)) {
    const description = formData.get(`lineItems[${index}].description`) as string
    const quantity = parseFloat(formData.get(`lineItems[${index}].quantity`) as string) || 0
    const unitPrice = parseFloat(formData.get(`lineItems[${index}].unitPrice`) as string) || 0

    if (description) {
      lineItems.push({ description, quantity, unitPrice })
    }
    index++
  }

  if (lineItems.length === 0) {
    return { error: 'At least one line item is required' }
  }

  try {
    const document = await createDocument({
      type: 'INVOICE',
      clientId,
      date: new Date(dateStr),
      dueDate: new Date(dueDateStr),
      lineItems,
    })

    revalidatePath('/invoices')
    return { success: true, documentId: document.id }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create invoice' }
  }
}

export async function updateOfferAction(id: string, formData: FormData) {
  await requireAuth()

  const clientId = formData.get('clientId') as string | null
  const dateStr = formData.get('date') as string | null
  const dueDateStr = formData.get('dueDate') as string | null

  // Parse line items
  const lineItems: Array<{ id?: string; description: string; quantity: number; unitPrice: number }> = []
  let index = 0
  while (formData.get(`lineItems[${index}].description`)) {
    const itemId = formData.get(`lineItems[${index}].id`) as string | null
    const description = formData.get(`lineItems[${index}].description`) as string
    const quantity = parseFloat(formData.get(`lineItems[${index}].quantity`) as string) || 0
    const unitPrice = parseFloat(formData.get(`lineItems[${index}].unitPrice`) as string) || 0

    if (description) {
      lineItems.push({
        id: itemId || undefined,
        description,
        quantity,
        unitPrice,
      })
    }
    index++
  }

  try {
    const input: UpdateDocumentInput = {}
    if (clientId) input.clientId = clientId
    if (dateStr) input.date = new Date(dateStr)
    if (dueDateStr) input.dueDate = new Date(dueDateStr)
    if (lineItems.length > 0) input.lineItems = lineItems

    await updateDocument(id, input)
    revalidatePath('/offers')
    revalidatePath(`/offers/${id}`)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update offer' }
  }
}

export async function updateInvoiceAction(id: string, formData: FormData) {
  await requireAuth()

  const clientId = formData.get('clientId') as string | null
  const dateStr = formData.get('date') as string | null
  const dueDateStr = formData.get('dueDate') as string | null

  // Parse line items
  const lineItems: Array<{ id?: string; description: string; quantity: number; unitPrice: number }> = []
  let index = 0
  while (formData.get(`lineItems[${index}].description`)) {
    const itemId = formData.get(`lineItems[${index}].id`) as string | null
    const description = formData.get(`lineItems[${index}].description`) as string
    const quantity = parseFloat(formData.get(`lineItems[${index}].quantity`) as string) || 0
    const unitPrice = parseFloat(formData.get(`lineItems[${index}].unitPrice`) as string) || 0

    if (description) {
      lineItems.push({
        id: itemId || undefined,
        description,
        quantity,
        unitPrice,
      })
    }
    index++
  }

  try {
    const input: UpdateDocumentInput = {}
    if (clientId) input.clientId = clientId
    if (dateStr) input.date = new Date(dateStr)
    if (dueDateStr) input.dueDate = new Date(dueDateStr)
    if (lineItems.length > 0) input.lineItems = lineItems

    await updateDocument(id, input)
    revalidatePath('/invoices')
    revalidatePath(`/invoices/${id}`)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update invoice' }
  }
}

export async function deleteOfferAction(id: string) {
  await requireAuth()

  try {
    await deleteDocument(id)
    revalidatePath('/offers')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete offer' }
  }
}

export async function convertOfferToInvoiceAction(offerId: string, formData: FormData) {
  await requireAuth()

  const dueDateStr = formData.get('dueDate') as string | null

  try {
    const invoice = await convertOfferToInvoice(
      offerId,
      dueDateStr ? new Date(dueDateStr) : undefined
    )
    revalidatePath('/offers')
    revalidatePath('/invoices')
    return { success: true, invoiceId: invoice.id }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to convert offer' }
  }
}

export async function cancelInvoiceAction(id: string) {
  await requireAuth()

  try {
    await cancelInvoice(id)
    revalidatePath('/invoices')
    revalidatePath(`/invoices/${id}`)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to cancel invoice' }
  }
}
