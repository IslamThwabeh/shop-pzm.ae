
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
