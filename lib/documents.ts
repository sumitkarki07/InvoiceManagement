import { prisma } from './db'
import { generateDocumentNumber } from './numbering'
import { Decimal } from '@prisma/client/runtime/library'

export type DocumentType = 'OFFER' | 'INVOICE'

export interface CreateDocumentInput {
  type: DocumentType
  clientId: string
  date: Date
  dueDate?: Date
  lineItems: Array<{
    description: string
    quantity: number
    unitPrice: number
  }>
}

export interface UpdateDocumentInput {
  clientId?: string
  date?: Date
  dueDate?: Date
  lineItems?: Array<{
    id?: string
    description: string
    quantity: number
    unitPrice: number
  }>
}

function calculateTotals(lineItems: Array<{ quantity: number; unitPrice: number }>) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const tax = subtotal * 0.21 // 21% VAT
  const total = subtotal + tax

  return {
    subtotal: new Decimal(subtotal.toFixed(2)),
    tax: new Decimal(tax.toFixed(2)),
    total: new Decimal(total.toFixed(2)),
  }
}

export async function createDocument(input: CreateDocumentInput) {
  const { subtotal, tax, total } = calculateTotals(input.lineItems)

  // Generate document number
  const number = await generateDocumentNumber(input.type, input.date)

  // Create document with line items in a transaction
  const document = await prisma.document.create({
    data: {
      type: input.type,
      number,
      date: input.date,
      dueDate: input.dueDate,
      clientId: input.clientId,
      subtotal,
      tax,
      total,
      lineItems: {
        create: input.lineItems.map((item) => ({
          description: item.description,
          quantity: new Decimal(item.quantity.toFixed(2)),
          unitPrice: new Decimal(item.unitPrice.toFixed(2)),
          amount: new Decimal((item.quantity * item.unitPrice).toFixed(2)),
        })),
      },
    },
    include: {
      client: true,
      lineItems: true,
    },
  })

  return document
}

export async function updateDocument(id: string, input: UpdateDocumentInput) {
  const document = await prisma.document.findUnique({
    where: { id },
    include: { lineItems: true },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  // Prevent updates to invoices that are not in DRAFT status
  if (document.type === 'INVOICE' && document.status !== 'DRAFT') {
    throw new Error('Cannot update invoice that is not in draft status')
  }

  // Get existing or new line items
  const lineItems = input.lineItems || document.lineItems.map((li) => ({
    id: li.id,
    description: li.description,
    quantity: parseFloat(li.quantity.toString()),
    unitPrice: parseFloat(li.unitPrice.toString()),
  }))

  const { subtotal, tax, total } = calculateTotals(lineItems)

  // Update document and line items in a transaction
  const updated = await prisma.$transaction(async (tx) => {
    // Delete existing line items
    await tx.lineItem.deleteMany({
      where: { documentId: id },
    })

    // Update document
    const doc = await tx.document.update({
      where: { id },
      data: {
        clientId: input.clientId ?? document.clientId,
        date: input.date ?? document.date,
        dueDate: input.dueDate ?? document.dueDate,
        subtotal,
        tax,
        total,
        lineItems: {
          create: lineItems.map((item) => ({
            description: item.description,
            quantity: new Decimal(item.quantity.toFixed(2)),
            unitPrice: new Decimal(item.unitPrice.toFixed(2)),
            amount: new Decimal((item.quantity * item.unitPrice).toFixed(2)),
          })),
        },
      },
      include: {
        client: true,
        lineItems: true,
      },
    })

    return doc
  })

  return updated
}

export async function deleteDocument(id: string) {
  const document = await prisma.document.findUnique({
    where: { id },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  // Only allow deletion of offers
  if (document.type === 'INVOICE') {
    throw new Error('Invoices cannot be deleted. Use cancellation instead.')
  }

  // Only allow deletion of drafts
  if (document.status !== 'DRAFT') {
    throw new Error('Only draft documents can be deleted')
  }

  await prisma.document.delete({
    where: { id },
  })
}

export async function convertOfferToInvoice(offerId: string, dueDate?: Date) {
  return await prisma.$transaction(async (tx) => {
    // Get the offer with all related data
    const offer = await tx.document.findUnique({
      where: { id: offerId },
      include: {
        client: true,
        lineItems: true,
      },
    })

    if (!offer) {
      throw new Error('Offer not found')
    }

    if (offer.type !== 'OFFER') {
      throw new Error('Document is not an offer')
    }

    if (offer.status === 'CONVERTED') {
      throw new Error('Offer has already been converted')
    }

    // Generate new invoice number
    const invoiceNumber = await generateDocumentNumber('INVOICE', new Date())

    // Create invoice from offer
    const invoice = await tx.document.create({
      data: {
        type: 'INVOICE',
        number: invoiceNumber,
        date: new Date(),
        dueDate: dueDate || (offer.dueDate ? new Date(offer.dueDate) : undefined),
        clientId: offer.clientId,
        subtotal: offer.subtotal,
        tax: offer.tax,
        total: offer.total,
        status: 'DRAFT',
        lineItems: {
          create: offer.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        },
      },
      include: {
        client: true,
        lineItems: true,
      },
    })

    // Mark offer as converted
    await tx.document.update({
      where: { id: offerId },
      data: {
        status: 'CONVERTED',
      },
    })

    return invoice
  })
}

export async function cancelInvoice(id: string) {
  const document = await prisma.document.findUnique({
    where: { id },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.type !== 'INVOICE') {
    throw new Error('Only invoices can be cancelled')
  }

  await prisma.document.update({
    where: { id },
    data: {
      status: 'CANCELLED',
    },
  })
}
