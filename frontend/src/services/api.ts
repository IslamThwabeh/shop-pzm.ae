import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Product {
  id: string
  model: string
  storage: string
  condition: 'new' | 'used'
  color: string
  price: number
  quantity: number
  images: string[]
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Order {
  id: string
  customerId: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  totalPrice: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export const apiService = {
  // Products
  getProducts: async (filters?: {
    condition?: 'new' | 'used'
    minPrice?: number
    maxPrice?: number
    model?: string
  }): Promise<Product[]> => {
    try {
      const response = await api.get('/products', { params: filters })
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to fetch products:', error)
      return []
    }
  },

  getProduct: async (id: string): Promise<Product | null> => {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to fetch product:', error)
      return null
    }
  },

  // Orders
  createOrder: async (order: {
    items: Array<{ productId: string; quantity: number }>
    customerName: string
    customerEmail: string
    customerPhone: string
    customerAddress: string
    notes?: string
  }): Promise<Order | null> => {
    try {
      const response = await api.post('/orders', order)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to create order:', error)
      return null
    }
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get('/orders')
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      return []
    }
  },

  getOrder: async (id: string): Promise<Order | null> => {
    try {
      const response = await api.get(`/orders/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to fetch order:', error)
      return null
    }
  },

  // Admin
  createProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
    try {
      const response = await api.post('/admin/products', product)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to create product:', error)
      return null
    }
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product | null> => {
    try {
      const response = await api.put(`/admin/products/${id}`, product)
      return response.data.data || response.data
    } catch (error) {
      console.error('Failed to update product:', error)
      return null
    }
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/admin/products/${id}`)
      return true
    } catch (error) {
      console.error('Failed to delete product:', error)
      return false
    }
  },

  uploadImage: async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data.url || response.data
    } catch (error) {
      console.error('Failed to upload image:', error)
      return null
    }
  },

  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: any } | null> => {
    try {
      const response = await api.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      console.error('Failed to login:', error)
      return null
    }
  },

  register: async (email: string, password: string, name: string): Promise<{ token: string; user: any } | null> => {
    try {
      const response = await api.post('/auth/register', { email, password, name })
      return response.data
    } catch (error) {
      console.error('Failed to register:', error)
      return null
    }
  },
}
