import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { buildApiUrl } from '../utils/siteConfig'

interface OrderItemProduct {
  id: string
  model: string
  storage: string
  condition: 'new' | 'used'
  color: string
  image_url?: string
  price: number
}

interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
  product?: OrderItemProduct
}

interface OrderResponse {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  notes?: string
  product_id?: string | null
  quantity?: number
  total_price: number
  payment_method: string
  status: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

// Company constants (edit if needed)
const COMPANY = {
  name: 'PZM Computers & Phones Store',
  phone: '+971 528026677',
  // Use the favicon from public for reliable printing
  logo: '/favicon.png',
  address: 'Dubai, United Arab Emirates',
}

const VAT_RATE = 0.05 // 5%
const round2 = (n: number) => Math.round(n * 100) / 100

function formatOrderId(id: string) {
  const parts = id?.split('-')
  const randomPart = parts?.[parts.length - 1] || id || '000000'
  return `PZM-${randomPart}`
}

function formatPaymentMethodLabel(value: string) {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function clearAdminSessionAndRedirect() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  window.location.replace('/admin')
}

export default function AdminInvoice() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const authToken = localStorage.getItem('adminToken')
        if (!authToken) {
          clearAdminSessionAndRedirect()
          return
        }

        const res = await fetch(buildApiUrl(`/orders/${id}`), {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        })

        if (res.status === 401 || res.status === 403) {
          clearAdminSessionAndRedirect()
          return
        }

        if (!res.ok) throw new Error('Failed to load order')
        const data = await res.json()
        setOrder(data.data || data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const lineItems = useMemo(() => {
    if (!order) return []

    if (order.items && order.items.length > 0) {
      return order.items
    }

    // Fallback for legacy single-product orders
    if (order.product_id && order.quantity) {
      return [
        {
          id: 'legacy-1',
          order_id: order.id,
          product_id: order.product_id,
          quantity: order.quantity,
          unit_price: order.total_price / order.quantity,
          subtotal: order.total_price,
          created_at: order.created_at,
        } as OrderItem,
      ]
    }

    return []
  }, [order])

  // The order total is considered GROSS (includes VAT)
  const grossTotal = useMemo(() => round2(order?.total_price ?? 0), [order])
  const vat = useMemo(() => round2(grossTotal * VAT_RATE), [grossTotal])
  const subtotal = useMemo(() => round2(grossTotal - vat), [grossTotal, vat])

  // Allocate net subtotal across items proportionally, keeping rounding consistent
  const allocatedItems = useMemo(() => {
    const items = lineItems
    if (!items.length) return [] as Array<{ item: OrderItem; netSub: number; netUnit: number; grossSub: number }>
    const itemsGrossTotal = items.reduce((sum, li) => sum + (li.subtotal || li.unit_price * li.quantity), 0)

    let remaining = subtotal
    return items.map((li, idx) => {
      const grossSub = li.subtotal || li.unit_price * li.quantity
      const netSub = itemsGrossTotal > 0
        ? round2(idx === items.length - 1 ? remaining : subtotal * (grossSub / itemsGrossTotal))
        : round2(idx === items.length - 1 ? remaining : subtotal / items.length)
      remaining = round2(remaining - netSub)
      const netUnit = round2(netSub / (li.quantity || 1))
      return { item: li, netSub, netUnit, grossSub }
    })
  }, [lineItems, subtotal])

  useEffect(() => {
    // Auto-show print dialog when ready
    let timer: number | undefined
    if (!loading && order) {
      timer = window.setTimeout(() => window.print(), 300)
    }
    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [loading, order])

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#eff8f4_0%,#f7fbff_52%,#ffffff_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-brandBorder bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-950">Loading invoice...</p>
          <p className="mt-2 text-sm text-brandTextMedium">Fetching the latest order details from the admin API.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#eff8f4_0%,#f7fbff_52%,#ffffff_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-red-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-700">Failed to load invoice</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#eff8f4_0%,#f7fbff_52%,#ffffff_100%)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-brandBorder bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-950">Order not found</p>
          <p className="mt-2 text-sm text-brandTextMedium">This invoice could not be generated because the order details are unavailable.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="invoice-wrapper">
      <style>{`
        @page { size: A4; margin: 16mm; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .invoice-wrapper { background: #ffffff !important; padding: 0 !important; }
          .invoice-shell { box-shadow: none !important; border: none !important; }
          .invoice-container { max-width: 100% !important; }
        }
        .invoice-wrapper { min-height: 100vh; background: linear-gradient(180deg, #eff8f4 0%, #f7fbff 52%, #ffffff 100%); padding: 32px 16px 56px; }
        .invoice-shell { max-width: 960px; margin: 0 auto; }
        .invoice-container { max-width: 860px; margin: 0 auto; border: 1px solid #d9e6df; border-radius: 32px; background: #ffffff; color: #0f172a; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08); overflow: hidden; }
        .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 1px solid #e5e7eb; padding: 32px; background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%); }
        .company { display: flex; align-items: center; gap: 18px; }
        .company-logo { width: 72px; height: 72px; border-radius: 22px; background: linear-gradient(135deg, #0b8a60 0%, #11a36e 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 18px 35px rgba(11, 138, 96, 0.18); }
        .company img { height: 40px; }
        .company-name { font-size: 18px; font-weight: 700; color: #020617; }
        .muted { color: #64748b; }
        .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #0b8a60; }
        .title { font-size: 28px; font-weight: 700; color: #020617; }
        .header-meta { text-align: right; }
        .header-badges { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; margin-top: 12px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 32px 0; }
        .panel { border: 1px solid #d9e6df; border-radius: 24px; background: #ffffff; padding: 20px; }
        .panel-title { font-size: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #0b8a60; margin-bottom: 10px; }
        .table-wrap { margin: 24px 32px 0; border: 1px solid #d9e6df; border-radius: 24px; overflow: hidden; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { text-align: left; padding: 14px 16px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; color: #334155; font-size: 13px; }
        .table td { padding: 14px 16px; border-bottom: 1px solid #e5e7eb; vertical-align: top; color: #0f172a; }
        .table tbody tr:last-child td { border-bottom: none; }
        .totals { width: 340px; margin: 24px 32px 0 auto; border: 1px solid #d9e6df; border-radius: 24px; padding: 18px 20px; background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%); }
        .totals-row { display: flex; justify-content: space-between; padding: 10px 0; color: #334155; }
        .totals-row.total { font-weight: 700; color: #020617; border-top: 1px solid #d9e6df; margin-top: 6px; padding-top: 14px; }
        .footer { margin: 24px 32px 32px; border-top: 1px solid #e5e7eb; padding-top: 18px; font-size: 12px; color: #64748b; }
        .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        .badge-payment { background: #eaf9f2; color: #0b8a60; }
        .badge-status { background: #e8f4fd; color: #0369a1; }
        .actions { position: sticky; top: 0; z-index: 2; display: flex; justify-content: center; gap: 12px; margin: 0 auto 20px; padding: 12px; border: 1px solid #d9e6df; border-radius: 999px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); width: fit-content; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); }
        .btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 16px; border-radius: 999px; border: 1px solid #0b8a60; background: #0b8a60; color: #ffffff; font-weight: 600; }
        .btn.secondary { border-color: #d9e6df; background: #ffffff; color: #0f172a; }
        @media (max-width: 768px) {
          .invoice-wrapper { padding: 20px 12px 40px; }
          .invoice-header { flex-direction: column; padding: 24px; }
          .header-meta { text-align: left; }
          .header-badges { justify-content: flex-start; }
          .grid { grid-template-columns: 1fr; margin: 20px 24px 0; }
          .table-wrap { margin: 20px 24px 0; }
          .totals { width: auto; margin: 20px 24px 0; }
          .footer { margin: 20px 24px 24px; }
          .actions { width: 100%; border-radius: 24px; }
        }
      `}</style>

      <div className="invoice-shell">
      <div className="actions no-print">
        <button className="btn" onClick={() => window.print()}>Print</button>
        <button className="btn secondary" onClick={() => window.close()}>Close</button>
      </div>

      <div className="invoice-container">
        <div className="invoice-header">
          <div className="company">
            <div className="company-logo">
              <img src={COMPANY.logo} alt="Company Logo" />
            </div>
            <div>
              <div className="eyebrow">PZM Invoice</div>
              <div className="company-name">{COMPANY.name}</div>
              <div className="muted">{COMPANY.address}</div>
              <div className="muted">{COMPANY.phone} • WhatsApp and phone support</div>
            </div>
          </div>
          <div className="header-meta">
            <div className="title">Invoice</div>
            <div className="muted">Invoice No: {formatOrderId(order.id)}</div>
            <div className="muted">Date: {new Date(order.created_at).toLocaleDateString()}</div>
            <div className="header-badges">
              <span className="badge badge-payment">{formatPaymentMethodLabel(order.payment_method)}</span>
              <span className="badge badge-status">{formatPaymentMethodLabel(order.status)}</span>
            </div>
          </div>
        </div>

        <div className="grid">
          <div className="panel">
            <div className="panel-title">Bill To</div>
            <div>{order.customer_name}</div>
            <div className="muted">{order.customer_phone}</div>
            {order.customer_email && <div className="muted">{order.customer_email}</div>}
            <div className="muted" style={{ marginTop: 4 }}>{order.customer_address}</div>
          </div>
          <div className="panel">
            <div className="panel-title">Notes / Terms</div>
            <div className="muted" style={{ whiteSpace: 'pre-wrap' }}>
              {order.notes || 'Payment by cash on delivery. Please have exact amount ready.'}
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '48%' }}>Item</th>
                <th>Condition</th>
                <th>Qty</th>
                <th>Unit Price (AED)</th>
                <th>Subtotal (AED)</th>
              </tr>
            </thead>
            <tbody>
              {allocatedItems.map(({ item: li, netUnit, netSub }) => {
                const name = li.product
                  ? `${li.product.model} — ${li.product.storage} — ${li.product.color}`
                  : `Product ${li.product_id}`
                const condition = li.product ? (li.product.condition === 'new' ? 'Brand New' : 'Used') : '-'
                return (
                  <tr key={li.id}>
                    <td>{name}</td>
                    <td>{condition}</td>
                    <td>{li.quantity}</td>
                    <td>{netUnit.toFixed(2)}</td>
                    <td>{netSub.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="totals">
          <div className="totals-row">
            <span>Subtotal</span>
            <span>AED {subtotal.toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <span>VAT (5%)</span>
            <span>AED {vat.toFixed(2)}</span>
          </div>
          <div className="totals-row total">
            <span>Total Due</span>
            <span>AED {grossTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="footer">
          Thank you for your purchase! If you have questions about this invoice, contact us on WhatsApp or by phone at {COMPANY.phone}.
        </div>
      </div>
      </div>
    </div>
  )
}
