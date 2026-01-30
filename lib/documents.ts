import { prisma } from './db'
import { generateDocumentNumber } from './numbering'
import { Decimal } from '@prisma/client/runtime/library'

export type DocumentType = 'OFFER' | 'INVOICE'

export interface CreateDocumentInput {
  type: DocumentType
  clientId: string
  date: Date
  dueDate?: Date
  taxRate?: number
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
  taxRate?: number
  lineItems?: Array<{
    id?: string
    description: string
    quantity: number
    unitPrice: number
  }>
}

const DEFAULT_INVOICE_DUE_DAYS = 15
const DEFAULT_TAX_RATE = 21

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function resolveInvoiceDueDate(date: Date, dueDate?: Date): Date {
  return dueDate ?? addDays(date, DEFAULT_INVOICE_DUE_DAYS)
}

function calculateTotals(
  lineItems: Array<{ quantity: number; unitPrice: number }>,
  taxRate: number
) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  return {
    subtotal: new Decimal(subtotal.toFixed(2)),
    tax: new Decimal(tax.toFixed(2)),
    total: new Decimal(total.toFixed(2)),
  }
}

export async function createDocument(input: CreateDocumentInput) {
  const taxRate = input.taxRate ?? DEFAULT_TAX_RATE
  const { subtotal, tax, total } = calculateTotals(input.lineItems, taxRate)

  // Generate document number
  const number = await generateDocumentNumber(input.type, input.date)

  const resolvedDueDate =
    input.type === 'INVOICE'
      ? resolveInvoiceDueDate(input.date, input.dueDate)
      : input.dueDate

  // Create document with line items in a transaction
  const document = await prisma.document.create({
    data: {
      type: input.type,
      number,
      date: input.date,
      dueDate: resolvedDueDate,
      clientId: input.clientId,
      taxRate,
      subtotal: parseFloat(subtotal.toString()),
      tax: parseFloat(tax.toString()),
      total: parseFloat(total.toString()),
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

  const taxRate = input.taxRate ?? document.taxRate ?? DEFAULT_TAX_RATE
  const { subtotal, tax, total } = calculateTotals(lineItems, taxRate)

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
        taxRate,
        subtotal: parseFloat(subtotal.toString()),
        tax: parseFloat(tax.toString()),
        total: parseFloat(total.toString()),
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

export async function deleteInvoice(id: string) {
  const document = await prisma.document.findUnique({
    where: { id },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.type !== 'INVOICE') {
    throw new Error('Only invoices can be deleted')
  }

  await prisma.document.delete({
    where: { id },
  })
}

export async function deleteOffer(id: string) {
  const document = await prisma.document.findUnique({
    where: { id },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.type !== 'OFFER') {
    throw new Error('Only offers can be deleted')
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

    const invoiceDate = new Date()
    const resolvedDueDate = resolveInvoiceDueDate(
      invoiceDate,
      dueDate || (offer.dueDate ? new Date(offer.dueDate) : undefined)
    )

    // Create invoice from offer
    const invoice = await tx.document.create({
      data: {
        type: 'INVOICE',
        number: invoiceNumber,
        date: invoiceDate,
        dueDate: resolvedDueDate,
        clientId: offer.clientId,
        taxRate: offer.taxRate ?? DEFAULT_TAX_RATE,
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
