import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DocumentPDF } from '@/components/pdf/DocumentPDF'
import { renderToStream } from '@react-pdf/renderer'
import React from 'react'

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

    const pdf = React.createElement(DocumentPDF, {
      type: document.type as 'OFFER' | 'INVOICE',
      number: document.number,
      date: document.date,
      dueDate: document.dueDate,
      client: document.client,
      lineItems: document.lineItems,
      subtotal: document.subtotal,
      tax: document.tax,
      total: document.total,
    })

    const stream = await renderToStream(pdf)

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.type}-${document.number}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
