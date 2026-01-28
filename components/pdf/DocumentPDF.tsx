import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
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

const THEME = {
  primary: '#8a3d00',
  primaryDark: '#6f2f00',
  accent: '#f4c27a',
  border: '#e5e7eb',
  text: '#111827',
  muted: '#6b7280',
}

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
  taxRate?: number
  client: Client
  lineItems: LineItem[]
  subtotal: Decimal | number
  tax: Decimal | number
  total: Decimal | number
  logoDataUrl?: string
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
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: THEME.text,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  companySection: {
    flex: 1,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  logoContainer: {
    width: 84,
    height: 84,
    marginRight: 12,
  },
  logoImage: {
    width: 84,
    height: 84,
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
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
    color: THEME.primary,
  },
  invoiceDetailRow: {
    flexDirection: 'row',
    marginBottom: 6,
    width: 200,
  },
  invoiceDetailLabel: {
    width: 100,
    fontWeight: 'bold',
    color: THEME.muted,
  },
  invoiceDetailValue: {
    width: 100,
    textAlign: 'right',
    color: THEME.text,
  },
  clientSection: {
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 6,
    padding: 12,
  },
  clientTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: THEME.primaryDark,
    letterSpacing: 1,
  },
  clientRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  clientLabel: {
    width: 120,
    fontWeight: 'bold',
    color: THEME.muted,
  },
  clientValue: {
    flex: 1,
    color: THEME.text,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: THEME.primaryDark,
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderDescription: {
    flex: 3,
    fontWeight: 'bold',
    color: THEME.primaryDark,
  },
  tableHeaderQuantity: {
    width: 80,
    fontWeight: 'bold',
    textAlign: 'right',
    color: THEME.primaryDark,
  },
  tableHeaderUnitPrice: {
    width: 100,
    fontWeight: 'bold',
    textAlign: 'right',
    color: THEME.primaryDark,
  },
  tableHeaderAmount: {
    width: 100,
    fontWeight: 'bold',
    textAlign: 'right',
    color: THEME.primaryDark,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    color: THEME.muted,
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    color: THEME.text,
  },
  totalRowFinal: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.primaryDark,
    width: 280,
  },
  totalLabelFinal: {
    width: 180,
    textAlign: 'right',
    paddingRight: 10,
    fontWeight: 'bold',
    textDecoration: 'underline',
    color: THEME.primaryDark,
  },
  totalValueFinal: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold',
    color: THEME.primaryDark,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: THEME.primaryDark,
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: THEME.primaryDark,
  },
  footerText: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 15,
  },
  footerPayment: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    marginTop: 15,
    marginBottom: 5,
  },
  logoPlaceholder: {
    width: 84,
    height: 84,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 12,
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
  taxRate = 21,
  client,
  lineItems,
  subtotal,
  tax,
  total,
  logoDataUrl,
}: DocumentPDFProps) {
  const isInvoice = type === 'INVOICE'
  const documentTitle = isInvoice ? 'FACTUUR' : 'OFFERTE'
  const numberLabel = isInvoice ? 'Factuurnummer' : 'Offertenummer'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Company Info (Left) */}
          <View style={styles.companySection}>
            <View style={styles.companyHeader}>
              {logoDataUrl ? (
                <View style={styles.logoContainer}>
                  <Image src={logoDataUrl} style={styles.logoImage} />
                </View>
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoText}>Logo</Text>
                </View>
              )}
              <View>
                <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
                <Text style={styles.companyAddress}>{COMPANY_INFO.address.street}</Text>
                <Text style={styles.companyAddress}>{COMPANY_INFO.address.city}</Text>
              </View>
            </View>
            <Text style={styles.companyContact}>Tel: {COMPANY_INFO.phone}</Text>
            <Text style={styles.companyContact}>Email: {COMPANY_INFO.email}</Text>
            <Text style={styles.companyContact}>KvK: {COMPANY_INFO.kvk}</Text>
            <Text style={styles.companyContact}>BTW: {COMPANY_INFO.btw}</Text>
          </View>

          {/* Invoice Details (Right) */}
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceTitle}>{documentTitle}</Text>
            <View style={styles.invoiceDetailRow}>
              <Text style={styles.invoiceDetailLabel}>{numberLabel}</Text>
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
            <Text style={styles.totalLabel}>BTW ({taxRate}%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
          </View>
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalLabelFinal}>Totaal</Text>
            <Text style={styles.totalValueFinal}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Footer */}
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

        {!isInvoice && (
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>VERLEGGING VAN HEFFING</Text>
            <Text style={styles.footerText}>
              Verlegging van heffing. Bij gebrek aan schriftelijke betwisting binnen een termijn van een maand na de ontvangst van de factuur, wordt de afnemer geacht te erkennen dat hij een belastingplichtige heeft gehouden tot de indiening van periodieke aangiften. Als die voorwaarde niet â‚¬ 500,00 vervuld is, is de afnemer ten aanzien van die voorwaarde aansprakelijk voor de betaling van de verschuldigde belasting, interesten en geldboete. Behoudens samenspanning tussen de partijen, is de dienstverrichter ontslagen van de aansprakelijkheid ten aanzien van de in het eerste lid bedoelde voorwaarde betreffende de hoedanigheid van de afnemer, wanneer de afnemer de factuur niet schriftelijk betwist.
            </Text>
            <Text style={styles.footerTitle}>BETALINGSCONDITIE</Text>
            <Text style={styles.footerText}>
              • Bij aanvang zal 1e termijn 50% van het totaalbedrag op het aangegeven bankrekeningnummer moeten zijn.
            </Text>
            <Text style={styles.footerText}>
              • Halve wegen het werk 2e termijn 35% van het totaalbedrag, wordt door ons aangegeven wanneer dit is. Dit bedrag zal dan binnen de 48 uur op de rekening moeten zijn.
            </Text>
            <Text style={styles.footerText}>
              • 3e termijn is bij oplevering en goedkeuring van beide partijen en deze zal in 14 dagen betaald moeten worden.
            </Text>
            <Text style={styles.footerText}>
              • Wordt er niet voldaan aan de 1e of 2e termijn zijn we genoodzaakt om de werkzaamheden op te schuiven tot de termijn betaald is.
            </Text>
            <Text style={styles.footerText}>
              • Wij behouden ons het recht om het contract als automatisch beeindigd te beschouwen als de klant na ingebrekestelling het 1e of 2e termijn nog steeds niet betaald heeft.
            </Text>
            <Text style={styles.footerPayment}>
              Deze betalingsconditie is geldig zodra de offerte getekend is.
            </Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
