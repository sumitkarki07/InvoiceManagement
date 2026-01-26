'use client'

'use client'

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
}

interface InvoiceTemplateProps {
  invoiceNumber: string
  date: string
  dueDate: string
  clientName: string
  clientStreet?: string
  clientCity?: string
  clientPostcode?: string
  clientPhone?: string
  items: LineItem[]
  subtotal: number
  tax: number
  total: number
  companyName?: string
  companyStreet?: string
  companyCity?: string
  companyPostcode?: string
  companyPhone?: string
  companyEmail?: string
  companyKvK?: string
  companyVatNumber?: string
}

export default function InvoiceTemplate({
  invoiceNumber,
  date,
  dueDate,
  clientName,
  clientStreet,
  clientCity,
  clientPostcode,
  clientPhone,
  clientVatNumber,
  items,
  subtotal,
  tax,
  total,
  companyName = 'Grishma Bill',
  companyStreet = 'Straatnaam 123',
  companyCity = 'Amsterdam',
  companyPostcode = '1000 AA',
  companyPhone = '+31 20 1234567',
  companyEmail = 'info@grishmabill.nl',
  companyKvK = '34123456',
  companyVatNumber = 'NL123456789B01',
}: InvoiceTemplateProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="invoice-container">
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .invoice-container {
            margin: 0;
            padding: 0;
            width: 100%;
          }
          .invoice-page {
            page-break-after: avoid;
            margin: 0;
            padding: 0;
          }
          .invoice-header {
            page-break-after: avoid;
          }
          .invoice-items {
            page-break-inside: avoid;
          }
          .invoice-totals {
            page-break-before: avoid;
          }
        }
      `}</style>

      <div className="invoice-page bg-white">
        {/* Header Section */}
        <div className="invoice-header p-20" style={{ paddingTop: '25mm', paddingBottom: '20mm', paddingLeft: '25mm', paddingRight: '25mm' }}>
          <div className="flex justify-between items-start gap-8">
            {/* Left Column: Company Info */}
            <div className="flex-1" style={{ maxWidth: '60%' }}>
              <div className="space-y-1" style={{ lineHeight: '1.6' }}>
                <div className="font-bold text-base">{companyName}</div>
                <div className="text-sm">{companyStreet}</div>
                <div className="text-sm">{companyPostcode} {companyCity}</div>
                <div className="text-sm">{companyPhone}</div>
                <div className="text-sm">{companyEmail}</div>
                <div className="text-xs text-gray-600 mt-2">KvK: {companyKvK}</div>
                <div className="text-xs text-gray-600">BTW: {companyVatNumber}</div>
              </div>
            </div>

            {/* Right Column: Invoice Meta */}
            <div className="flex-0" style={{ minWidth: '200px' }}>
              <div className="space-y-3" style={{ lineHeight: '1.8' }}>
                <div className="flex justify-between gap-6">
                  <span className="text-sm font-medium text-gray-700">Factuurnummer</span>
                  <span className="text-sm font-bold">{invoiceNumber}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-sm font-medium text-gray-700">Datum</span>
                  <span className="text-sm">{formatDate(date)}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-sm font-medium text-gray-700">Vervaldatum</span>
                  <span className="text-sm">{formatDate(dueDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center py-12" style={{ paddingLeft: '25mm', paddingRight: '25mm', letterSpacing: '0.15em' }}>
          <h1 className="text-4xl font-bold tracking-widest">FACTUUR</h1>
        </div>

        {/* Client Section */}
        <div className="px-20" style={{ paddingLeft: '25mm', paddingRight: '25mm', paddingBottom: '20mm' }}>
          <div className="uppercase text-sm font-bold mb-4" style={{ letterSpacing: '0.05em' }}>
            Klant
          </div>
          <div className="space-y-1" style={{ lineHeight: '1.6' }}>
            <div className="text-sm font-medium">{clientName}</div>
            {clientStreet && <div className="text-sm">{clientStreet}</div>}
            {clientPostcode && clientCity && <div className="text-sm">{clientPostcode} {clientCity}</div>}
            {clientPhone && <div className="text-sm">{clientPhone}</div>}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="invoice-items px-20" style={{ paddingLeft: '25mm', paddingRight: '25mm', paddingBottom: '20mm' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left text-sm font-bold py-3 pr-4">Beschrijving</th>
                <th className="text-right text-sm font-bold py-3 px-4" style={{ width: '12%' }}>Aantal</th>
                <th className="text-right text-sm font-bold py-3 px-4" style={{ width: '18%' }}>Eenheidsprijs</th>
                <th className="text-right text-sm font-bold py-3 pl-4" style={{ width: '18%' }}>Bedrag</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200" style={{ lineHeight: '1.8' }}>
                  <td className="text-sm py-3 pr-4">{item.description}</td>
                  <td className="text-sm py-3 px-4 text-right">{item.quantity.toFixed(2)}</td>
                  <td className="text-sm py-3 px-4 text-right">€ {item.unitPrice.toFixed(2)}</td>
                  <td className="text-sm py-3 pl-4 text-right font-medium">€ {(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="invoice-totals px-20" style={{ paddingLeft: '25mm', paddingRight: '25mm', paddingBottom: '20mm' }}>
          <div className="flex justify-end">
            <div style={{ width: '300px' }}>
              <div className="flex justify-between text-sm py-2 border-t-2 border-gray-800 mt-4">
                <span>Subtotaal</span>
                <span>€ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span>BTW (21%)</span>
                <span>€ {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold py-3 border-t-2 border-gray-800">
                <span>Totaal</span>
                <span>€ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="px-20 py-8" style={{ paddingLeft: '25mm', paddingRight: '25mm', backgroundColor: '#f9f9f9' }}>
          <h3 className="text-xs font-bold uppercase mb-3" style={{ letterSpacing: '0.05em' }}>
            Verlegging van heffing
          </h3>
          <p className="text-xs leading-relaxed text-gray-700">
            Deze factuur is onderworpen aan verlegging van heffing. Dit betekent dat de basissnelheid van belastingen op uw bedrijf van toepassing is.
          </p>
        </div>

        {/* Payment Section */}
        <div className="px-20 py-8" style={{ paddingLeft: '25mm', paddingRight: '25mm' }}>
          <div className="text-xs space-y-2">
            <div className="font-medium">
              Betaling dient binnen 14 dagen te worden verricht
            </div>
            <div className="text-gray-700">
              Gegevens voor overschrijving:<br />
              Rekeningnummer: NL91 ABNA 0123 4567 89<br />
              Naam begunstigde: {companyName}<br />
              Referentie: {invoiceNumber}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
