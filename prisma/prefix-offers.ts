import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const offers = await prisma.document.findMany({
    where: {
      type: 'OFFER',
      NOT: {
        number: {
          startsWith: 'OFF-',
        },
      },
    },
    select: {
      id: true,
      number: true,
    },
  })

  console.log(`Found ${offers.length} offer(s) to update`)

  for (const offer of offers) {
    const newNumber = offer.number.startsWith('OFF-') ? offer.number : `OFF-${offer.number}`
    await prisma.document.update({
      where: { id: offer.id },
      data: { number: newNumber },
    })
    console.log(`Updated offer ${offer.id}: ${offer.number} -> ${newNumber}`)
  }

  console.log('Done updating offer numbers.')
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

