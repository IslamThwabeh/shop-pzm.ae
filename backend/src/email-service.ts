/**
 * Email Service for ZeptoMail Integration
 * Handles sending transactional emails for order confirmations and status updates
 */

import type { OrderItem } from '../../shared/types';

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

  /**
   * Format order ID from raw ID to PZM-XXXXXX format
   * Extracts the 6-character random portion from the end of the full ID
   */
  private formatOrderId(id: string): string {
    // Full ID format: ord-[timestamp]-[random 6 chars]
    // Extract the random part (last segment after the final hyphen)
    const parts = id?.split('-');
    const randomPart = parts?.[parts.length - 1] || id || '000000';
    return `PZM-${randomPart}`;
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
    orderItems: OrderItem[],
    totalPrice: number,
    notes?: string,
    customerAddress?: string
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getOrderConfirmationTemplate(
      customerName,
      displayId,
      orderItems,
      totalPrice,
      notes,
      customerAddress
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
    orderItems: OrderItem[],
    totalPrice: number,
    notes?: string,
    customerAddress?: string
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getOrderNotificationTemplate(
      displayId,
      customerName,
      customerEmail,
      customerPhone,
      orderItems,
      totalPrice,
      notes,
      customerAddress
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
    productModel: string,
    productStorage: string,
    productCondition: string,
    productColor: string
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getStatusUpdateTemplate(
      customerName,
      displayId,
      status,
      productModel,
      productStorage,
      productCondition,
      productColor
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
   * Send order status update notification to team
   */
  async sendStatusUpdateToTeam(
    orderId: string,
    customerName: string,
    status: string,
    productModel: string,
    productStorage: string,
    productCondition: string,
    productColor: string
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getStatusUpdateTeamTemplate(
      displayId,
      customerName,
      status,
      productModel,
      productStorage,
      productCondition,
      productColor
    );

    const statusMessages: { [key: string]: string } = {
      confirmed: 'Order Confirmed',
      in_progress: 'Order In Progress',
      ready_for_delivery: 'Order Ready for Delivery',
      shipped: 'Order Shipped',
      delivered: 'Order Delivered',
      cancelled: 'Order Cancelled',
    };

    const subject = statusMessages[status] || `Order Status Update - ${displayId}`;

    return this.sendEmail({
      to: this.teamEmail,
      subject: `${subject} - ${displayId}`,
      htmlBody,
    });
  }

  /**
   * Order Confirmation Email Template
   */
  private getOrderConfirmationTemplate(
    customerName: string,
    orderId: string,
    orderItems: OrderItem[],
    totalPrice: number,
    notes?: string,
    customerAddress?: string
  ): string {
    // Generate items HTML
    const itemsHtml = orderItems.map((item, index) => `
      <div class="product-item">
        <div class="product-number">${index + 1}</div>
        <div class="product-details">
          <div class="detail-row">
            <span class="label">Product:</span>
            <span class="value">${item.product?.model || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Storage:</span>
            <span class="value">${item.product?.storage || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Condition:</span>
            <span class="value">${item.product?.condition === 'new' ? '✨ Brand New' : '📱 Used'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Color:</span>
            <span class="value">${item.product?.color || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="label">Quantity:</span>
            <span class="value">${item.quantity}</span>
          </div>
          <div class="detail-row">
            <span class="label">Price:</span>
            <span class="value">AED ${item.unit_price.toFixed(2)} × ${item.quantity} = AED ${item.subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `).join('');

    const notesHtml = notes ? `
      <div class="order-details" style="background: #fff8e1; border-left: 4px solid #ff9800;">
        <div class="detail-row">
          <span class="label">📝 Your Notes:</span>
          <span class="value">${notes}</span>
        </div>
      </div>
    ` : '';

    const addressHtml = customerAddress ? `
      <div class="order-details">
        <div class="detail-row">
          <span class="label">📍 Delivery Address:</span>
          <span class="value">${customerAddress}</span>
        </div>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00A76F 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: flex-start; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #00A76F; min-width: 140px; }
          .value { text-align: left; }
          .product-item { background: #fafafa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #00A76F; }
          .product-number { display: inline-block; background: #00A76F; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; margin-bottom: 10px; }
          .product-details .detail-row { padding: 8px 0; }
          .total-row { background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 15px; }
          .total-row .detail-row { border-bottom: none; }
          .total-row .label { font-size: 18px; color: #333; }
          .total-row .value { font-size: 18px; font-weight: bold; color: #00A76F; }
          .button { display: inline-block; background: #00A76F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .unsubscribe { margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; }
          .unsubscribe a { color: #666; text-decoration: underline; }
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
            </div>

            ${addressHtml}
            ${notesHtml}

            <h3 style="color: #00A76F; margin-top: 20px;">Order Items (${orderItems.length})</h3>
            ${itemsHtml}
              
            <div class="total-row">
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value">AED ${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Your order is being prepared for shipment</li>
              <li>You'll receive a notification when it's ready for delivery</li>
              <li>Track your order status anytime by contacting support@pzm.ae</li>
            </ul>
            
            <p>If you have any questions, feel free to contact us at support@pzm.ae</p>
            
            <p>Thank you for shopping with PZM Shop!</p>
            
            <p>
              <strong>Best regards,</strong><br>
              PZM Shop Team
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PZM Shop. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this email.</p>
            <div class="unsubscribe">
              <p>Don't want to receive these emails? <a href="https://test.pzm.ae/unsubscribe?email=${encodeURIComponent(orderId)}">Unsubscribe</a></p>
            </div>
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
    orderItems: OrderItem[],
    totalPrice: number,
    notes?: string,
    customerAddress?: string
  ): string {
    // Generate items HTML
    const itemsHtml = orderItems.map((item, index) => `
      <div class="product-item">
        <div class="product-number">${index + 1}</div>
        <div class="product-details">
          <div class="info-row">
            <span class="label">Product:</span>
            <span>${item.product?.model || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Storage:</span>
            <span>${item.product?.storage || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Condition:</span>
            <span>${item.product?.condition === 'new' ? '✨ Brand New' : '📱 Used'}</span>
          </div>
          <div class="info-row">
            <span class="label">Color:</span>
            <span>${item.product?.color || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Quantity:</span>
            <span>${item.quantity}</span>
          </div>
          <div class="info-row">
            <span class="label">Subtotal:</span>
            <span>AED ${item.subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `).join('');

    const notesHtml = notes ? `
      <div class="customer-info" style="background: #fff8e1; border-left: 4px solid #ff9800;">
        <div class="info-row">
          <span class="label">📝 Customer Notes:</span>
          <span>${notes}</span>
        </div>
      </div>
    ` : '';

    const addressHtml = customerAddress ? `
      <div class="customer-info">
        <div class="info-row">
          <span class="label">📍 Delivery Address:</span>
          <span>${customerAddress}</span>
        </div>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #00A76F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .alert { background: #e8f5e9; border-left: 4px solid #00A76F; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .customer-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #00A76F; display: inline-block; min-width: 120px; }
          .product-item { background: #fafafa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #00A76F; }
          .product-number { display: inline-block; background: #00A76F; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; margin-bottom: 10px; }
          .product-details .info-row { padding: 8px 0; }
          .total-row { background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 15px; }
          .button { display: inline-block; background: #00A76F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
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

            ${addressHtml}
            ${notesHtml}
            
            <h2>Order Details</h2>
            <div class="customer-info">
              <div class="info-row">
                <span class="label">Order ID:</span>
                <span><strong>${orderId}</strong></span>
              </div>
            </div>

            <h3 style="color: #00A76F; margin-top: 20px;">Order Items (${orderItems.length})</h3>
            ${itemsHtml}
              
            <div class="total-row">
              <div class="info-row">
                <span class="label">Total Amount:</span>
                <span style="font-size: 18px; font-weight: bold; color: #00A76F;">AED ${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <p><strong>Action Required:</strong></p>
            <ul>
              <li>Process the order and prepare items for shipment</li>
              <li>Contact customer if needed</li>
              <li>Update order status in admin panel</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PZM Shop - Internal Notification</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send order status update email to customer
   */
  async sendStatusUpdate(
    customerEmail: string,
    customerName: string,
    orderId: string,
    status: string,
    productModel: string,
    productStorage: string,
    productCondition: string,
    productColor: string
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getStatusUpdateTemplate(
      customerName,
      displayId,
      status,
      productModel,
      productStorage,
      productCondition,
      productColor
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
   * Send order status update notification to team
   */
  async sendStatusUpdateToTeam(
    orderId: string,
    customerName: string,
    status: string,
    productModel: string,
    productStorage: string,
    productCondition: string,
    productColor: string
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getStatusUpdateTeamTemplate(
      displayId,
      customerName,
      status,
      productModel,
      productStorage,
      productCondition,
      productColor
    );

    const statusMessages: { [key: string]: string } = {
      confirmed: 'Order Confirmed',
      in_progress: 'Order In Progress',
      ready_for_delivery: 'Order Ready for Delivery',
      shipped: 'Order Shipped',
      delivered: 'Order Delivered',
      cancelled: 'Order Cancelled',
    };

    const subject = statusMessages[status] || `Order Status Update - ${displayId}`;

    return this.sendEmail({
      to: this.teamEmail,
      subject: `${subject} - ${displayId}`,
      htmlBody,
    });
  }

  /**
   * Status Update Email Template
   */
  private getStatusUpdateTemplate(
    customerName: string,
    orderId: string,
    status: string,
    productModel: string,
    productStorage: string,
    productCondition: string,
    productColor: string
  ): string {
    const statusInfo: { [key: string]: { emoji: string; title: string; message: string; color: string } } = {
      confirmed: {
        emoji: '✓',
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and is being prepared for shipment.',
        color: '#00A76F',
      },
      in_progress: {
        emoji: '⚙️',
        title: 'Order in Progress',
        message: 'Your order is currently being prepared. We\'re working hard to get it ready!',
        color: '#00A76F',
      },
      ready_for_delivery: {
        emoji: '📦',
        title: 'Ready for Delivery',
        message: 'Your order is ready and will be dispatched soon. Get ready to receive it!',
        color: '#00A76F',
      },
      shipped: {
        emoji: '🚚',
        title: 'Order Shipped',
        message: 'Your order is on its way! You can expect delivery soon.',
        color: '#00A76F',
      },
      delivered: {
        emoji: '✓✓',
        title: 'Order Delivered',
        message: 'Your order has been delivered! Thank you for shopping with us.',
        color: '#00A76F',
      },
      cancelled: {
        emoji: '✕',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled. Please contact support for more information.',
        color: '#DC3545',
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
          .detail-row { display: flex; justify-content: flex-start; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: ${info.color}; min-width: 140px; }
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
                <span class="label">Storage:</span>
                <span>${productStorage}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Condition:</span>
                <span>${productCondition === 'new' ? '✨ Brand New' : '📱 Used'}</span>
              </div>
              
              <div class="detail-row">
                <span class="label">Color:</span>
                <span>${productColor}</span>
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
            <p>© ${new Date().getFullYear()} PZM Computers & Phones Store. All rights reserved.</p>
            <p>This is an automated email. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Status Update Team Notification Template
   */
  private getStatusUpdateTeamTemplate(
    orderId: string,
    customerName: string,
    status: string,
    productModel: string,
    productStorage: string,
    productCondition: string,
    productColor: string
  ): string {
    const statusColors: { [key: string]: string } = {
      confirmed: '#00A76F',
      in_progress: '#00A76F',
      ready_for_delivery: '#00A76F',
      shipped: '#00A76F',
      delivered: '#00A76F',
      cancelled: '#DC3545',
    };

    const color = statusColors[status] || '#00A76F';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .alert { background: #FFF3CD; border-left: 4px solid ${color}; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: ${color}; display: inline-block; width: 120px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Order Status Updated</h1>
          </div>
          
          <div class="content">
            <div class="alert">
              <strong>⚠️ Status Update!</strong> Order ${orderId} status has been changed to <strong>${status.replace(/_/g, ' ').toUpperCase()}</strong>
            </div>
            
            <h2>Order Information</h2>
            <div class="order-details">
              <div class="detail-row">
                <span class="label">Order ID: </span>
                <span><strong>${orderId}</strong></span>
              </div>
              <div class="detail-row">
                <span class="label">Customer: </span>
                <span>${customerName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Product: </span>
                <span>${productModel}</span>
              </div>
              <div class="detail-row">
                <span class="label">Storage: </span>
                <span>${productStorage}</span>
              </div>
              <div class="detail-row">
                <span class="label">Condition: </span>
                <span>${productCondition === 'new' ? '✨ Brand New' : '📱 Used'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Color: </span>
                <span>${productColor}</span>
              </div>
              <div class="detail-row">
                <span class="label">New Status: </span>
                <span><strong>${status.replace(/_/g, ' ').toUpperCase()}</strong></span>
              </div>
            </div>
            
            <p><strong>Note:</strong> Customer has been notified about this status change.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PZM Computers & Phones Store. All rights reserved.</p>
            <p>This is an automated notification from the order management system.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
