// Product Types
export interface Product {
  id: string
  model: string
  storage: string
  condition: 'new' | 'used'
  color: string
  price: number
  quantity: number
  image_url?: string
  images?: string[]
  description?: string
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

// Order Types
export interface Order {
  id: string
  customer_id?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  product_id?: string // Legacy: for backward compatibility with single-item orders
  quantity?: number // Legacy: for backward compatibility
  total_price: number
  payment_method: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'ready_for_delivery' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
  items?: OrderItem[] // New: for multi-item orders
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
  product?: Product // Populated when fetching order with products
}

// Customer Types
export interface Customer {
  id: string
  email: string
  name: string
  phone: string
  address: string
  email_consent?: boolean
  unsubscribed?: boolean
  createdAt: string
  updatedAt: string
}

// Admin Types
export interface AdminUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'super_admin'
  createdAt: string
  updatedAt: string
}

// Auth Types
export interface AuthUser {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
}

export interface JWTPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}

// Cart Types
export interface CartItem {
  id: string
  model: string
  price: number
  quantity: number
  color: string
  storage: string
}

// Checkout Types
export interface CheckoutForm {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  notes?: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Filter Types
export interface FilterOptions {
  condition?: 'new' | 'used'
  minPrice?: number
  maxPrice?: number
  model?: string
  color?: string
  storage?: string
}

// Email Config
export interface EmailConfig {
  from: string
  to: string
  subject: string
  html: string
}

// Upload Config
export interface UploadConfig {
  bucket: string
  key: string
  contentType: string
}
