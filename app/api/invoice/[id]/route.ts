import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        client: true,
        lineItems: true,
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: document.id,
      number: document.number,
      type: document.type,
      date: document.date.toISOString(),
      dueDate: document.dueDate?.toISOString() || null,
      subtotal: parseFloat((document as any).subtotal?.toString() || '0'),
      tax: parseFloat((document as any).tax?.toString() || '0'),
      total: parseFloat((document as any).total?.toString() || '0'),
      client: {
        name: document.client.name,
        address: document.client.address,
        city: document.client.city,
        zipCode: document.client.zipCode,
        phone: document.client.phone,
      },
      lineItems: (document.lineItems as any[]).map((item) => ({
        description: item.description,
        quantity: parseFloat(item.quantity?.toString() || '0'),
        unitPrice: parseFloat(item.unitPrice?.toString() || '0'),
      })),
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}
