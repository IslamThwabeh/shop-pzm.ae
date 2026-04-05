import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiService } from '../services/api'
import { getProductBrowsePath } from '../utils/productRouting'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    let isActive = true

    const redirectToBrowsePage = async () => {
      if (!id) {
        navigate('/services/brand-new', { replace: true })
        return
      }

      try {
        const product = await apiService.getProduct(id)

        if (!isActive) {
          return
        }

        navigate(product ? getProductBrowsePath(product) : '/services/brand-new', { replace: true })
      } catch (error) {
        console.error(error)

        if (isActive) {
          navigate('/services/brand-new', { replace: true })
        }
      }
    }

    void redirectToBrowsePage()

    return () => {
      isActive = false
    }
  }, [id, navigate])

  return (
    <div className="rounded-[28px] border border-brandBorder bg-white px-6 py-10 text-center shadow-sm md:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Catalog redirect</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">Redirecting you back to the catalog</h1>
      <p className="mt-4 text-brandTextMedium">
        Product detail pages are retired. Use the main retail pages to browse products and contact the team directly.
      </p>
    </div>
  )
}
