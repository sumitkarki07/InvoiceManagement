import { prisma } from './db'

export type DocumentType = 'OFFER' | 'INVOICE'

/**
 * Generates a sequential document number in a transaction-safe manner.
 * Uses row-level locking to prevent race conditions.
 *
 * Format:
 * - OFFER: OFF-YYYY-001
 * - INVOICE: INV-YYYY-001
 */
export async function generateDocumentNumber(
  type: DocumentType,
  date: Date = new Date()
): Promise<string> {
  const year = date.getFullYear()
  const counterType = type === 'OFFER' ? 'OFFER' : 'INVOICE'
  const prefix = type === 'OFFER' ? 'OFF' : 'INV'

  // Use a transaction with Serializable isolation level for row-level locking
  return await prisma.$transaction(async (tx) => {
    // Try to find existing counter
    let counter = await tx.counter.findUnique({
      where: {
        type_year: {
          type: counterType,
          year,
        },
      },
    })

    if (!counter) {
      // Create new counter if it doesn't exist
      // Use upsert to handle race condition
      counter = await tx.counter.upsert({
        where: {
          type_year: {
            type: counterType,
            year,
          },
        },
        create: {
          type: counterType,
          year,
          count: 0,
        },
        update: {},
      })
    }

    // Increment count atomically
    const updated = await tx.counter.update({
      where: {
        id: counter.id,
      },
      data: {
        count: {
          increment: 1,
        },
      },
    })

    // Format: PREFIX-YYYY-XXX (with leading zeros)
    const sequenceStr = updated.count.toString().padStart(3, '0')
    return `${prefix}-${year}-${sequenceStr}`
  }, {
    isolationLevel: 'Serializable',
  })
}

export async function getNextDocumentNumberPreview(
  type: DocumentType,
  date: Date = new Date()
): Promise<string> {
  const year = date.getFullYear()
  const counterType = type === 'OFFER' ? 'OFFER' : 'INVOICE'
  const prefix = type === 'OFFER' ? 'OFF' : 'INV'

  const counter = await prisma.counter.findUnique({
    where: {
      type_year: {
        type: counterType,
        year,
      },
    },
  })

  const nextCount = (counter?.count ?? 0) + 1
  const sequenceStr = nextCount.toString().padStart(3, '0')
  return `${prefix}-${year}-${sequenceStr}`
}
