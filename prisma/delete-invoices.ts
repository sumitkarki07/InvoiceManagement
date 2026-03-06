import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const deletedInvoices = await prisma.document.deleteMany({
    where: { type: 'INVOICE' },
  })
  console.log('Deleted invoices:', deletedInvoices.count)

  const deletedInvoiceCounters = await prisma.counter.deleteMany({
    where: { type: 'INVOICE' },
  })
  console.log('Deleted invoice counters:', deletedInvoiceCounters.count)
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

