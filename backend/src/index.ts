import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Database } from './db';
import { AuthService } from './auth';
import { EmailService } from './email';
import { StorageService } from './storage';
import { getCorsHeaders, handleCors, generateId, validateRequired, parseRequestBody, logRequest, logError } from './utils';
import type { Product, Order } from '../../shared/types';

interface Env {
  DB: D1Database;
  KV: KVNamespace;
  BUCKET: R2Bucket;
  ADMIN_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use(
  '*',
  cors({
    origin: ['https://pzm.ae', 'https://www.pzm.ae', 'http://localhost:5173', 'http://localhost:3000'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// ============ PRODUCTS API ============

app.get('/api/products', async (c) => {
  try {
    logRequest('GET', '/api/products');
    const db = new Database(c.env.DB);
    const condition = c.req.query('condition');
    const products = await db.getProducts(condition as 'new' | 'used' | undefined);
    return c.json({ data: products, status: 200 }, 200);
  } catch (error) {
    logError(error, 'GET /api/products');
    return c.json({ error: 'Failed to fetch products', status: 500 }, 500);
  }
});

app.get('/api/products/:id', async (c) => {
  try {
    const productId = c.req.param('id');
    logRequest('GET', `/api/products/${productId}`);
    const db = new Database(c.env.DB);
    const product = await db.getProduct(productId);
    if (!product) {
      return c.json({ error: 'Product not found', status: 404 }, 404);
    }
    return c.json({ data: product, status: 200 }, 200);
  } catch (error) {
    logError(error, 'GET /api/products/:id');
    return c.json({ error: 'Failed to fetch product', status: 500 }, 500);
  }
});

app.post('/api/products', async (c) => {
  try {
    logRequest('POST', '/api/products');
    const authService = new AuthService(c.env.ADMIN_SECRET);
    const authHeader = c.req.header('Authorization');
    const token = authService.extractToken(authHeader);

    if (!token) {
      return c.json({ error: 'Unauthorized', status: 401 }, 401);
    }

    const payload = await authService.verifyToken(token);
    if (!payload || payload.type !== 'admin') {
      return c.json({ error: 'Forbidden', status: 403 }, 403);
    }

    const body = await parseRequestBody(c);
    if (!body) {
      return c.json({ error: 'Invalid request body', status: 400 }, 400);
    }

    const validation = validateRequired(body, ['model', 'storage', 'condition', 'color', 'price']);
    if (validation) {
      return c.json({ error: validation, status: 400 }, 400);
    }

    const db = new Database(c.env.DB);
    const product: Product = {
      id: generateId('prod'),
      model: body.model,
      storage: body.storage,
      condition: body.condition,
      color: body.color,
      price: body.price,
      description: body.description,
      quantity: body.quantity || 0,
      image_url: body.image_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await db.createProduct(product);
    return c.json({ data: created, status: 201 }, 201);
  } catch (error) {
    logError(error, 'POST /api/products');
    return c.json({ error: 'Failed to create product', status: 500 }, 500);
  }
});

app.put('/api/products/:id', async (c) => {
  try {
    const productId = c.req.param('id');
    logRequest('PUT', `/api/products/${productId}`);
    const authService = new AuthService(c.env.ADMIN_SECRET);
    const authHeader = c.req.header('Authorization');
    const token = authService.extractToken(authHeader);

    if (!token) {
      return c.json({ error: 'Unauthorized', status: 401 }, 401);
    }

    const payload = await authService.verifyToken(token);
    if (!payload || payload.type !== 'admin') {
      return c.json({ error: 'Forbidden', status: 403 }, 403);
    }

    const body = await parseRequestBody(c);
    if (!body) {
      return c.json({ error: 'Invalid request body', status: 400 }, 400);
    }

    const db = new Database(c.env.DB);
    const product = await db.updateProduct(productId, body);

    if (!product) {
      return c.json({ error: 'Product not found', status: 404 }, 404);
    }

    return c.json({ data: product, status: 200 }, 200);
  } catch (error) {
    logError(error, 'PUT /api/products/:id');
    return c.json({ error: 'Failed to update product', status: 500 }, 500);
  }
});

app.delete('/api/products/:id', async (c) => {
  try {
    const productId = c.req.param('id');
    logRequest('DELETE', `/api/products/${productId}`);
    const authService = new AuthService(c.env.ADMIN_SECRET);
    const authHeader = c.req.header('Authorization');
    const token = authService.extractToken(authHeader);

    if (!token) {
      return c.json({ error: 'Unauthorized', status: 401 }, 401);
    }

    const payload = await authService.verifyToken(token);
    if (!payload || payload.type !== 'admin') {
      return c.json({ error: 'Forbidden', status: 403 }, 403);
    }

    const db = new Database(c.env.DB);
    const success = await db.deleteProduct(productId);

    if (!success) {
      return c.json({ error: 'Product not found', status: 404 }, 404);
    }

    return c.json({ data: { success: true }, status: 200 }, 200);
  } catch (error) {
    logError(error, 'DELETE /api/products/:id');
    return c.json({ error: 'Failed to delete product', status: 500 }, 500);
  }
});

// ============ ORDERS API ============

app.get('/api/orders', async (c) => {
  try {
    logRequest('GET', '/api/orders');
    const authService = new AuthService(c.env.ADMIN_SECRET);
    const authHeader = c.req.header('Authorization');
    const token = authService.extractToken(authHeader);

    if (!token) {
      return c.json({ error: 'Unauthorized', status: 401 }, 401);
    }

    const payload = await authService.verifyToken(token);
    if (!payload || payload.type !== 'admin') {
      return c.json({ error: 'Forbidden', status: 403 }, 403);
    }

    const db = new Database(c.env.DB);
    const orders = await db.getOrders();
    return c.json({ data: orders, status: 200 }, 200);
  } catch (error) {
    logError(error, 'GET /api/orders');
    return c.json({ error: 'Failed to fetch orders', status: 500 }, 500);
  }
});

app.get('/api/orders/:id', async (c) => {
  try {
    const orderId = c.req.param('id');
    logRequest('GET', `/api/orders/${orderId}`);
    const db = new Database(c.env.DB);
    const order = await db.getOrder(orderId);
    if (!order) {
      return c.json({ error: 'Order not found', status: 404 }, 404);
    }
    return c.json({ data: order, status: 200 }, 200);
  } catch (error) {
    logError(error, 'GET /api/orders/:id');
    return c.json({ error: 'Failed to fetch order', status: 500 }, 500);
  }
});

app.post('/api/orders', async (c) => {
  try {
    logRequest('POST', '/api/orders');
    const body = await parseRequestBody(c);
    if (!body) {
      return c.json({ error: 'Invalid request body', status: 400 }, 400);
    }

    const validation = validateRequired(body, [
      'customer_name',
      'customer_email',
      'customer_phone',
      'customer_address',
      'product_id',
      'quantity',
      'total_price',
    ]);

    if (validation) {
      return c.json({ error: validation, status: 400 }, 400);
    }

    const db = new Database(c.env.DB);
    const order: Order = {
      id: generateId('ord'),
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      customer_address: body.customer_address,
      product_id: body.product_id,
      quantity: body.quantity,
      total_price: body.total_price,
      payment_method: 'cash_on_delivery',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await db.createOrder(order);

    // Send emails
    const emailService = new EmailService({
      fromEmail: 'no-reply@pzm.ae',
      supportEmail: 'support@pzm.ae',
      senderName: 'PZM iPhone Store',
    });

    const product = await db.getProduct(body.product_id);
    if (product) {
      await emailService.sendOrderConfirmation(created, product);
      await emailService.sendAdminNotification(created, product);
    }

    return c.json({ data: created, status: 201 }, 201);
  } catch (error) {
    logError(error, 'POST /api/orders');
    return c.json({ error: 'Failed to create order', status: 500 }, 500);
  }
});

app.put('/api/orders/:id', async (c) => {
  try {
    const orderId = c.req.param('id');
    logRequest('PUT', `/api/orders/${orderId}`);
    const authService = new AuthService(c.env.ADMIN_SECRET);
    const authHeader = c.req.header('Authorization');
    const token = authService.extractToken(authHeader);

    if (!token) {
      return c.json({ error: 'Unauthorized', status: 401 }, 401);
    }

    const payload = await authService.verifyToken(token);
    if (!payload || payload.type !== 'admin') {
      return c.json({ error: 'Forbidden', status: 403 }, 403);
    }

    const body = await parseRequestBody(c);
    if (!body) {
      return c.json({ error: 'Invalid request body', status: 400 }, 400);
    }

    const db = new Database(c.env.DB);
    const order = await db.updateOrder(orderId, body);

    if (!order) {
      return c.json({ error: 'Order not found', status: 404 }, 404);
    }

    return c.json({ data: order, status: 200 }, 200);
  } catch (error) {
    logError(error, 'PUT /api/orders/:id');
    return c.json({ error: 'Failed to update order', status: 500 }, 500);
  }
});

// ============ AUTH API ============

app.post('/api/auth/admin/login', async (c) => {
  try {
    logRequest('POST', '/api/auth/admin/login');
    const body = await parseRequestBody(c);
    if (!body) {
      return c.json({ error: 'Invalid request body', status: 400 }, 400);
    }

    const validation = validateRequired(body, ['username', 'password']);
    if (validation) {
      return c.json({ error: validation, status: 400 }, 400);
    }

    const db = new Database(c.env.DB);
    const admin = await db.getAdminByUsername(body.username);

    if (!admin) {
      return c.json({ error: 'Invalid credentials', status: 401 }, 401);
    }

    const authService = new AuthService(c.env.ADMIN_SECRET);
    const passwordHash = await db.getAdminPasswordHash(body.username);

    if (!passwordHash || !(await authService.verifyPassword(body.password, passwordHash))) {
      return c.json({ error: 'Invalid credentials', status: 401 }, 401);
    }

    const token = await authService.generateToken({
      sub: admin.id,
      type: 'admin',
      email: admin.email,
      username: admin.username,
    });

    return c.json(
      {
        data: {
          token,
          user: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
          },
        },
        status: 200,
      },
      200
    );
  } catch (error) {
    logError(error, 'POST /api/auth/admin/login');
    return c.json({ error: 'Login failed', status: 500 }, 500);
  }
});

app.get('/api/auth/verify', async (c) => {
  try {
    logRequest('GET', '/api/auth/verify');
    const authService = new AuthService(c.env.ADMIN_SECRET);
    const authHeader = c.req.header('Authorization');
    const token = authService.extractToken(authHeader);

    if (!token) {
      return c.json({ error: 'Unauthorized', status: 401 }, 401);
    }

    const payload = await authService.verifyToken(token);
    if (!payload) {
      return c.json({ error: 'Invalid token', status: 401 }, 401);
    }

    return c.json({ data: { valid: true, user: payload }, status: 200 }, 200);
  } catch (error) {
    logError(error, 'GET /api/auth/verify');
    return c.json({ error: 'Verification failed', status: 500 }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found', status: 404 }, 404);
});

export default app;
