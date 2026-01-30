'use client'

import React, { useEffect, useState } from 'react'
import { DocumentPDF } from '@/components/pdf/DocumentPDF'
import { PDFViewer } from '@react-pdf/renderer'

export default function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const [document, setDocument] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string>('')

  useEffect(() => {
    async function fetchDocument() {
      try {
        const resolvedParams = await params
        setId(resolvedParams.id)
        const response = await fetch(`/api/invoice/${resolvedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          setDocument(data)
        }
      } catch (error) {
        console.error('Failed to fetch invoice:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDocument()
  }, [params])

  if (loading) {
    return <div className="p-8 text-center">Loading invoice...</div>
  }

  if (!document) {
    return <div className="p-8 text-center text-red-600">Invoice not found</div>
  }

  const pdf = React.createElement(DocumentPDF, {
    type: 'INVOICE',
    number: document.number,
    date: new Date(document.date),
    dueDate: document.dueDate ? new Date(document.dueDate) : undefined,
    taxRate: document.taxRate || 21,
    client: {
      name: document.client.name || '',
      street: document.client.street || document.client.address,
      city: document.client.city,
      postcode: document.client.postcode || document.client.zipCode,
      phone: document.client.phone,
      vatNumber: document.client.vatNumber,
    },
    lineItems: document.lineItems.map((item: any) => ({
      description: item.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      amount: item.amount || 0,
    })),
    subtotal: document.subtotal || 0,
    tax: document.tax || 0,
    total: document.total || 0,
  })

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white shadow-sm p-4 flex gap-3">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          Print Invoice
        </button>
        <button
          onClick={() => {
            const link = document.createElement('a')
            link.href = `/api/pdf/${id}`
            link.download = `invoice-${document.number}.pdf`
            link.click()
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
        >
          Download PDF
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-medium"
        >
          Back
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <PDFViewer style={{ width: '100%', height: '100%' }}>
          {pdf as any}
        </PDFViewer>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .bg-gray-100 {
            background: white;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
