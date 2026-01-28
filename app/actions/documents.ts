'use server'

import { requireAuth } from '@/lib/auth'
import {
  createDocument,
  updateDocument,
  deleteDocument,
  deleteInvoice,
  deleteOffer,
  convertOfferToInvoice,
  cancelInvoice,
  type CreateDocumentInput,
  type UpdateDocumentInput,
} from '@/lib/documents'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'

async function resolveClientId(formData: FormData): Promise<{ clientId?: string; error?: string }> {
  const clientMode = (formData.get('clientMode') as string | null) || 'existing'
  const clientId = (formData.get('clientId') as string | null)?.trim()

  if (clientMode === 'existing' && clientId) {
    return { clientId }
  }

  const name = (formData.get('clientName') as string | null)?.trim()
  const street = (formData.get('clientStreet') as string | null)?.trim() || null
  const city = (formData.get('clientCity') as string | null)?.trim() || null
  const postcode = (formData.get('clientPostcode') as string | null)?.trim() || null
  const phone = (formData.get('clientPhone') as string | null)?.trim() || null
  const vatNumber = (formData.get('clientVatNumber') as string | null)?.trim() || null

  if (!name) {
    return { error: 'Client name is required' }
  }

  const client = await prisma.client.create({
    data: {
      name,
      street,
      city,
      postcode,
      phone,
      vatNumber,
    },
  })

  return { clientId: client.id }
}

export async function createOfferAction(formData: FormData) {
  await requireAuth()

  const dateStr = formData.get('date') as string
  const dueDateStr = formData.get('dueDate') as string | null
  const taxRateStr = formData.get('taxRate') as string | null

  if (!dateStr) {
    return { error: 'Date is required' }
  }

  // Parse line items from form data
  const lineItems: Array<{ description: string; quantity: number; unitPrice: number; itemId?: string }> = []
  let index = 0
  while (formData.get(`lineItems[${index}].description`)) {
    const description = formData.get(`lineItems[${index}].description`) as string
    const quantity = parseFloat(formData.get(`lineItems[${index}].quantity`) as string) || 0
    const unitPrice = parseFloat(formData.get(`lineItems[${index}].unitPrice`) as string) || 0
    const itemId = formData.get(`lineItems[${index}].itemId`) as string | null

    if (description) {
      lineItems.push({ description, quantity, unitPrice, itemId: itemId || undefined })
    }
    index++
  }

  if (lineItems.length === 0) {
    return { error: 'At least one line item is required' }
  }

  try {
    const itemIds = lineItems.map((item) => item.itemId).filter(Boolean) as string[]
    if (itemIds.length > 0) {
      const items = await prisma.item.findMany({ where: { id: { in: itemIds } } })
      const itemMap = new Map(items.map((item) => [item.id, item.description]))
      lineItems.forEach((item) => {
        if (item.itemId && itemMap.has(item.itemId)) {
          item.description = itemMap.get(item.itemId) as string
        }
      })
    }

    const clientResult = await resolveClientId(formData)
    if (clientResult.error || !clientResult.clientId) {
      return { error: clientResult.error || 'Client is required' }
    }

    const document = await createDocument({
      type: 'OFFER',
      clientId: clientResult.clientId,
      date: new Date(dateStr),
      dueDate: dueDateStr ? new Date(dueDateStr) : undefined,
      taxRate: taxRateStr ? parseFloat(taxRateStr) : undefined,
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

  const dateStr = formData.get('date') as string
  const dueDateStr = formData.get('dueDate') as string | null
  const taxRateStr = formData.get('taxRate') as string | null

  if (!dateStr) {
    return { error: 'Date is required' }
  }

  // Parse line items from form data
  const lineItems: Array<{ description: string; quantity: number; unitPrice: number; itemId?: string }> = []
  let index = 0
  while (formData.get(`lineItems[${index}].description`)) {
    const description = formData.get(`lineItems[${index}].description`) as string
    const quantity = parseFloat(formData.get(`lineItems[${index}].quantity`) as string) || 0
    const unitPrice = parseFloat(formData.get(`lineItems[${index}].unitPrice`) as string) || 0
    const itemId = formData.get(`lineItems[${index}].itemId`) as string | null

    if (description) {
      lineItems.push({ description, quantity, unitPrice, itemId: itemId || undefined })
    }
    index++
  }

  if (lineItems.length === 0) {
    return { error: 'At least one line item is required' }
  }

  try {
    const itemIds = lineItems.map((item) => item.itemId).filter(Boolean) as string[]
    if (itemIds.length > 0) {
      const items = await prisma.item.findMany({ where: { id: { in: itemIds } } })
      const itemMap = new Map(items.map((item) => [item.id, item.description]))
      lineItems.forEach((item) => {
        if (item.itemId && itemMap.has(item.itemId)) {
          item.description = itemMap.get(item.itemId) as string
        }
      })
    }

    const clientResult = await resolveClientId(formData)
    if (clientResult.error || !clientResult.clientId) {
      return { error: clientResult.error || 'Client is required' }
    }

    const document = await createDocument({
      type: 'INVOICE',
      clientId: clientResult.clientId,
      date: new Date(dateStr),
      dueDate: dueDateStr ? new Date(dueDateStr) : undefined,
      taxRate: taxRateStr ? parseFloat(taxRateStr) : undefined,
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

  const dateStr = formData.get('date') as string | null
  const dueDateStr = formData.get('dueDate') as string | null
  const taxRateStr = formData.get('taxRate') as string | null

  // Parse line items
  const lineItems: Array<{ id?: string; description: string; quantity: number; unitPrice: number; itemId?: string }> = []
  let index = 0
  while (formData.get(`lineItems[${index}].description`)) {
    const itemId = formData.get(`lineItems[${index}].id`) as string | null
    const description = formData.get(`lineItems[${index}].description`) as string
    const quantity = parseFloat(formData.get(`lineItems[${index}].quantity`) as string) || 0
    const unitPrice = parseFloat(formData.get(`lineItems[${index}].unitPrice`) as string) || 0
    const inventoryId = formData.get(`lineItems[${index}].itemId`) as string | null

    if (description) {
      lineItems.push({
        id: itemId || undefined,
        description,
        quantity,
        unitPrice,
        itemId: inventoryId || undefined,
      })
    }
    index++
  }

  try {
    const itemIds = lineItems.map((item) => item.itemId).filter(Boolean) as string[]
    if (itemIds.length > 0) {
      const items = await prisma.item.findMany({ where: { id: { in: itemIds } } })
      const itemMap = new Map(items.map((item) => [item.id, item.description]))
      lineItems.forEach((item) => {
        if (item.itemId && itemMap.has(item.itemId)) {
          item.description = itemMap.get(item.itemId) as string
        }
      })
    }

    const input: UpdateDocumentInput = {}
    const clientResult = await resolveClientId(formData)
    if (clientResult.error) {
      return { error: clientResult.error }
    }
    if (clientResult.clientId) input.clientId = clientResult.clientId
    if (dateStr) input.date = new Date(dateStr)
    if (dueDateStr) input.dueDate = new Date(dueDateStr)
    if (taxRateStr) input.taxRate = parseFloat(taxRateStr)
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

  const dateStr = formData.get('date') as string | null
  const dueDateStr = formData.get('dueDate') as string | null
  const taxRateStr = formData.get('taxRate') as string | null

  // Parse line items
  const lineItems: Array<{ id?: string; description: string; quantity: number; unitPrice: number; itemId?: string }> = []
  let index = 0
  while (formData.get(`lineItems[${index}].description`)) {
    const itemId = formData.get(`lineItems[${index}].id`) as string | null
    const description = formData.get(`lineItems[${index}].description`) as string
    const quantity = parseFloat(formData.get(`lineItems[${index}].quantity`) as string) || 0
    const unitPrice = parseFloat(formData.get(`lineItems[${index}].unitPrice`) as string) || 0
    const inventoryId = formData.get(`lineItems[${index}].itemId`) as string | null

    if (description) {
      lineItems.push({
        id: itemId || undefined,
        description,
        quantity,
        unitPrice,
        itemId: inventoryId || undefined,
      })
    }
    index++
  }

  try {
    const itemIds = lineItems.map((item) => item.itemId).filter(Boolean) as string[]
    if (itemIds.length > 0) {
      const items = await prisma.item.findMany({ where: { id: { in: itemIds } } })
      const itemMap = new Map(items.map((item) => [item.id, item.description]))
      lineItems.forEach((item) => {
        if (item.itemId && itemMap.has(item.itemId)) {
          item.description = itemMap.get(item.itemId) as string
        }
      })
    }

    const input: UpdateDocumentInput = {}
    const clientResult = await resolveClientId(formData)
    if (clientResult.error) {
      return { error: clientResult.error }
    }
    if (clientResult.clientId) input.clientId = clientResult.clientId
    if (dateStr) input.date = new Date(dateStr)
    if (dueDateStr) input.dueDate = new Date(dueDateStr)
    if (taxRateStr) input.taxRate = parseFloat(taxRateStr)
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
    await deleteOffer(id)
    revalidatePath('/offers')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete offer' }
  }
}

export async function deleteInvoiceAction(id: string) {
  await requireAuth()

  try {
    await deleteInvoice(id)
    revalidatePath('/invoices')
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to delete invoice' }
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
