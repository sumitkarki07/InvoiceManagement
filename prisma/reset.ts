import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Reset all business data and document counters.
 * - Deletes all line items, documents, clients, counters, and items.
 * - Keeps users so you can still log in.
 * - Next offer will be OFF-YYYY-001, next invoice INV-YYYY-001.
 */
async function main() {
  const year = new Date().getFullYear()

  const deletedLineItems = await prisma.lineItem.deleteMany({})
  console.log('Deleted line items:', deletedLineItems.count)

  const deletedDocs = await prisma.document.deleteMany({})
  console.log('Deleted documents:', deletedDocs.count)

  const deletedClients = await prisma.client.deleteMany({})
  console.log('Deleted clients:', deletedClients.count)

  const deletedCounters = await prisma.counter.deleteMany({})
  console.log('Deleted counters (numbers will start from 1):', deletedCounters.count)

  const deletedItems = await prisma.item.deleteMany({})
  console.log('Deleted items:', deletedItems.count)

  console.log('\nReset complete. Next document numbers will be OFF-' + year + '-001 and INV-' + year + '-001.')
  console.log('Users were kept. Run "npm run db:seed" if you want the sample client and items back.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
