import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { Decimal } from '@prisma/client/runtime/library'

// Company information (should be configurable in production)
const COMPANY_INFO = {
  name: 'Allround bouwbedrijf JP',
  address: {
    street: 'Grimbeerstraat 16C',
    city: '6217 BE Maastricht',
  },
  phone: '+31 6 44063955',
  email: 'AllroundbouwbedrijfJP@hotmail.com',
  kvk: '97906018',
  btw: 'NL005298395B09',
  bankAccount: 'NL34 INGB 0114 3485 37',
}

const TAX_RATE = 0.21

interface LineItem {
  description: string
  quantity: Decimal | number
  unitPrice: Decimal | number
  amount: Decimal | number
}

interface Client {
  name: string
  street?: string | null
  city?: string | null
  postcode?: string | null
  phone?: string | null
  vatNumber?: string | null
}

interface DocumentPDFProps {
  type: 'OFFER' | 'INVOICE'
  number: string
  date: Date
  dueDate?: Date | null
  client: Client
  lineItems: LineItem[]
  subtotal: Decimal | number
  tax: Decimal | number
  total: Decimal | number
}

// Helper to format numbers as Dutch currency
function formatCurrency(amount: Decimal | number): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount.toString())
  return `€ ${num.toFixed(2).replace('.', ',')}`
}

// Helper to format numbers with Dutch decimal separator
function formatNumber(num: Decimal | number): string {
  const value = typeof num === 'number' ? num : parseFloat(num.toString())
  return value.toFixed(2).replace('.', ',')
}

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#000',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  companySection: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  companyAddress: {
    marginBottom: 4,
    fontSize: 10,
  },
  companyContact: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 10,
  },
  invoiceDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Times-Roman',
  },
  invoiceDetailRow: {
    flexDirection: 'row',
    marginBottom: 6,
    width: 200,
  },
  invoiceDetailLabel: {
    width: 100,
    fontWeight: 'bold',
  },
  invoiceDetailValue: {
    width: 100,
    textAlign: 'right',
  },
  clientSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  clientTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  clientRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  clientLabel: {
    width: 120,
    fontWeight: 'bold',
  },
  clientValue: {
    flex: 1,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderDescription: {
    flex: 3,
    fontWeight: 'bold',
  },
  tableHeaderQuantity: {
    width: 80,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tableHeaderUnitPrice: {
    width: 100,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tableHeaderAmount: {
    width: 100,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tableCellDescription: {
    flex: 3,
  },
  tableCellQuantity: {
    width: 80,
    textAlign: 'right',
  },
  tableCellUnitPrice: {
    width: 100,
    textAlign: 'right',
  },
  tableCellAmount: {
    width: 100,
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 6,
    width: 280,
  },
  totalLabel: {
    width: 180,
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
  },
  totalRowFinal: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: 280,
  },
  totalLabelFinal: {
    width: 180,
    textAlign: 'right',
    paddingRight: 10,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  totalValueFinal: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 15,
  },
  footerPayment: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  logoPlaceholder: {
    width: 100,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 8,
    color: '#666',
  },
})

export function DocumentPDF({
  type,
  number,
  date,
  dueDate,
  client,
  lineItems,
  subtotal,
  tax,
  total,
}: DocumentPDFProps) {
  const isInvoice = type === 'INVOICE'
  const documentTitle = isInvoice ? 'FACTUUR' : 'OFFERTE'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Company Info (Left) */}
          <View style={styles.companySection}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>Logo</Text>
            </View>
            <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
            <Text style={styles.companyAddress}>{COMPANY_INFO.address.street}</Text>
            <Text style={styles.companyAddress}>{COMPANY_INFO.address.city}</Text>
            <Text style={styles.companyContact}>Tel: {COMPANY_INFO.phone}</Text>
            <Text style={styles.companyContact}>Email: {COMPANY_INFO.email}</Text>
            <Text style={styles.companyContact}>KvK: {COMPANY_INFO.kvk}</Text>
            <Text style={styles.companyContact}>BTW: {COMPANY_INFO.btw}</Text>
          </View>

          {/* Invoice Details (Right) */}
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceTitle}>{documentTitle}</Text>
            <View style={styles.invoiceDetailRow}>
              <Text style={styles.invoiceDetailLabel}>Factuurnummer</Text>
              <Text style={styles.invoiceDetailValue}>{number}</Text>
            </View>
            <View style={styles.invoiceDetailRow}>
              <Text style={styles.invoiceDetailLabel}>Datum</Text>
              <Text style={styles.invoiceDetailValue}>{formatDate(date)}</Text>
            </View>
            {dueDate && (
              <View style={styles.invoiceDetailRow}>
                <Text style={styles.invoiceDetailLabel}>Vervaldatum</Text>
                <Text style={styles.invoiceDetailValue}>{formatDate(dueDate)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Client Section */}
        <View style={styles.clientSection}>
          <Text style={styles.clientTitle}>KLANT</Text>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Naam</Text>
            <Text style={styles.clientValue}>{client.name}</Text>
          </View>
          {client.street && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Straat</Text>
              <Text style={styles.clientValue}>{client.street}</Text>
            </View>
          )}
          {(client.city || client.postcode) && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Plaats + Postcode</Text>
              <Text style={styles.clientValue}>
                {[client.city, client.postcode].filter(Boolean).join(' ')}
              </Text>
            </View>
          )}
          {client.phone && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Telefoon</Text>
              <Text style={styles.clientValue}>{client.phone}</Text>
            </View>
          )}
          {client.vatNumber && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>BTW nummer</Text>
              <Text style={styles.clientValue}>{client.vatNumber}</Text>
            </View>
          )}
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderDescription}>Beschrijving</Text>
            <Text style={styles.tableHeaderQuantity}>Aantal</Text>
            <Text style={styles.tableHeaderUnitPrice}>Eenheidsprijs</Text>
            <Text style={styles.tableHeaderAmount}>Bedrag</Text>
          </View>
          {lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCellDescription}>{item.description}</Text>
              <Text style={styles.tableCellQuantity}>{formatNumber(item.quantity)}</Text>
              <Text style={styles.tableCellUnitPrice}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.tableCellAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotaal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>BTW (21%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
          </View>
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalLabelFinal}>Totaal</Text>
            <Text style={styles.totalValueFinal}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Footer (Invoice Only) */}
        {isInvoice && (
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>VERLEGGING VAN HEFFING</Text>
            <Text style={styles.footerText}>
              Verlegging van heffing. Bij gebrek aan schriftelijke betwisting binnen een termijn van een maand na de ontvangst van de factuur, wordt de afnemer geacht te erkennen dat hij een belastingplichtige is gehouden tot de indiening van periodieke aangiften. Als die voorwaarde niet € 500,00 vervuld is, is de afnemer ten aanzien van die voorwaarde aansprakelijk voor de betaling van de verschuldigde belasting, interesten en geldboeten. Behoudens samenspanning tussen de partijen, is de dienstverrichter ontslagen van de aansprakelijkheid ten aanzien van de in het eerste lid bedoelde voorwaarde betreffende de hoedanigheid van de afnemer, wanneer de afnemer de factuur niet schriftelijk betwist.
            </Text>
            <Text style={styles.footerPayment}>
              OGM te vermelden bij betaling: Factuur No. {number}
            </Text>
            <Text style={styles.footerPayment}>
              Gelieve het bedrag van {formatCurrency(total)} te betalen voor {dueDate ? formatDate(dueDate) : ''} op rekeningnummer {COMPANY_INFO.bankAccount}.
            </Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
