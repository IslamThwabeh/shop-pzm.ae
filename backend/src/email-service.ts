/**
 * Email Service for ZeptoMail Integration
 * Handles sending transactional emails for order confirmations and status updates
 */

interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
}

export class EmailService {
  private apiToken: string;
  private senderEmail: string = 'support@pzm.ae';
  private teamEmail: string = 'support@pzm.ae';
  private baseUrl: string = 'https://api.zeptomail.com/v1.1/email';

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private formatOrderId(id: string): string {
    const numeric = id?.replace(/\D/g, '');
    const short = (numeric || id || '000001').slice(-6);
    return `PZM-${short}`;
  }  

  private formatOrderId(orderId: string): string {
    const numeric = orderId?.replace(/\D/g, '');
    const short = (numeric || orderId || '000001').slice(-6);
    return `PZM-${short}`;
  }

  /**
   * Send email via ZeptoMail API
   */
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const payload = {
        from: {
          address: this.senderEmail,
          name: 'PZM Shop',
        },
        to: [
          {
            email_address: {
              address: options.to,
            },
          },
        ],
        subject: options.subject,
        htmlbody: options.htmlBody,
      };

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-enczapikey ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('ZeptoMail API Error:', error);
        return false;
      }

      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send order confirmation email to customer
   */
  async sendOrderConfirmation(
    customerEmail: string,
    customerName: string,
    orderId: string,
    productModel: string,
    quantity: number,
    totalPrice: number
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getOrderConfirmationTemplate(
      customerName,
      displayId,
      productModel,
      quantity,
      totalPrice
    );

    return this.sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - ${displayId}`,
      htmlBody,
    });
  }

  /**
   * Send order notification email to team
   */
  async sendOrderNotification(
    orderId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    productModel: string,
    quantity: number,
    totalPrice: number
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getOrderNotificationTemplate(
      displayId,
      customerName,
      customerEmail,
      customerPhone,
      productModel,
      quantity,
      totalPrice
    );

    return this.sendEmail({
      to: this.teamEmail,
      subject: `New Order Received - ${displayId}`,
      htmlBody,
    });
  }

  /**
   * Send order status update email to customer
   */
  async sendStatusUpdate(
    customerEmail: string,
    customerName: string,
    orderId: string,
    status: string,
    productModel: string
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getStatusUpdateTemplate(
      customerName,
      displayId,
      status,
      productModel
    );

    const statusMessages: { [key: string]: string } = {
      confirmed: 'Your Order Has Been Confirmed',
      in_progress: 'Your Order is Being Prepared',
      ready_for_delivery: 'Your Order is Ready for Delivery',
      shipped: 'Your Order Has Been Shipped',
      delivered: 'Your Order Has Been Delivered',
      cancelled: 'Your Order Has Been Cancelled',
    };

    const subject = statusMessages[status] || `Order Status Update - ${displayId}`;

    return this.sendEmail({
      to: customerEmail,
      subject,
      htmlBody,
    });
  }

  /**
   * Order Confirmation Email Template
   */
  private getOrderConfirmationTemplate(
    customerName: string,
    orderId: string,
    productModel: string,
    quantity: number,
    totalPrice: number
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #667eea; }
          .value { text-align: right; }
          .total-row { background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 15px; }
          .total-row .detail-row { border-bottom: none; }
          .total-row .label { font-size: 18px; color: #333; }
          .total-row .value { font-size: 18px; font-weight: bold; color: #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .status-badge { display: inline-block; background: #4CAF50; color: white; padding: 8px 15px; border-radius: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Order Confirmed</h1>
            <p>Thank you for your purchase!</p>
          </div>
          
          <div class="content">
            <p>Hi ${customerName},</p>
            
            <p>We're excited to let you know that your order has been received and confirmed. Your order is now being prepared for shipment.</p>
            
            <div class="order-details">
              <div class="detail-row">
                <span class="label">Order ID:</span>
                <span class="value"><strong>${orderId}</strong></span>
              </div>
              
              <div class="detail-row">
                <span class="label">Product:</span>
                <span class="value">${productModel}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Quantity:</span>
                <span class="value">${quantity}</span>
              </div>
              
              <div class="total-row">
                <div class="detail-row">
                  <span class="label">Total Amount:</span>
                  <span class="value">AED ${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Your order is being prepared for shipment</li>
              <li>You'll receive a notification when it's ready for delivery</li>
              <li>Track your order status anytime by logging into your account</li>
            </ul>
            
            <p>If you have any questions, feel free to contact us at support@pzm.ae</p>
            
            <p>Thank you for shopping with PZM Shop!</p>
            
            <p>
              <strong>Best regards,</strong><br>
              PZM Shop Team
            </p>
          </div>
          
          <div class="footer">
            <p>© 2025 PZM Shop. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Order Notification Email Template (for team)
   */
  private getOrderNotificationTemplate(
    orderId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    productModel: string,
    quantity: number,
    totalPrice: number
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF6B6B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .alert { background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .customer-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #FF6B6B; display: inline-block; width: 120px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .total-row { background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 15px; }
          .total-row .detail-row { border-bottom: none; }
          .button { display: inline-block; background: #FF6B6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Order Alert</h1>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>⚠️ New Order Received!</strong> Order ${orderId} needs to be processed.
            </div>
            
            <h2>Customer Information</h2>
            <div class="customer-info">
              <div class="info-row">
                <span class="label">Name:</span>
                <span>${customerName}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span>${customerEmail}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span>${customerPhone}</span>
              </div>
            </div>
            
            <h2>Order Details</h2>
            <div class="order-details">
              <div class="detail-row">
                <span class="label">Order ID:</span>
                <span><strong>${orderId}</strong></span>
              </div>
              
              <div class="detail-row">
                <span class="label">Product:</span>
                <span>${productModel}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Quantity:</span>
                <span>${quantity}</span>
              </div>
              
              <div class="total-row">
                <div class="detail-row">
                  <span class="label">Total:</span>
                  <span><strong>AED ${totalPrice.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review the order details</li>
              <li>Prepare the product for shipment</li>
              <li>Update order status in the admin dashboard</li>
              <li>Customer will be notified of status changes automatically</li>
            </ul>
            
            <a href="https://test.pzm.ae/admin" class="button">Go to Admin Dashboard</a>
          </div>
          
          <div class="footer">
            <p>© 2025 PZM Computers & Phones Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Status Update Email Template
   */
  private getStatusUpdateTemplate(
    customerName: string,
    orderId: string,
    status: string,
    productModel: string
  ): string {
    const statusInfo: { [key: string]: { emoji: string; title: string; message: string; color: string } } = {
      confirmed: {
        emoji: '✓',
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and is being prepared for shipment.',
        color: '#4CAF50',
      },
      in_progress: {
        emoji: '⚙️',
        title: 'Order in Progress',
        message: 'Your order is currently being prepared. We\'re working hard to get it ready!',
        color: '#2196F3',
      },
      ready_for_delivery: {
        emoji: '📦',
        title: 'Ready for Delivery',
        message: 'Your order is ready and will be dispatched soon. Get ready to receive it!',
        color: '#FF9800',
      },
      shipped: {
        emoji: '🚚',
        title: 'Order Shipped',
        message: 'Your order is on its way! You can expect delivery soon.',
        color: '#9C27B0',
      },
      delivered: {
        emoji: '✓✓',
        title: 'Order Delivered',
        message: 'Your order has been delivered! Thank you for shopping with us.',
        color: '#4CAF50',
      },
      cancelled: {
        emoji: '✕',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled. Please contact support for more information.',
        color: '#F44336',
      },
    };

    const info = statusInfo[status] || statusInfo.confirmed;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${info.color} 0%, ${info.color}dd 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .header .emoji { font-size: 40px; margin-bottom: 10px; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .status-message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${info.color}; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: ${info.color}; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">${info.emoji}</div>
            <h1>${info.title}</h1>
          </div>
          
          <div class="content">
            <p>Hi ${customerName},</p>
            
            <div class="status-message">
              <p><strong>${info.message}</strong></p>
            </div>
            
            <div class="order-details">
              <div class="detail-row">
                <span class="label">Order ID:</span>
                <span><strong>${orderId}</strong></span>
              </div>
              
              <div class="detail-row">
                <span class="label">Product:</span>
                <span>${productModel}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Status:</span>
                <span><strong>${status.replace(/_/g, ' ').toUpperCase()}</strong></span>
              </div>
            </div>
            
            <p>If you have any questions or concerns, please don't hesitate to contact us at support@pzm.ae</p>
            
            <p>
              <strong>Thank you for shopping with PZM Shop!</strong><br>
              Best regards,<br>
              PZM Shop Team
            </p>
          </div>
          
          <div class="footer">
            <p>© 2025 PZM Computers & Phones Store. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
