'use client'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import InvoiceTemplate from '@/components/InvoiceTemplate'
import { useEffect, useState } from 'react'

export default function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const [document, setDocument] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocument() {
      try {
        const { id } = await params
        const response = await fetch(`/api/invoice/${id}`)
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

  const subtotal = document.subtotal
  const tax = document.tax
  const total = document.total

  return (
    <div>
      <style>{`
        @page {
          size: A4;
          margin: 0;
          padding: 0;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          html {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.5;
          color: #000;
          background: #f5f5f5;
          margin: 0;
          padding: 10mm;
        }
        .print-wrapper {
          background: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          margin: 0 auto;
          max-width: 210mm;
          height: 297mm;
        }
      `}</style>

      <div className="no-print flex gap-4 mb-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Print Invoice
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Back
        </button>
      </div>

      <div className="print-wrapper">
        <InvoiceTemplate
          invoiceNumber={document.number}
          date={document.date}
          dueDate={document.dueDate || document.date}
          taxRate={document.taxRate}
          clientName={document.client.name}
          clientStreet={document.client.street || document.client.address}
          clientCity={document.client.city}
          clientPostcode={document.client.postcode || document.client.zipCode}
          clientPhone={document.client.phone}
          clientVatNumber={document.client.vatNumber}
          items={document.lineItems.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))}
          subtotal={subtotal}
          tax={tax}
          total={total}
        />
      </div>
    </div>
  )
}
