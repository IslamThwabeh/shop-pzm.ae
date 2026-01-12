import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Database } from './db';
import { AuthService } from './auth';
import { EmailService } from './email-service';
import { StorageService } from './storage';
import { getCorsHeaders, handleCors, generateId, validateRequired, parseRequestBody, logRequest, logError } from './utils';
import type { Product, Order } from '../../shared/types';

interface Env {
  DB: D1Database;
  KV: KVNamespace;
  BUCKET: R2Bucket;
  ADMIN_SECRET: string;
  ZEPTOMAIL_API_TOKEN: string;
  GOOGLE_MAPS_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use(
  '*',
  cors({
    origin: [
      'https://pzm.ae',
      'https://www.pzm.ae',
      'https://test.pzm.ae',
      'https://api.pzm.ae',
      'https://pzm-store-frontend.pages.dev',
      // Local dev origins (remove before production)
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// ============ BUSINESS HOURS API ============

const PLACE_ID = 'ChIJ1aZJvMBtXz4RLrOI1vITjBU'; // PZM Store Place ID

app.get('/api/business-hours', async (c) => {
  try {
    logRequest('GET', '/api/business-hours');

    const apiKey = c.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      // Return fallback hours if API key not configured
      return c.json({
        result: {
          opening_hours: {
            weekday_text: [
              "Monday: 8 AM – 12 AM",
              "Tuesday: 8 AM – 12 AM",
              "Wednesday: 8 AM – 12 AM",
              "Thursday: 8 AM – 12 AM",
              "Friday: 9:30 AM – 12 AM",
              "Saturday: 7 AM – 1 AM",
              "Sunday: 7 AM – 1 AM"
            ],
            open_now: null
          }
        },
        status: 200
      }, 200);
    }

    const googleUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=name,opening_hours&key=${apiKey}`;

    const response = await fetch(googleUrl );
    const data = await response.json();

    return c.json(data, 200);
  } catch (error) {
    logError(error, 'GET /api/business-hours');
    return c.json({ error: 'Failed to fetch business hours', status: 500 }, 500);
  }
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
      'items', // Now expecting items array
      'total_price',
    ]);

    if (validation) {
      return c.json({ error: validation, status: 400 }, 400);
    }

    // Validate items array
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return c.json({ error: 'Order must contain at least one item', status: 400 }, 400);
    }

    const db = new Database(c.env.DB);
    const orderId = generateId('ord');
    
    // For multi-item orders, use first item's product_id for backward compatibility with orders table
    const firstItem = body.items[0];
    const firstProduct = await db.getProduct(firstItem.product_id);
    if (!firstProduct) {
      return c.json({ error: `Product ${firstItem.product_id} not found`, status: 400 }, 400);
    }
    
    const order: Order = {
      id: orderId,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      customer_address: body.customer_address,
      product_id: firstItem.product_id, // Store first product for backward compatibility
      quantity: firstItem.quantity, // Store first item quantity
      total_price: body.total_price,
      payment_method: 'cash_on_delivery',
      status: 'pending',
      notes: body.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await db.createOrder(order);

    // Create order items
    const orderItems = [];
    for (const item of body.items) {
      const product = await db.getProduct(item.product_id);
      if (!product) {
        return c.json({ error: `Product ${item.product_id} not found`, status: 400 }, 400);
      }

      const orderItem = {
        id: generateId('oi'),
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: product.price * item.quantity,
        created_at: new Date().toISOString(),
        product: product,
      };

      await db.createOrderItem(orderItem);
      orderItems.push(orderItem);
    }

    // Send emails with all items
    const emailService = new EmailService(c.env.ZEPTOMAIL_API_TOKEN);
    
    await emailService.sendOrderConfirmation(
      body.customer_email,
      body.customer_name,
      created.id,
      orderItems,
      body.total_price
    );
    
    await emailService.sendOrderNotification(
      created.id,
      body.customer_name,
      body.customer_email,
      body.customer_phone,
      orderItems,
      body.total_price
    );

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
    const order = await db.getOrder(orderId);
    if (!order) {
      return c.json({ error: 'Order not found', status: 404 }, 404);
    }

    const updated = await db.updateOrder(orderId, body);

    if (!updated) {
      return c.json({ error: 'Order not found', status: 404 }, 404);
    }

    // Send status update email if status changed
    if (body.status && body.status !== order.status) {
      const emailService = new EmailService(c.env.ZEPTOMAIL_API_TOKEN);
      const product = await db.getProduct(order.product_id);
      if (product) {
        // Send to customer
        await emailService.sendStatusUpdate(
          order.customer_email,
          order.customer_name,
          orderId,
          body.status,
          product.model,
          product.storage,
          product.condition,
          product.color
        );
        // Send to support team
        await emailService.sendStatusUpdateToTeam(
          orderId,
          order.customer_name,
          body.status,
          product.model,
          product.storage,
          product.condition,
          product.color
        );
      }
    }

    return c.json({ data: updated, status: 200 }, 200);
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
    const storedPasswordHash = await db.getAdminPasswordHash(body.username);

    // body.password is already a SHA-256 hash from the frontend
    // Just compare it directly with the stored hash
    if (!storedPasswordHash || !(await authService.verifyPasswordHash(body.password, storedPasswordHash))) {
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
