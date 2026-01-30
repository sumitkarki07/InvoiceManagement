import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DocumentPDF } from '@/components/pdf/DocumentPDF'
import { renderToStream } from '@react-pdf/renderer'
import React from 'react'
import fs from 'node:fs/promises'
import path from 'node:path'

async function loadLogoDataUrl(): Promise<string | undefined> {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const buffer = await fs.readFile(logoPath)
    const base64 = buffer.toString('base64')
    return `data:image/png;base64,${base64}`
  } catch {
    return undefined
  }
}

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

    const logoDataUrl = await loadLogoDataUrl()

    const pdf = React.createElement(DocumentPDF, {
      type: document.type as 'OFFER' | 'INVOICE',
      number: document.number,
      date: document.date,
      dueDate: document.dueDate,
      taxRate: document.taxRate ?? 21,
      client: document.client as any,
      lineItems: document.lineItems as any,
      subtotal: document.subtotal,
      tax: document.tax,
      total: document.total,
      logoDataUrl,
    })

    const stream = await renderToStream(pdf as any)

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
