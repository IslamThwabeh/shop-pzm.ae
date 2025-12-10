import type { Product, Order, Customer, AdminUser } from '../../shared/types';

export class Database {
  constructor(private db: D1Database) {}

  // ============ PRODUCTS ============

  async getProducts(condition?: 'new' | 'used'): Promise<Product[]> {
    try {
      let query = 'SELECT * FROM products';
      const params: any[] = [];

      if (condition) {
        query += ' WHERE condition = ?';
        params.push(condition);
      }

      query += ' ORDER BY created_at DESC';

      const result = await this.db.prepare(query).bind(...params).all();
      return (result.results as Product[]) || [];
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
      const result = await this.db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
      return result.success;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  // ============ ORDERS ============

  async getOrders(): Promise<Order[]> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM orders ORDER BY created_at DESC')
        .all();
      return (result.results as Order[]) || [];
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
      return (result as Order) || null;
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
}
