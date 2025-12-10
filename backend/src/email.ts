import type { Order, Product, EmailConfig } from '../../shared/types';

export class EmailService {
  constructor(private config: EmailConfig) {}

  /**
   * Generate order confirmation email HTML for customer
   */
  generateOrderConfirmationEmail(order: Order, product: Product): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
          .product-info { background: white; padding: 15px; margin: 15px 0; border: 1px solid #ddd; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 5px 5px; font-size: 12px; }
          .success-badge { display: inline-block; background: #4caf50; color: white; padding: 10px 20px; border-radius: 5px; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .label { font-weight: bold; color: #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your purchase!</p>
          </div>

          <div class="content">
            <div class="success-badge">✓ Order Placed Successfully</div>

            <h2>Order Details</h2>
            <div class="order-details">
              <table>
                <tr>
                  <td class="label">Order ID:</td>
                  <td>${order.id}</td>
                </tr>
                <tr>
                  <td class="label">Order Date:</td>
                  <td>${new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td class="label">Expected Delivery:</td>
                  <td>${deliveryDate.toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td class="label">Payment Method:</td>
                  <td>Cash on Delivery</td>
                </tr>
              </table>
            </div>

            <h2>Product Information</h2>
            <div class="product-info">
              <table>
                <tr>
                  <td class="label">Model:</td>
                  <td>${product.model}</td>
                </tr>
                <tr>
                  <td class="label">Storage:</td>
                  <td>${product.storage}</td>
                </tr>
                <tr>
                  <td class="label">Condition:</td>
                  <td>${product.condition === 'new' ? 'Brand New' : 'Used'}</td>
                </tr>
                <tr>
                  <td class="label">Color:</td>
                  <td>${product.color}</td>
                </tr>
                <tr>
                  <td class="label">Quantity:</td>
                  <td>${order.quantity}</td>
                </tr>
                <tr>
                  <td class="label">Unit Price:</td>
                  <td>AED ${product.price.toFixed(2)}</td>
                </tr>
                <tr>
                  <td class="label" style="border-bottom: 2px solid #667eea;">Total Amount:</td>
                  <td style="border-bottom: 2px solid #667eea; font-weight: bold; font-size: 18px;">AED ${order.total_price.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <h2>Delivery Address</h2>
            <div class="order-details">
              <p>${order.customer_address}</p>
            </div>

            <h2>What's Next?</h2>
            <div class="order-details">
              <p><strong>1. Confirmation:</strong> Our team will confirm your order within 24 hours.</p>
              <p><strong>2. Preparation:</strong> We'll prepare your iPhone for shipment.</p>
              <p><strong>3. Delivery:</strong> Your order will be delivered to the address above.</p>
              <p><strong>4. Payment:</strong> Pay the full amount (AED ${order.total_price.toFixed(2)}) to the delivery person upon arrival.</p>
            </div>
          </div>

          <div class="footer">
            <p>If you have any questions, contact us at ${this.config.supportEmail}</p>
            <p>© 2024 PZM iPhone Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate order notification email HTML for admin
   */
  generateAdminNotificationEmail(order: Order, product: Product): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #333; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .section { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          .label { font-weight: bold; color: #667eea; }
          .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Received</h1>
          </div>

          <div class="content">
            <div class="alert">
              <strong>Action Required:</strong> Please review and confirm this order.
            </div>

            <h2>Order Information</h2>
            <div class="section">
              <table>
                <tr>
                  <td class="label">Order ID:</td>
                  <td>${order.id}</td>
                </tr>
                <tr>
                  <td class="label">Order Date:</td>
                  <td>${new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td class="label">Total Amount:</td>
                  <td><strong>AED ${order.total_price.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td class="label">Payment Method:</td>
                  <td>Cash on Delivery</td>
                </tr>
              </table>
            </div>

            <h2>Customer Information</h2>
            <div class="section">
              <table>
                <tr>
                  <td class="label">Name:</td>
                  <td>${order.customer_name}</td>
                </tr>
                <tr>
                  <td class="label">Email:</td>
                  <td>${order.customer_email}</td>
                </tr>
                <tr>
                  <td class="label">Phone:</td>
                  <td>${order.customer_phone}</td>
                </tr>
                <tr>
                  <td class="label">Address:</td>
                  <td>${order.customer_address}</td>
                </tr>
              </table>
            </div>

            <h2>Product Details</h2>
            <div class="section">
              <table>
                <tr>
                  <td class="label">Model:</td>
                  <td>${product.model}</td>
                </tr>
                <tr>
                  <td class="label">Storage:</td>
                  <td>${product.storage}</td>
                </tr>
                <tr>
                  <td class="label">Condition:</td>
                  <td>${product.condition === 'new' ? 'Brand New' : 'Used'}</td>
                </tr>
                <tr>
                  <td class="label">Color:</td>
                  <td>${product.color}</td>
                </tr>
                <tr>
                  <td class="label">Quantity:</td>
                  <td>${order.quantity}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send email via Cloudflare Email Routing
   */
  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    replyTo?: string
  ): Promise<boolean> {
    try {
      console.log(`Email would be sent to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Reply-To: ${replyTo || this.config.fromEmail}`);

      // TODO: Integrate with email service (SendGrid, Mailgun, AWS SES, etc.)
      // For now, this is a placeholder
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send order confirmation to customer
   */
  async sendOrderConfirmation(order: Order, product: Product): Promise<boolean> {
    const htmlContent = this.generateOrderConfirmationEmail(order, product);
    return this.sendEmail(
      order.customer_email,
      `Order Confirmation - PZM iPhone Store #${order.id.substring(0, 8)}`,
      htmlContent,
      this.config.supportEmail
    );
  }

  /**
   * Send order notification to admin
   */
  async sendAdminNotification(order: Order, product: Product): Promise<boolean> {
    const htmlContent = this.generateAdminNotificationEmail(order, product);
    return this.sendEmail(
      this.config.supportEmail,
      `New Order Received - ${order.customer_name} - AED ${order.total_price.toFixed(2)}`,
      htmlContent
    );
  }
}
