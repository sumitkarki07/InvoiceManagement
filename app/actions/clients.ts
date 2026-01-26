'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getClientsAction() {
  await requireAuth()

  return await prisma.client.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function createClientAction(formData: FormData) {
  await requireAuth()

  const name = formData.get('name') as string
  const street = formData.get('street') as string | null
  const city = formData.get('city') as string | null
  const postcode = formData.get('postcode') as string | null
  const phone = formData.get('phone') as string | null
  const vatNumber = formData.get('vatNumber') as string | null

  if (!name) {
    return { error: 'Name is required' }
  }

  try {
    const client = await prisma.client.create({
      data: {
        name,
        street: street || null,
        city: city || null,
        postcode: postcode || null,
        phone: phone || null,
        vatNumber: vatNumber || null,
      },
    })

    revalidatePath('/offers/new')
    revalidatePath('/invoices/new')
    return { success: true, client }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to create client' }
  }
}
