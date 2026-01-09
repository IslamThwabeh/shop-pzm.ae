import { useNavigate, useParams } from 'react-router-dom'
import ProductDetail from './ProductDetail'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Product ID missing</p>
      </div>
    )
  }

  return (
    <ProductDetail
      productId={id}
      onBack={() => navigate('/')}
      onCheckout={() => navigate('/checkout')}
    />
  )
}
