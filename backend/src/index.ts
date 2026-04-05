import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Database } from './db';
import { AuthService } from './auth';
import { EmailService } from './email-service';
import { StorageService } from './storage';
import { getCorsHeaders, handleCors, generateId, validateRequired, parseRequestBody, logRequest, logError } from './utils';
import type { Product, Order, ServiceRequest, WhatsAppLead } from '../../shared/types';

interface Env {
  DB: D1Database;
  KV: KVNamespace;
  BUCKET: R2Bucket;
  ADMIN_SECRET: string;
  ENVIRONMENT?: string;
  ZEPTOMAIL_API_TOKEN: string;
  GOOGLE_MAPS_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

const R2_HOST = 'r2.pzm.ae';
const SHOP_MEDIA_HOSTS = new Set(['shop.pzm.ae']);
const SHOP_MEDIA_PATH_PREFIX = '/api/media/';
const ROBOTS_TXT = 'User-agent: *\nDisallow: /\n';
const SEARCH_BOT_REGEX = /(googlebot|bingbot|yandex(bot|images)?|duckduckbot|baiduspider|slurp|sogou|exabot|facebot|facebookexternalhit|twitterbot|linkedinbot|embedly|pinterestbot|applebot)/i;
const ROBOTS_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow, nosnippet, noarchive',
};
const SERVICE_REQUEST_KINDS = ['quote', 'booking', 'callback', 'availability'];
const SERVICE_REQUEST_STATUSES = ['pending', 'contacted', 'quoted', 'scheduled', 'completed', 'cancelled'];
const SERVICE_CONTACT_METHODS = ['phone', 'email', 'whatsapp'];
const SERVICE_TIME_PERIODS = ['morning', 'afternoon', 'evening'];
const PRODUCTION_SITE_ORIGINS = [
  'https://pzm.ae',
  'https://www.pzm.ae',
  'https://shop.pzm.ae',
  'https://api.pzm.ae',
  'https://pzm-store-frontend.pages.dev',
];
const LOCAL_DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const PRODUCTION_API_HOSTS = new Set(['pzm.ae', 'www.pzm.ae', 'shop.pzm.ae', 'api.pzm.ae']);

function getAllowedCorsOrigins(environment: string | undefined, host: string | undefined): string[] {
  const origins = [...PRODUCTION_SITE_ORIGINS];
  const normalizedHost = host?.toLowerCase();
  const isProductionHost = normalizedHost ? PRODUCTION_API_HOSTS.has(normalizedHost) : false;

  // Keep localhost available for local/preview workflows without leaving it open on cutover domains.
  if (environment !== 'production' || !isProductionHost) {
    origins.push(...LOCAL_DEV_ORIGINS);
  }

  return origins;
}

function getObjectKeyFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname !== R2_HOST && !hostname.endsWith('.r2.cloudflarestorage.com')) {
      return null;
    }

    const key = parsedUrl.pathname.replace(/^\/+/, '');
    return key || null;
  } catch {
    return null;
  }
}

async function deleteBucketObjects(storageService: StorageService, urls: string[]) {
  for (const url of urls) {
    const key = getObjectKeyFromUrl(url);
    if (!key) continue;
    await storageService.deleteFile(key);
  }
}

function isSearchEngineBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  return SEARCH_BOT_REGEX.test(userAgent);
}

async function serveR2Object(c: any, pathPrefix: string = '/') {
  const url = new URL(c.req.url);
  const pathname = url.pathname;
  const normalizedPrefix = pathPrefix === '/' ? '/' : pathPrefix.endsWith('/') ? pathPrefix : `${pathPrefix}/`;
  const key = normalizedPrefix !== '/' && pathname.startsWith(normalizedPrefix)
    ? pathname.slice(normalizedPrefix.length)
    : (pathname.startsWith('/') ? pathname.slice(1) : pathname);

  if (!key) {
    return c.text('Forbidden', 403, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...ROBOTS_HEADERS,
    });
  }

  const object = await c.env.BUCKET.get(key);
  if (!object) {
    return c.text('Not found', 404, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...ROBOTS_HEADERS,
    });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return new Response(object.body, { headers });
}

// Block search engine crawlers on r2.pzm.ae and serve robots.txt
app.use('*', async (c, next) => {
  const host = c.req.header('host')?.toLowerCase();
  const path = new URL(c.req.url).pathname;
  if (host === R2_HOST) {
    if (path === '/robots.txt') {
      return c.text(ROBOTS_TXT, 200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
        ...ROBOTS_HEADERS,
      });
    }

    const userAgent = c.req.header('user-agent') || '';
    if (isSearchEngineBot(userAgent)) {
      return c.text('Forbidden', 403, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        ...ROBOTS_HEADERS,
      });
    }

    return await serveR2Object(c);
  }

  if (host && SHOP_MEDIA_HOSTS.has(host) && path.startsWith(SHOP_MEDIA_PATH_PREFIX)) {
    return await serveR2Object(c, SHOP_MEDIA_PATH_PREFIX);
  }

  await next();
});

// CORS middleware
app.use(
  '*',
  async (c, next) => {
    const corsMiddleware = cors({
      origin: getAllowedCorsOrigins(c.env.ENVIRONMENT, c.req.header('host')),
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    });

    return corsMiddleware(c, next);
  }
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
    const authService = new AuthService(c.env.ADMIN_SECRET);
    const token = authService.extractToken(c.req.header('Authorization'));
    const payload = token ? await authService.verifyToken(token) : null;
    const includeOutOfStock = payload?.type === 'admin';
    const products = await db.getProducts(condition as 'new' | 'used' | undefined, includeOutOfStock);
    
    // Fetch images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await db.getProductImages(product.id);
        return {
          ...product,
          images: images.length > 0 ? images : (product.image_url ? [product.image_url] : [])
        };
      })
    );
    
    return c.json({ data: productsWithImages, status: 200 }, 200);
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
    
    // Fetch images for this product
    const images = await db.getProductImages(productId);
    const productWithImages = {
      ...product,
      images: images.length > 0 ? images : (product.image_url ? [product.image_url] : [])
    };
    
    return c.json({ data: productWithImages, status: 200 }, 200);
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

    // Parse FormData for file upload
    const formData = await c.req.formData();
    const model = formData.get('model') as string;
    const storage = formData.get('storage') as string;
    const condition = formData.get('condition') as string;
    const color = formData.get('color') as string;
    const price = parseFloat(formData.get('price') as string);
    const quantity = parseInt(formData.get('quantity') as string) || 0;
    const description = formData.get('description') as string || '';
    
    // Get all image files (up to 4)
    const imageFiles: File[] = [];
    for (let i = 0; i < 4; i++) {
      const imageFile = formData.get(`image${i}`) as File | null;
      if (imageFile && imageFile.size > 0) {
        imageFiles.push(imageFile);
      }
    }

    // Validate required fields
    if (!model || !storage || !condition || !color || !price) {
      return c.json({ error: 'Missing required fields: model, storage, condition, color, price', status: 400 }, 400);
    }

    // Upload images if provided
    const imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      const storageService = new StorageService(c.env.BUCKET);
      for (const imageFile of imageFiles) {
        try {
          const uploadResult = await storageService.uploadFile(imageFile, 'products');
          if (uploadResult) {
            imageUrls.push(uploadResult.url);
          }
        } catch (err) {
          console.error('Error uploading image:', err);
        }
      }
    }

    const db = new Database(c.env.DB);
    const product: Product = {
      id: generateId('prod'),
      model,
      storage,
      condition: condition as 'new' | 'used',
      color,
      price,
      description,
      quantity,
      image_url: imageUrls[0] || '', // Primary image for backward compatibility
      images: imageUrls,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await db.createProduct(product);
    
    // Create product images in database
    if (imageUrls.length > 0) {
      for (let i = 0; i < imageUrls.length; i++) {
        await db.createProductImage(created.id, imageUrls[i], i, i === 0);
      }
    }
    
    return c.json({ data: { ...created, images: imageUrls }, status: 201 }, 201);
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

    // Parse FormData for file upload
    const formData = await c.req.formData();
    const updates: Partial<Product> = {};

    // Parse form fields
    const model = formData.get('model') as string;
    const storage = formData.get('storage') as string;
    const condition = formData.get('condition') as string;
    const color = formData.get('color') as string;
    const price = formData.get('price') as string;
    const quantity = formData.get('quantity') as string;
    const description = formData.get('description') as string;
    const replaceImagesRaw = (formData.get('replace_images') || formData.get('replaceImages') || '') as string;
    const replaceImages = ['1', 'true', 'yes'].includes(replaceImagesRaw.toLowerCase());
    
    // Get all image files (up to 4)
    const imageFiles: File[] = [];
    for (let i = 0; i < 4; i++) {
      const imageFile = formData.get(`image${i}`) as File | null;
      if (imageFile && imageFile.size > 0) {
        imageFiles.push(imageFile);
      }
    }

    if (model) updates.model = model;
    if (storage) updates.storage = storage;
    if (condition) updates.condition = condition as 'new' | 'used';
    if (color) updates.color = color;
    if (price) updates.price = parseFloat(price);
    if (quantity) updates.quantity = parseInt(quantity);
    if (description !== null) updates.description = description;

    const db = new Database(c.env.DB);
    const existingProduct = await db.getProduct(productId);
    if (!existingProduct) {
      return c.json({ error: 'Product not found', status: 404 }, 404);
    }
    
    // Get existing images
    const existingImages = await db.getProductImages(productId);
    const currentImages = existingImages.length > 0
      ? existingImages
      : (existingProduct.image_url ? [existingProduct.image_url] : []);
    
    // Upload new images if provided
    if (imageFiles.length > 0) {
      const storageService = new StorageService(c.env.BUCKET);
      const imageUrls: string[] = [];
      
      for (const imageFile of imageFiles) {
        try {
          const uploadResult = await storageService.uploadFile(imageFile, 'products');
          if (uploadResult) {
            imageUrls.push(uploadResult.url);
          }
        } catch (err) {
          console.error('Error uploading image:', err);
        }
      }
      
      // Replace or append images based on operator intent.
      if (imageUrls.length > 0) {
        const finalImages = replaceImages
          ? imageUrls.slice(0, 4)
          : [...currentImages, ...imageUrls].slice(0, 4);
        
        // Delete all and re-insert with new order
        await db.deleteAllProductImages(productId);
        for (let i = 0; i < finalImages.length; i++) {
          await db.createProductImage(productId, finalImages[i], i, i === 0);
        }

        if (replaceImages) {
          await deleteBucketObjects(storageService, currentImages);
        }
        
        updates.image_url = finalImages[0] || ''; // Primary image
      }
    } else {
      // If no new images provided, keep existing images
      if (currentImages.length > 0) {
        updates.image_url = currentImages[0]; // Keep primary image
      }
    }

    const product = await db.updateProduct(productId, updates);

    if (!product) {
      return c.json({ error: 'Product not found', status: 404 }, 404);
    }
    
    // Fetch images for the product
    const images = await db.getProductImages(productId);
    
    return c.json({ data: { ...product, images }, status: 200 }, 200);
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
    const product = await db.getProduct(productId);
    if (!product) {
      return c.json({ error: 'Product not found', status: 404 }, 404);
    }

    const existingImages = await db.getProductImages(productId);
    const imagesToDelete = existingImages.length > 0
      ? existingImages
      : (product.image_url ? [product.image_url] : []);
    const success = await db.deleteProduct(productId);

    if (!success) {
      return c.json({ error: 'Failed to delete product', status: 500 }, 500);
    }

    const storageService = new StorageService(c.env.BUCKET);
    await deleteBucketObjects(storageService, imagesToDelete);

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
    if (firstProduct.condition === 'used' && firstProduct.quantity < firstItem.quantity) {
      return c.json({ error: `Insufficient stock for product ${firstItem.product_id}`, status: 400 }, 400);
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
      if (product.condition === 'used' && product.quantity < item.quantity) {
        return c.json({ error: `Insufficient stock for product ${item.product_id}`, status: 400 }, 400);
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
      if (product.condition === 'used') {
        const decremented = await db.decrementProductQuantity(item.product_id, item.quantity);
        if (!decremented) {
          return c.json({ error: `Failed to reserve stock for product ${item.product_id}`, status: 400 }, 400);
        }
      }
      orderItems.push(orderItem);
    }

    // Send emails with all items
    const emailService = new EmailService(c.env.ZEPTOMAIL_API_TOKEN);
    
    await emailService.sendOrderConfirmation(
      body.customer_email,
      body.customer_name,
      created.id,
      orderItems,
      body.total_price,
      body.notes,
      body.customer_address
    );
    
    await emailService.sendOrderNotification(
      created.id,
      body.customer_name,
      body.customer_email,
      body.customer_phone,
      orderItems,
      body.total_price,
      body.notes,
      body.customer_address
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
      let orderItemsForEmail = order.items || [];

      if (orderItemsForEmail.length === 0 && order.product_id) {
        const legacyProduct = await db.getProduct(order.product_id);
        if (legacyProduct) {
          orderItemsForEmail = [
            {
              id: `legacy-${order.id}`,
              order_id: order.id,
              product_id: order.product_id,
              quantity: order.quantity || 1,
              unit_price: legacyProduct.price,
              subtotal: legacyProduct.price * (order.quantity || 1),
              created_at: order.created_at,
              product: legacyProduct,
            },
          ];
        }
      }

      await emailService.sendStatusUpdate(
        order.customer_email,
        order.customer_name,
        orderId,
        body.status,
        orderItemsForEmail
      );
      await emailService.sendStatusUpdateToTeam(
        orderId,
        order.customer_name,
        body.status,
        orderItemsForEmail
      );
    }

    return c.json({ data: updated, status: 200 }, 200);
  } catch (error) {
    logError(error, 'PUT /api/orders/:id');
    return c.json({ error: 'Failed to update order', status: 500 }, 500);
  }
});

// ============ SERVICE REQUESTS API ============

app.post('/api/service-requests', async (c) => {
  try {
    logRequest('POST', '/api/service-requests');
    const body = await parseRequestBody(c);
    if (!body) {
      return c.json({ error: 'Invalid request body', status: 400 }, 400);
    }

    const validation = validateRequired(body, [
      'service_type',
      'request_kind',
      'customer_name',
      'customer_phone',
      'details',
    ]);

    if (validation) {
      return c.json({ error: validation, status: 400 }, 400);
    }

    if (!SERVICE_REQUEST_KINDS.includes(body.request_kind)) {
      return c.json({ error: 'Invalid request kind', status: 400 }, 400);
    }

    if (body.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email)) {
      return c.json({ error: 'Invalid email format', status: 400 }, 400);
    }

    if (body.preferred_contact_method && !SERVICE_CONTACT_METHODS.includes(body.preferred_contact_method)) {
      return c.json({ error: 'Invalid preferred contact method', status: 400 }, 400);
    }

    if (body.preferred_time_period && !SERVICE_TIME_PERIODS.includes(body.preferred_time_period)) {
      return c.json({ error: 'Invalid preferred time period', status: 400 }, 400);
    }

    const now = new Date().toISOString();
    const request: ServiceRequest = {
      id: generateId('srq'),
      service_type: body.service_type,
      request_kind: body.request_kind,
      customer_name: body.customer_name,
      customer_email: body.customer_email || undefined,
      customer_phone: body.customer_phone,
      customer_address: body.customer_address || undefined,
      details: body.details,
      preferred_contact_method: body.preferred_contact_method || 'phone',
      preferred_date: body.preferred_date || undefined,
      preferred_time_period: body.preferred_time_period || undefined,
      source_page: body.source_page || undefined,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    const db = new Database(c.env.DB);
    const created = await db.createServiceRequest(request);

    const emailService = new EmailService(c.env.ZEPTOMAIL_API_TOKEN);
    await emailService.sendServiceRequestNotification(created);
    if (created.customer_email) {
      await emailService.sendServiceRequestConfirmation(created);
    }

    return c.json({ data: created, status: 201 }, 201);
  } catch (error) {
    logError(error, 'POST /api/service-requests');
    return c.json({ error: 'Failed to create service request', status: 500 }, 500);
  }
});

app.get('/api/service-requests', async (c) => {
  try {
    logRequest('GET', '/api/service-requests');
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
    const requests = await db.getServiceRequests();
    return c.json({ data: requests, status: 200 }, 200);
  } catch (error) {
    logError(error, 'GET /api/service-requests');
    return c.json({ error: 'Failed to fetch service requests', status: 500 }, 500);
  }
});

app.get('/api/service-requests/:id', async (c) => {
  try {
    const requestId = c.req.param('id');
    logRequest('GET', `/api/service-requests/${requestId}`);
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
    const request = await db.getServiceRequest(requestId);
    if (!request) {
      return c.json({ error: 'Service request not found', status: 404 }, 404);
    }

    return c.json({ data: request, status: 200 }, 200);
  } catch (error) {
    logError(error, 'GET /api/service-requests/:id');
    return c.json({ error: 'Failed to fetch service request', status: 500 }, 500);
  }
});

app.put('/api/service-requests/:id', async (c) => {
  try {
    const requestId = c.req.param('id');
    logRequest('PUT', `/api/service-requests/${requestId}`);
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

    if (body.status && !SERVICE_REQUEST_STATUSES.includes(body.status)) {
      return c.json({ error: 'Invalid service request status', status: 400 }, 400);
    }

    if (body.preferred_contact_method && !SERVICE_CONTACT_METHODS.includes(body.preferred_contact_method)) {
      return c.json({ error: 'Invalid preferred contact method', status: 400 }, 400);
    }

    if (body.preferred_time_period && !SERVICE_TIME_PERIODS.includes(body.preferred_time_period)) {
      return c.json({ error: 'Invalid preferred time period', status: 400 }, 400);
    }

    const allowedFields = [
      'service_type',
      'request_kind',
      'customer_name',
      'customer_email',
      'customer_phone',
      'customer_address',
      'details',
      'preferred_contact_method',
      'preferred_date',
      'preferred_time_period',
      'source_page',
      'status',
    ];

    const updates = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key))
    );

    if (Object.keys(updates).length === 0) {
      return c.json({ error: 'No valid fields provided', status: 400 }, 400);
    }

    const db = new Database(c.env.DB);
    const existingRequest = await db.getServiceRequest(requestId);
    if (!existingRequest) {
      return c.json({ error: 'Service request not found', status: 404 }, 404);
    }

    const updated = await db.updateServiceRequest(requestId, updates as Partial<ServiceRequest>);
    if (!updated) {
      return c.json({ error: 'Service request not found', status: 404 }, 404);
    }

    if (body.status && body.status !== existingRequest.status && updated.customer_email) {
      const emailService = new EmailService(c.env.ZEPTOMAIL_API_TOKEN);
      await emailService.sendServiceRequestStatusUpdate(updated);
    }

    return c.json({ data: updated, status: 200 }, 200);
  } catch (error) {
    logError(error, 'PUT /api/service-requests/:id');
    return c.json({ error: 'Failed to update service request', status: 500 }, 500);
  }
});

// ============ WHATSAPP LEADS API ============

const WHATSAPP_LEAD_TYPES = ['product', 'service', 'appointment'];
const WHATSAPP_LEAD_STATUSES = ['pending', 'confirmed', 'cancelled'];

app.post('/api/whatsapp-leads', async (c) => {
  try {
    logRequest('POST', '/api/whatsapp-leads');
    const body = await parseRequestBody(c);
    if (!body) {
      return c.json({ error: 'Invalid request body', status: 400 }, 400);
    }

    const validation = validateRequired(body, ['lead_type', 'reference_label', 'whatsapp_message']);
    if (validation) {
      return c.json({ error: validation, status: 400 }, 400);
    }

    if (!WHATSAPP_LEAD_TYPES.includes(body.lead_type)) {
      return c.json({ error: 'Invalid lead type', status: 400 }, 400);
    }

    const now = new Date().toISOString();
    const lead: WhatsAppLead = {
      id: generateId('wal'),
      lead_type: body.lead_type,
      reference_id: body.reference_id || undefined,
      reference_label: body.reference_label,
      reference_price: body.reference_price != null ? Number(body.reference_price) : undefined,
      source_page: body.source_page || undefined,
      whatsapp_message: body.whatsapp_message,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    const db = new Database(c.env.DB);
    const created = await db.createWhatsAppLead(lead);

    const emailService = new EmailService(c.env.ZEPTOMAIL_API_TOKEN);
    await emailService.sendWhatsAppLeadNotification(created);

    return c.json({ data: created, status: 201 }, 201);
  } catch (error) {
    logError(error, 'POST /api/whatsapp-leads');
    return c.json({ error: 'Failed to create whatsapp lead', status: 500 }, 500);
  }
});

app.get('/api/whatsapp-leads', async (c) => {
  try {
    logRequest('GET', '/api/whatsapp-leads');
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
    const leads = await db.getWhatsAppLeads();
    return c.json({ data: leads, status: 200 }, 200);
  } catch (error) {
    logError(error, 'GET /api/whatsapp-leads');
    return c.json({ error: 'Failed to fetch whatsapp leads', status: 500 }, 500);
  }
});

app.put('/api/whatsapp-leads/:id', async (c) => {
  try {
    const leadId = c.req.param('id');
    logRequest('PUT', `/api/whatsapp-leads/${leadId}`);
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

    if (body.status && !WHATSAPP_LEAD_STATUSES.includes(body.status)) {
      return c.json({ error: 'Invalid lead status', status: 400 }, 400);
    }

    const allowedFields = ['status', 'notes'];
    const updates = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key))
    );

    if (Object.keys(updates).length === 0) {
      return c.json({ error: 'No valid fields provided', status: 400 }, 400);
    }

    const db = new Database(c.env.DB);
    const updated = await db.updateWhatsAppLead(leadId, updates as Partial<WhatsAppLead>);
    if (!updated) {
      return c.json({ error: 'Lead not found', status: 404 }, 404);
    }

    return c.json({ data: updated, status: 200 }, 200);
  } catch (error) {
    logError(error, 'PUT /api/whatsapp-leads/:id');
    return c.json({ error: 'Failed to update whatsapp lead', status: 500 }, 500);
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
