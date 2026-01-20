import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

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
  email: 'support@pzm.ae',
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
        const res = await fetch(`https://shop.pzm.ae/api/orders/${id}`, {
          headers: {
            'Authorization': authToken ? `Bearer ${authToken}` : '',
          },
        })
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

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!order) return <div className="p-8">Order not found.</div>

  return (
    <div className="invoice-wrapper">
      <style>{`
        @page { size: A4; margin: 16mm; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .invoice-container { max-width: 800px; margin: 0 auto; background: #fff; color: #0f172a; }
        .invoice-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; }
        .company { display: flex; align-items: center; gap: 16px; }
        .company img { height: 56px; }
        .muted { color: #6b7280; }
        .title { font-size: 24px; font-weight: 700; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .table th { text-align: left; padding: 12px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
        .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        .totals { width: 320px; margin-left: auto; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .totals-row.total { font-weight: 700; border-top: 2px solid #e5e7eb; margin-top: 4px; padding-top: 12px; }
        .footer { margin-top: 24px; font-size: 12px; color: #6b7280; }
        .badge { display:inline-block; padding:2px 8px; border-radius: 999px; background:#eef2ff; color:#3730a3; font-size:12px; }
        .actions { position: sticky; top: 0; background: #f8fafc; border-bottom: 1px solid #e5e7eb; padding: 12px; margin-bottom: 16px; }
        .btn { display:inline-block; padding:10px 14px; border-radius:8px; border:1px solid #e5e7eb; background:#111827; color:#fff; font-weight:600; }
        .btn.secondary { background:#fff; color:#111827; }
      `}</style>

      <div className="actions no-print">
        <button className="btn" onClick={() => window.print()}>Print</button>
        <span style={{ marginLeft: 12 }} />
        <button className="btn secondary" onClick={() => window.close()}>Close</button>
      </div>

      <div className="invoice-container">
        <div className="invoice-header">
          <div className="company">
            <img src={COMPANY.logo} alt="Company Logo" />
            <div>
              <div style={{ fontWeight: 700 }}>{COMPANY.name}</div>
              <div className="muted">{COMPANY.address}</div>
              <div className="muted">{COMPANY.phone} • {COMPANY.email}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="title">Invoice</div>
            <div className="muted">Invoice No: {formatOrderId(order.id)}</div>
            <div className="muted">Date: {new Date(order.created_at).toLocaleDateString()}</div>
            <div><span className="badge">Cash on Delivery</span></div>
          </div>
        </div>

        <div style={{ marginTop: 16 }} className="grid">
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Bill To</div>
            <div>{order.customer_name}</div>
            <div className="muted">{order.customer_phone}</div>
            {order.customer_email && <div className="muted">{order.customer_email}</div>}
            <div className="muted" style={{ marginTop: 4 }}>{order.customer_address}</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Notes / Terms</div>
            <div className="muted" style={{ whiteSpace: 'pre-wrap' }}>
              {order.notes || 'Payment by cash on delivery. Please have exact amount ready.'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
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

        <div style={{ marginTop: 8 }} className="totals">
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
          Thank you for your purchase! If you have questions about this invoice, contact us at {COMPANY.email} or {COMPANY.phone}.
        </div>
      </div>
    </div>
  )
}
