import type { Product, Order, OrderItem, Customer, AdminUser, ServiceRequest, WhatsAppLead } from '../../shared/types';

export class Database {
  constructor(private db: D1Database) {}

  private async ensureServiceRequestsSchema(): Promise<void> {
    await this.db.prepare(
      `CREATE TABLE IF NOT EXISTS service_requests (
         id TEXT PRIMARY KEY,
         service_type TEXT NOT NULL,
         request_kind TEXT NOT NULL CHECK(request_kind IN ('quote', 'booking', 'callback', 'availability')),
         customer_name TEXT NOT NULL,
         customer_email TEXT,
         customer_phone TEXT NOT NULL,
         customer_address TEXT,
         details TEXT NOT NULL,
         preferred_contact_method TEXT DEFAULT 'phone' CHECK(preferred_contact_method IN ('phone', 'email', 'whatsapp')),
         preferred_date TEXT,
         preferred_time_period TEXT CHECK(preferred_time_period IN ('morning', 'afternoon', 'evening')),
         source_page TEXT,
         status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled')),
         created_at TEXT NOT NULL,
         updated_at TEXT NOT NULL
       )`
    ).run();

    await this.db.prepare(
      'CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status)'
    ).run();
    await this.db.prepare(
      'CREATE INDEX IF NOT EXISTS idx_service_requests_service_type ON service_requests(service_type)'
    ).run();
    await this.db.prepare(
      'CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at)'
    ).run();
  }

  // ============ PRODUCTS ============

  async getProducts(condition?: 'new' | 'used', includeOutOfStock: boolean = false): Promise<Product[]> {
    try {
      let query = 'SELECT * FROM products';
      const params: any[] = [];

      if (condition) {
        query += ' WHERE condition = ?';
        params.push(condition);
      }

      query += ' ORDER BY created_at DESC';

      const result = await this.db.prepare(query).bind(...params).all();
      const products = (result.results as Product[]) || [];
      if (includeOutOfStock) {
        return products;
      }

      // Hide used items that are out of stock; keep new items visible regardless
      return products.filter(p => p.condition === 'used' ? (p.quantity ?? 0) > 0 : true);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM products WHERE id = ?')
        .bind(id)
        .first();
      return (result as Product) || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async createProduct(product: Product): Promise<Product> {
    try {
      await this.db
        .prepare(
          `INSERT INTO products (id, model, storage, condition, color, price, description, quantity, image_url, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          product.id,
          product.model,
          product.storage,
          product.condition,
          product.color,
          product.price,
          product.description || '',
          product.quantity,
          product.image_url || '',
          new Date().toISOString(),
          new Date().toISOString()
        )
        .run();

      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const product = await this.getProduct(id);
      if (!product) return null;

      const updated = { ...product, ...updates, updated_at: new Date().toISOString() };

      await this.db
        .prepare(
          `UPDATE products SET model = ?, storage = ?, condition = ?, color = ?, price = ?, description = ?, quantity = ?, image_url = ?, updated_at = ?
           WHERE id = ?`
        )
        .bind(
          updated.model,
          updated.storage,
          updated.condition,
          updated.color,
          updated.price,
          updated.description,
          updated.quantity,
          updated.image_url,
          updated.updated_at,
          id
        )
        .run();

      return updated;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      // Detach product references before deletion to satisfy foreign keys
      await this.db.prepare('UPDATE order_items SET product_id = NULL WHERE product_id = ?').bind(id).run();
      await this.db.prepare('UPDATE orders SET product_id = NULL WHERE product_id = ?').bind(id).run();

      // Clean up product images as well
      await this.deleteAllProductImages(id);

      const result = await this.db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
      return result.success;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // ============ PRODUCT IMAGES ============

  async getProductImages(productId: string): Promise<string[]> {
    try {
      const result = await this.db
        .prepare(
          `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY image_order ASC`
        )
        .bind(productId)
        .all();
      
      const images = (result.results as any[]) || [];
      return images.map(img => img.image_url);
    } catch (error) {
      console.error('Error fetching product images:', error);
      return [];
    }
  }

  async createProductImage(productId: string, imageUrl: string, imageOrder: number, isPrimary: boolean = false): Promise<void> {
    try {
      const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await this.db
        .prepare(
          `INSERT INTO product_images (id, product_id, image_url, image_order, is_primary, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          imageId,
          productId,
          imageUrl,
          imageOrder,
          isPrimary ? 1 : 0,
          new Date().toISOString()
        )
        .run();
    } catch (error) {
      console.error('Error creating product image:', error);
      throw error;
    }
  }

  async deleteProductImage(productId: string, imageUrl: string): Promise<boolean> {
    try {
      const result = await this.db
        .prepare('DELETE FROM product_images WHERE product_id = ? AND image_url = ?')
        .bind(productId, imageUrl)
        .run();
      return result.success;
    } catch (error) {
      console.error('Error deleting product image:', error);
      return false;
    }
  }

  async deleteAllProductImages(productId: string): Promise<boolean> {
    try {
      const result = await this.db
        .prepare('DELETE FROM product_images WHERE product_id = ?')
        .bind(productId)
        .run();
      return result.success;
    } catch (error) {
      console.error('Error deleting product images:', error);
      return false;
    }
  }

  // ============ ORDERS ============

  async getOrders(): Promise<Order[]> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM orders ORDER BY created_at DESC')
        .all();
      const orders = (result.results as Order[]) || [];
      
      // Fetch items for each order
      for (const order of orders) {
        order.items = await this.getOrderItems(order.id);
      }
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getOrder(id: string): Promise<Order | null> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM orders WHERE id = ?')
        .bind(id)
        .first();
      const order = (result as Order) || null;
      
      if (order) {
        // Fetch items for this order
        order.items = await this.getOrderItems(order.id);
      }
      
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  async createOrder(order: Order): Promise<Order> {
    try {
      await this.db
        .prepare(
          `INSERT INTO orders (id, customer_id, customer_name, customer_email, customer_phone, customer_address, product_id, quantity, total_price, payment_method, status, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          order.id,
          order.customer_id || null,
          order.customer_name,
          order.customer_email,
          order.customer_phone,
          order.customer_address,
          order.product_id,
          order.quantity,
          order.total_price,
          order.payment_method,
          order.status,
          order.notes || '',
          new Date().toISOString(),
          new Date().toISOString()
        )
        .run();

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    try {
      const order = await this.getOrder(id);
      if (!order) return null;

      const updated = { ...order, ...updates, updated_at: new Date().toISOString() };

      await this.db
        .prepare(
          `UPDATE orders SET customer_id = ?, customer_name = ?, customer_email = ?, customer_phone = ?, customer_address = ?, product_id = ?, quantity = ?, total_price = ?, payment_method = ?, status = ?, notes = ?, updated_at = ?
           WHERE id = ?`
        )
        .bind(
          updated.customer_id,
          updated.customer_name,
          updated.customer_email,
          updated.customer_phone,
          updated.customer_address,
          updated.product_id,
          updated.quantity,
          updated.total_price,
          updated.payment_method,
          updated.status,
          updated.notes,
          updated.updated_at,
          id
        )
        .run();

      return updated;
    } catch (error) {
      console.error('Error updating order:', error);
      return null;
    }
  }

  // ============ ORDER ITEMS ============

  async createOrderItem(item: OrderItem): Promise<OrderItem> {
    try {
      await this.db
        .prepare(
          `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          item.id,
          item.order_id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.subtotal,
          item.created_at
        )
        .run();

      return item;
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const result = await this.db
        .prepare(
          `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, oi.subtotal, oi.created_at,
                  p.id as p_id, p.model, p.storage, p.condition, p.color, p.image_url, p.price
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?
           ORDER BY oi.created_at ASC`
        )
        .bind(orderId)
        .all();
      
      const items = (result.results as any[]) || [];
      
      // Transform to OrderItem with product data
      return items.map(item => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        created_at: item.created_at,
        product: item.p_id ? {
          id: item.p_id,
          model: item.model,
          storage: item.storage,
          condition: item.condition,
          color: item.color,
          image_url: item.image_url,
          price: item.price,
          quantity: 0, // Not relevant in this context
        } as Product : undefined
      }));
    } catch (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
  }

  async decrementProductQuantity(productId: string, amount: number): Promise<boolean> {
    try {
      const result = await this.db
        .prepare('UPDATE products SET quantity = quantity - ?, updated_at = ? WHERE id = ? AND quantity >= ?')
        .bind(amount, new Date().toISOString(), productId, amount)
        .run();
      return result.success;
    } catch (error) {
      console.error('Error decrementing product quantity:', error);
      return false;
    }
  }

  // ============ SERVICE REQUESTS ============

  async getServiceRequests(): Promise<ServiceRequest[]> {
    try {
      await this.ensureServiceRequestsSchema();
      const result = await this.db
        .prepare('SELECT * FROM service_requests ORDER BY created_at DESC')
        .all();
      return (result.results as ServiceRequest[]) || [];
    } catch (error) {
      console.error('Error fetching service requests:', error);
      return [];
    }
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | null> {
    try {
      await this.ensureServiceRequestsSchema();
      const result = await this.db
        .prepare('SELECT * FROM service_requests WHERE id = ?')
        .bind(id)
        .first();
      return (result as ServiceRequest) || null;
    } catch (error) {
      console.error('Error fetching service request:', error);
      return null;
    }
  }

  async createServiceRequest(request: ServiceRequest): Promise<ServiceRequest> {
    try {
      await this.ensureServiceRequestsSchema();
      await this.db
        .prepare(
          `INSERT INTO service_requests (
             id,
             service_type,
             request_kind,
             customer_name,
             customer_email,
             customer_phone,
             customer_address,
             details,
             preferred_contact_method,
             preferred_date,
             preferred_time_period,
             source_page,
             status,
             created_at,
             updated_at
           )
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          request.id,
          request.service_type,
          request.request_kind,
          request.customer_name,
          request.customer_email || null,
          request.customer_phone,
          request.customer_address || null,
          request.details,
          request.preferred_contact_method || 'phone',
          request.preferred_date || null,
          request.preferred_time_period || null,
          request.source_page || null,
          request.status,
          request.created_at,
          request.updated_at
        )
        .run();

      return request;
    } catch (error) {
      console.error('Error creating service request:', error);
      throw error;
    }
  }

  async updateServiceRequest(id: string, updates: Partial<ServiceRequest>): Promise<ServiceRequest | null> {
    try {
      await this.ensureServiceRequestsSchema();
      const request = await this.getServiceRequest(id);
      if (!request) return null;

      const updated = { ...request, ...updates, updated_at: new Date().toISOString() };

      await this.db
        .prepare(
          `UPDATE service_requests SET
             service_type = ?,
             request_kind = ?,
             customer_name = ?,
             customer_email = ?,
             customer_phone = ?,
             customer_address = ?,
             details = ?,
             preferred_contact_method = ?,
             preferred_date = ?,
             preferred_time_period = ?,
             source_page = ?,
             status = ?,
             updated_at = ?
           WHERE id = ?`
        )
        .bind(
          updated.service_type,
          updated.request_kind,
          updated.customer_name,
          updated.customer_email || null,
          updated.customer_phone,
          updated.customer_address || null,
          updated.details,
          updated.preferred_contact_method || 'phone',
          updated.preferred_date || null,
          updated.preferred_time_period || null,
          updated.source_page || null,
          updated.status,
          updated.updated_at,
          id
        )
        .run();

      return updated;
    } catch (error) {
      console.error('Error updating service request:', error);
      return null;
    }
  }

  // ============ WHATSAPP LEADS ============

  async getWhatsAppLeads(): Promise<WhatsAppLead[]> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM whatsapp_leads ORDER BY created_at DESC')
        .all();
      return (result.results as WhatsAppLead[]) || [];
    } catch (error) {
      console.error('Error fetching whatsapp leads:', error);
      return [];
    }
  }

  async getWhatsAppLead(id: string): Promise<WhatsAppLead | null> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM whatsapp_leads WHERE id = ?')
        .bind(id)
        .first();
      return (result as WhatsAppLead) || null;
    } catch (error) {
      console.error('Error fetching whatsapp lead:', error);
      return null;
    }
  }

  async createWhatsAppLead(lead: WhatsAppLead): Promise<WhatsAppLead> {
    try {
      await this.db
        .prepare(
          `INSERT INTO whatsapp_leads (id, lead_type, reference_id, reference_label, reference_price, source_page, whatsapp_message, status, notes, ip_address, city, country, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          lead.id,
          lead.lead_type,
          lead.reference_id || null,
          lead.reference_label,
          lead.reference_price ?? null,
          lead.source_page || null,
          lead.whatsapp_message,
          lead.status,
          lead.notes || null,
          lead.ip_address || null,
          lead.city || null,
          lead.country || null,
          lead.created_at,
          lead.updated_at
        )
        .run();

      return lead;
    } catch (error) {
      console.error('Error creating whatsapp lead:', error);
      throw error;
    }
  }

  async updateWhatsAppLead(id: string, updates: Partial<WhatsAppLead>): Promise<WhatsAppLead | null> {
    try {
      const lead = await this.getWhatsAppLead(id);
      if (!lead) return null;

      const updated = { ...lead, ...updates, updated_at: new Date().toISOString() };

      await this.db
        .prepare(
          `UPDATE whatsapp_leads SET status = ?, notes = ?, updated_at = ? WHERE id = ?`
        )
        .bind(
          updated.status,
          updated.notes || null,
          updated.updated_at,
          id
        )
        .run();

      return updated;
    } catch (error) {
      console.error('Error updating whatsapp lead:', error);
      return null;
    }
  }

  // ============ ADMIN ============

  async getAdminByUsername(username: string): Promise<AdminUser | null> {
    try {
      const result = await this.db
        .prepare('SELECT id, username, email, role, created_at FROM admin_users WHERE username = ?')
        .bind(username)
        .first();
      return (result as AdminUser) || null;
    } catch (error) {
      console.error('Error fetching admin:', error);
      return null;
    }
  }

  async getAdminPasswordHash(username: string): Promise<string | null> {
    try {
      const result = await this.db
        .prepare('SELECT password_hash FROM admin_users WHERE username = ?')
        .bind(username)
        .first();
      return (result as any)?.password_hash || null;
    } catch (error) {
      console.error('Error fetching admin password:', error);
      return null;
    }
  }

  // ============ REPORTS ============

  async getCountsSince(sinceIso: string): Promise<{ orders: number; serviceRequests: number; whatsappLeads: number }> {
    try {
      const [ordersRes, srRes, walRes] = await Promise.all([
        this.db.prepare('SELECT COUNT(*) as cnt FROM orders WHERE created_at >= ?').bind(sinceIso).first(),
        this.db.prepare('SELECT COUNT(*) as cnt FROM service_requests WHERE created_at >= ?').bind(sinceIso).first(),
        this.db.prepare('SELECT COUNT(*) as cnt FROM whatsapp_leads WHERE created_at >= ?').bind(sinceIso).first(),
      ]);
      return {
        orders: (ordersRes as any)?.cnt ?? 0,
        serviceRequests: (srRes as any)?.cnt ?? 0,
        whatsappLeads: (walRes as any)?.cnt ?? 0,
      };
    } catch (error) {
      console.error('Error fetching report counts:', error);
      return { orders: 0, serviceRequests: 0, whatsappLeads: 0 };
    }
  }

  async getRecentWhatsAppLeads(sinceIso: string): Promise<WhatsAppLead[]> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM whatsapp_leads WHERE created_at >= ? ORDER BY created_at DESC LIMIT 50')
        .bind(sinceIso)
        .all();
      return (result.results as WhatsAppLead[]) || [];
    } catch (error) {
      console.error('Error fetching recent whatsapp leads:', error);
      return [];
    }
  }

  async getRecentServiceRequests(sinceIso: string): Promise<ServiceRequest[]> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM service_requests WHERE created_at >= ? ORDER BY created_at DESC LIMIT 50')
        .bind(sinceIso)
        .all();
      return (result.results as ServiceRequest[]) || [];
    } catch (error) {
      console.error('Error fetching recent service requests:', error);
      return [];
    }
  }

  async getLeadCountsByRegion(sinceIso: string, untilIso?: string): Promise<{ uae: number; other: number }> {
    try {
      const untilClause = untilIso ? ' AND created_at < ?' : '';
      const bindings = untilIso ? [sinceIso, untilIso] : [sinceIso];

      const [uaeRes, totalRes] = await Promise.all([
        this.db.prepare(`SELECT COUNT(*) as cnt FROM whatsapp_leads WHERE created_at >= ? ${untilClause} AND country = 'AE'`).bind(...bindings).first(),
        this.db.prepare(`SELECT COUNT(*) as cnt FROM whatsapp_leads WHERE created_at >= ? ${untilClause}`).bind(...bindings).first(),
      ]);

      const uae = (uaeRes as any)?.cnt ?? 0;
      const total = (totalRes as any)?.cnt ?? 0;
      return { uae, other: total - uae };
    } catch (error) {
      console.error('Error fetching lead counts by region:', error);
      return { uae: 0, other: 0 };
    }
  }
}
