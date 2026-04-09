/**
 * Email Service for ZeptoMail Integration
 * Handles sending transactional emails for order confirmations and status updates
 */

import type { OrderItem, ServiceRequest, WhatsAppLead } from '../../shared/types';
import { getDeliveryPolicy } from '../../shared/utils';

interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
}

interface OrderPricingSummary {
  itemsTotal: number;
  deliveryFee: number | null;
  totalPrice: number;
}

const NO_REPLY_EMAIL = 'no-reply@pzm.ae';
const TEAM_NOTIFICATION_EMAIL = 'islam.thwabeh@gmail.com';
const CONTACT_PHONE_DISPLAY = '+971 52 802 6677';
const CONTACT_PHONE_E164 = '+971528026677';
const CONTACT_WHATSAPP_URL = 'https://wa.me/971528026677?text=Hi%2C%20I%20need%20help%20with%20my%20PZM%20order%20or%20service%20request.';

export class EmailService {
  private apiToken: string;
  private senderEmail: string = NO_REPLY_EMAIL;
  private teamEmail: string = TEAM_NOTIFICATION_EMAIL;
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

  private formatServiceRequestId(id: string): string {
    const parts = id?.split('-');
    const randomPart = parts?.[parts.length - 1] || id || '000000';
    return `SRQ-${randomPart.toUpperCase()}`;
  }

  private formatLabel(value: string): string {
    return value
      .split(/[_-]/)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  private formatServiceRequestStatusLabel(status: string): string {
    switch (status) {
      case 'contacted':
      case 'quoted':
      case 'scheduled':
      case 'completed':
        return 'Confirmed';
      case 'cancelled':
        return 'Canceled';
      case 'pending':
      default:
        return 'Pending';
    }
  }

  private getCustomerContactNoteHtml(): string {
    return '';
  }

  private getInternalNotificationNoteHtml(): string {
    return '';
  }

  /**
   * Send email via ZeptoMail API
   */
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const payload = {
        from: {
          address: this.senderEmail,
          name: 'PZM Notifications',
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
    pricing: OrderPricingSummary,
    notes?: string,
    customerAddress?: string
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getOrderConfirmationTemplate(
      customerName,
      displayId,
      orderItems,
      pricing,
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
    pricing: OrderPricingSummary,
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
      pricing,
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
    orderItems: OrderItem[]
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getStatusUpdateTemplate(
      customerName,
      displayId,
      status,
      orderItems
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
    orderItems: OrderItem[]
  ): Promise<boolean> {
    const displayId = this.formatOrderId(orderId);
    const htmlBody = this.getStatusUpdateTeamTemplate(
      displayId,
      customerName,
      status,
      orderItems
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

  async sendServiceRequestConfirmation(request: ServiceRequest): Promise<boolean> {
    if (!request.customer_email) return true;

    const displayId = this.formatServiceRequestId(request.id);
    const htmlBody = this.getServiceRequestConfirmationTemplate(request, displayId);

    return this.sendEmail({
      to: request.customer_email,
      subject: `We Received Your Service Request - ${displayId}`,
      htmlBody,
    });
  }

  async sendServiceRequestNotification(request: ServiceRequest): Promise<boolean> {
    const displayId = this.formatServiceRequestId(request.id);
    const htmlBody = this.getServiceRequestNotificationTemplate(request, displayId);

    return this.sendEmail({
      to: this.teamEmail,
      subject: `New Service Request - ${displayId}`,
      htmlBody,
    });
  }

  async sendServiceRequestStatusUpdate(request: ServiceRequest): Promise<boolean> {
    if (!request.customer_email) return true;

    const displayId = this.formatServiceRequestId(request.id);
    const htmlBody = this.getServiceRequestStatusUpdateTemplate(request, displayId);

    return this.sendEmail({
      to: request.customer_email,
      subject: `Service Request Update - ${displayId}`,
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
    pricing: OrderPricingSummary,
    notes?: string,
    customerAddress?: string
  ): string {
    const deliveryPolicy = getDeliveryPolicy(pricing.itemsTotal, customerAddress);
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

    const deliveryHtml = `
      <div class="order-details" style="background: ${deliveryPolicy.qualifiesForFreeDelivery ? '#ecfdf5' : '#fff8e1'}; border-left: 4px solid ${deliveryPolicy.qualifiesForFreeDelivery ? '#16a34a' : '#ff9800'};">
        <div class="detail-row">
          <span class="label">🚚 Delivery:</span>
          <span class="value"><strong>${deliveryPolicy.statusLabel}</strong></span>
        </div>
        <div class="detail-row">
          <span class="label">Policy:</span>
          <span class="value">${deliveryPolicy.detailedRule}</span>
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00A76F 0%, #16a34a 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 22px; }
          .content { background: #f9f9f9; padding: 24px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
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
                <span class="label">Items Total:</span>
                <span class="value">AED ${pricing.itemsTotal.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Delivery Fee:</span>
                <span class="value">${deliveryPolicy.deliveryFee === null ? 'Confirmed by location' : deliveryPolicy.qualifiesForFreeDelivery ? 'Free' : `AED ${pricing.deliveryFee?.toFixed(2) ?? '0.00'}`}</span>
              </div>
              <div class="detail-row">
                <span class="label">${deliveryPolicy.totalLabel}:</span>
                <span class="value">AED ${pricing.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            ${deliveryHtml}
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Your order is being prepared for shipment</li>
              <li>You'll receive a notification when it's ready for delivery</li>
              <li>${deliveryPolicy.detailedRule}</li>
              <li>We will keep you updated as your order moves through confirmation, preparation, and delivery.</li>
            </ul>
            ${this.getCustomerContactNoteHtml()}
            
            <p>Thank you for shopping with PZM Shop!</p>
            
            <p>
              <strong>Best regards,</strong><br>
              PZM Shop Team
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PZM Shop. All rights reserved.</p>
            <p>This is an automated email from ${this.senderEmail}. Replies are not monitored.</p>
            <div class="unsubscribe">
              <p>For help, use WhatsApp or phone support instead of replying.</p>
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
    pricing: OrderPricingSummary,
    notes?: string,
    customerAddress?: string
  ): string {
    const deliveryPolicy = getDeliveryPolicy(pricing.itemsTotal, customerAddress);
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

    const deliveryHtml = `
      <div class="customer-info" style="background: ${deliveryPolicy.qualifiesForFreeDelivery ? '#ecfdf5' : '#fff8e1'}; border-left: 4px solid ${deliveryPolicy.qualifiesForFreeDelivery ? '#16a34a' : '#ff9800'};">
        <div class="info-row">
          <span class="label">🚚 Delivery:</span>
          <span><strong>${deliveryPolicy.statusLabel}</strong></span>
        </div>
        <div class="info-row">
          <span class="label">Policy:</span>
          <span>${deliveryPolicy.detailedRule}</span>
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #00A76F; color: white; padding: 16px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 20px; }
          .content { background: #f9f9f9; padding: 24px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
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
                <span class="label">Items Total:</span>
                <span style="font-size: 18px; font-weight: bold; color: #00A76F;">AED ${pricing.itemsTotal.toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="label">Delivery Fee:</span>
                <span>${deliveryPolicy.deliveryFee === null ? 'Confirmed by location' : deliveryPolicy.qualifiesForFreeDelivery ? 'Free' : `AED ${pricing.deliveryFee?.toFixed(2) ?? '0.00'}`}</span>
              </div>
              <div class="info-row">
                <span class="label">${deliveryPolicy.totalLabel}:</span>
                <span style="font-size: 18px; font-weight: bold; color: #00A76F;">AED ${pricing.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            ${deliveryHtml}
            
            <p><strong>Action Required:</strong></p>
            <ul>
              <li>Process the order and prepare items for shipment</li>
              <li>${deliveryPolicy.deliveryFee === null ? 'Confirm the delivery fee based on the customer location before dispatch' : 'Use the stored delivery fee when arranging dispatch and collection'}</li>
              <li>Contact customer if needed</li>
              <li>Update order status in admin panel</li>
            </ul>
            ${this.getInternalNotificationNoteHtml()}
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PZM Shop - Internal Notification</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getOrderItemsStatusHtml(orderItems: OrderItem[]): string {
    if (orderItems.length === 0) {
      return `
        <div class="order-details">
          <div class="detail-row">
            <span class="label">Items:</span>
            <span>Your order items are being processed. Contact support if you need a refreshed summary.</span>
          </div>
        </div>
      `;
    }

    return orderItems.map((item, index) => `
      <div class="product-item">
        <div class="product-number">${index + 1}</div>
        <div class="detail-row">
          <span class="label">Product:</span>
          <span>${item.product?.model || 'Order item'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Storage:</span>
          <span>${item.product?.storage || 'Not recorded'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Condition:</span>
          <span>${item.product?.condition === 'new' ? '✨ Brand New' : item.product?.condition === 'used' ? '📱 Used' : 'Not recorded'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Color:</span>
          <span>${item.product?.color || 'Not recorded'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Quantity:</span>
          <span>${item.quantity}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Status Update Email Template
   */
  private getStatusUpdateTemplate(
    customerName: string,
    orderId: string,
    status: string,
    orderItems: OrderItem[]
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
          .header { background: linear-gradient(135deg, ${info.color} 0%, ${info.color}dd 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 22px; }
          .header .emoji { font-size: 28px; margin-bottom: 6px; }
          .content { background: #f9f9f9; padding: 24px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .status-message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${info.color}; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .product-item { background: #fafafa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${info.color}; }
          .product-number { display: inline-block; background: ${info.color}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; margin-bottom: 10px; }
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
                <span class="label">Status:</span>
                <span><strong>${status.replace(/_/g, ' ').toUpperCase()}</strong></span>
              </div>
            </div>

            <h3 style="color: ${info.color}; margin-top: 20px;">Order Items (${orderItems.length || 0})</h3>
            ${this.getOrderItemsStatusHtml(orderItems)}
            
            ${this.getCustomerContactNoteHtml()}
            
            <p>
              <strong>Thank you for shopping with PZM Shop!</strong><br>
              Best regards,<br>
              PZM Shop Team
            </p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PZM Computers & Phones Store. All rights reserved.</p>
            <p>This is an automated email from ${this.senderEmail}. Replies are not monitored.</p>
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
    orderItems: OrderItem[]
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
          .header { background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 16px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 20px; }
          .content { background: #f9f9f9; padding: 24px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .alert { background: #FFF3CD; border-left: 4px solid ${color}; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .product-item { background: #fafafa; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${color}; }
          .product-number { display: inline-block; background: ${color}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; margin-bottom: 10px; }
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
                <span class="label">New Status: </span>
                <span><strong>${status.replace(/_/g, ' ').toUpperCase()}</strong></span>
              </div>
            </div>

            <h3 style="color: ${color}; margin-top: 20px;">Order Items (${orderItems.length || 0})</h3>
            ${this.getOrderItemsStatusHtml(orderItems)}
            
            <p><strong>Note:</strong> Customer has been notified about this status change.</p>
            ${this.getInternalNotificationNoteHtml()}
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

  private getServiceRequestConfirmationTemplate(request: ServiceRequest, requestId: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00A76F 0%, #16a34a 100%); color: white; padding: 16px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 24px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: flex-start; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #00A76F; min-width: 160px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Service Request Received</h1>
            <p>Your request is now in our system.</p>
          </div>
          <div class="content">
            <p>Hi ${request.customer_name},</p>
            <p>We received your service request and recorded it under the reference below.</p>
            <div class="details">
              <div class="detail-row">
                <span class="label">Reference ID:</span>
                <span><strong>${requestId}</strong></span>
              </div>
              <div class="detail-row">
                <span class="label">Service:</span>
                <span>${this.formatLabel(request.service_type)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Request Type:</span>
                <span>${this.formatLabel(request.request_kind)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Preferred Contact:</span>
                <span>${this.formatLabel(request.preferred_contact_method || 'phone')}</span>
              </div>
              <div class="detail-row">
                <span class="label">Preferred Date:</span>
                <span>${request.preferred_date || 'Not provided'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Details:</span>
                <span>${request.details}</span>
              </div>
            </div>
            <p>We will review the request and follow up through your selected contact method.</p>
            ${this.getCustomerContactNoteHtml()}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PZM Computers & Phones Store. All rights reserved.</p>
            <p>This is an automated email from ${this.senderEmail}. Replies are not monitored.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getServiceRequestNotificationTemplate(request: ServiceRequest, requestId: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #00A76F; color: white; padding: 16px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 24px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #00A76F; display: inline-block; min-width: 160px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛠️ New Service Request</h1>
          </div>
          <div class="content">
            <p><strong>A new service request has been submitted.</strong></p>
            <div class="details">
              <div class="detail-row"><span class="label">Reference ID:</span><span>${requestId}</span></div>
              <div class="detail-row"><span class="label">Customer:</span><span>${request.customer_name}</span></div>
              <div class="detail-row"><span class="label">Email:</span><span>${request.customer_email || 'Not provided'}</span></div>
              <div class="detail-row"><span class="label">Phone:</span><span>${request.customer_phone}</span></div>
              <div class="detail-row"><span class="label">Service:</span><span>${this.formatLabel(request.service_type)}</span></div>
              <div class="detail-row"><span class="label">Request Type:</span><span>${this.formatLabel(request.request_kind)}</span></div>
              <div class="detail-row"><span class="label">Preferred Contact:</span><span>${this.formatLabel(request.preferred_contact_method || 'phone')}</span></div>
              <div class="detail-row"><span class="label">Preferred Date:</span><span>${request.preferred_date || 'Not provided'}${request.preferred_time_period ? ` (${this.formatLabel(request.preferred_time_period)})` : ''}</span></div>
              <div class="detail-row"><span class="label">Source Page:</span><span>${request.source_page || 'Not recorded'}</span></div>
              <div class="detail-row"><span class="label">Address:</span><span>${request.customer_address || 'Not provided'}</span></div>
              <div class="detail-row"><span class="label">Status:</span><span>${this.formatLabel(request.status)}</span></div>
              <div class="detail-row"><span class="label">Details:</span><span>${request.details}</span></div>
            </div>
            ${this.getInternalNotificationNoteHtml()}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PZM Computers & Phones Store - Internal Notification</p>
            <p>This is an automated notification from the service request system.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getServiceRequestStatusUpdateTemplate(request: ServiceRequest, requestId: string): string {
    const statusTitle = this.formatServiceRequestStatusLabel(request.status);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00A76F 0%, #16a34a 100%); color: white; padding: 16px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 24px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: flex-start; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #00A76F; min-width: 160px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Service Request Update</h1>
            <p>Your request status has changed to ${statusTitle}.</p>
          </div>
          <div class="content">
            <p>Hi ${request.customer_name},</p>
            <div class="details">
              <div class="detail-row"><span class="label">Reference ID:</span><span><strong>${requestId}</strong></span></div>
              <div class="detail-row"><span class="label">Service:</span><span>${this.formatLabel(request.service_type)}</span></div>
              <div class="detail-row"><span class="label">Status:</span><span><strong>${statusTitle}</strong></span></div>
              <div class="detail-row"><span class="label">Last Updated:</span><span>${request.updated_at}</span></div>
            </div>
            ${this.getCustomerContactNoteHtml()}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PZM Computers & Phones Store. All rights reserved.</p>
            <p>This is an automated email from ${this.senderEmail}. Replies are not monitored.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ============ WHATSAPP LEAD EMAILS ============

  async sendWhatsAppLeadNotification(lead: WhatsAppLead): Promise<boolean> {
    const displayId = this.formatWhatsAppLeadId(lead.id);
    const htmlBody = this.getWhatsAppLeadNotificationTemplate(lead, displayId);

    return this.sendEmail({
      to: this.teamEmail,
      subject: `New WhatsApp Lead - ${displayId} (${this.formatLabel(lead.lead_type)})`,
      htmlBody,
    });
  }

  private formatWhatsAppLeadId(id: string): string {
    const parts = id?.split('-');
    const randomPart = parts?.[parts.length - 1] || id || '000000';
    return `WAL-${randomPart.toUpperCase()}`;
  }

  private getWhatsAppLeadNotificationTemplate(lead: WhatsAppLead, displayId: string): string {
    const priceHtml = lead.reference_price != null
      ? `<div class="info-row"><span class="label">Price:</span><span>AED ${lead.reference_price.toFixed(2)}</span></div>`
      : '';

    const locationParts = [lead.city, lead.country].filter(Boolean).join(', ');
    const isUae = lead.country === 'AE';
    const locationHtml = locationParts
      ? `<div class="info-row"><span class="label">Location:</span><span>${locationParts} ${isUae ? '<strong style="color:#16a34a;">\u{1F4CD} UAE</strong>' : '<strong style="color:#dc2626;">\u26A0 Outside UAE</strong>'}</span></div>`
      : '';
    const ipHtml = lead.ip_address
      ? `<div class="info-row"><span class="label">IP Address:</span><span>${lead.ip_address}</span></div>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #25D366; color: white; padding: 16px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 20px; }
          .content { background: #f9f9f9; padding: 24px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .alert { background: #e8f5e9; border-left: 4px solid #25D366; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #00A76F; display: inline-block; min-width: 140px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New WhatsApp Lead</h1>
          </div>
          <div class="content">
            <div class="alert">
              <strong>A visitor clicked the WhatsApp button</strong> on the site. The lead is registered as <strong>${displayId}</strong>.
            </div>
            <div class="details">
              <div class="info-row"><span class="label">Lead ID:</span><span><strong>${displayId}</strong></span></div>
              <div class="info-row"><span class="label">Type:</span><span>${this.formatLabel(lead.lead_type)}</span></div>
              <div class="info-row"><span class="label">Item:</span><span>${lead.reference_label}</span></div>
              ${priceHtml}
              <div class="info-row"><span class="label">Source Page:</span><span>${lead.source_page || 'Unknown'}</span></div>
              ${locationHtml}
              ${ipHtml}
              <div class="info-row"><span class="label">Status:</span><span>${this.formatLabel(lead.status)}</span></div>
              <div class="info-row"><span class="label">Time:</span><span>${lead.created_at}</span></div>
            </div>
            <p><strong>WhatsApp message sent by visitor:</strong></p>
            <div class="details" style="background: #e8f5e9;">
              <p style="margin: 0;">${lead.whatsapp_message}</p>
            </div>
            <p>Check the WhatsApp Business inbox for an incoming message and follow up accordingly.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PZM Shop - Internal Lead Notification</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ============ DAILY & MONTHLY REPORTS ============

  async sendDailyReport(data: {
    date: string;
    orders: number;
    serviceRequests: number;
    whatsappLeads: number;
    uaeLeads: number;
    nonUaeLeads: number;
    recentLeads: WhatsAppLead[];
    recentServiceRequests: ServiceRequest[];
  }): Promise<boolean> {
    const html = this.getDailyReportTemplate(data);
    return this.sendEmail({
      to: this.teamEmail,
      subject: `PZM Daily Report – ${data.date}`,
      htmlBody: html,
    });
  }

  async sendMonthlyReport(data: {
    month: string;
    orders: number;
    serviceRequests: number;
    whatsappLeads: number;
    uaeLeads: number;
    nonUaeLeads: number;
  }): Promise<boolean> {
    const html = this.getMonthlyReportTemplate(data);
    return this.sendEmail({
      to: this.teamEmail,
      subject: `PZM Monthly Report – ${data.month}`,
      htmlBody: html,
    });
  }

  private getDailyReportTemplate(data: {
    date: string;
    orders: number;
    serviceRequests: number;
    whatsappLeads: number;
    uaeLeads: number;
    nonUaeLeads: number;
    recentLeads: WhatsAppLead[];
    recentServiceRequests: ServiceRequest[];
  }): string {
    const leadsRows = data.recentLeads.length > 0
      ? data.recentLeads.map(l => {
        const loc = [l.city, l.country].filter(Boolean).join(', ') || '-';
        const isUae = l.country === 'AE';
        const badge = l.country
          ? (isUae
            ? '<span style="background:#dcfce7;color:#16a34a;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;">UAE</span>'
            : '<span style="background:#fee2e2;color:#dc2626;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;">Outside UAE</span>')
          : '';
        return `
        <tr>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${l.lead_type}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${l.reference_label}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${loc} ${badge}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${l.status}</td>
        </tr>`;
      }).join('')
      : '<tr><td colspan="4" style="padding:10px;text-align:center;color:#999;">No leads yesterday</td></tr>';

    const srRows = data.recentServiceRequests.length > 0
      ? data.recentServiceRequests.map(sr => `
        <tr>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${sr.service_type}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${sr.customer_name}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${sr.status}</td>
        </tr>`).join('')
      : '<tr><td colspan="3" style="padding:10px;text-align:center;color:#999;">No service requests yesterday</td></tr>';

    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f7;">
      <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:20px 24px;color:#fff;">
          <h1 style="margin:0;font-size:20px;">Daily Report – ${data.date}</h1>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr>
              <td style="padding:12px;text-align:center;background:#f0f7ff;border-radius:6px;">
                <div style="font-size:28px;font-weight:bold;color:#2563eb;">${data.whatsappLeads}</div>
                <div style="font-size:12px;color:#666;margin-top:4px;">WhatsApp Leads</div>
              </td>
              <td style="width:8px;"></td>
              <td style="padding:12px;text-align:center;background:#f0fdf4;border-radius:6px;">
                <div style="font-size:28px;font-weight:bold;color:#16a34a;">${data.orders}</div>
                <div style="font-size:12px;color:#666;margin-top:4px;">Orders</div>
              </td>
              <td style="width:8px;"></td>
              <td style="padding:12px;text-align:center;background:#fefce8;border-radius:6px;">
                <div style="font-size:28px;font-weight:bold;color:#ca8a04;">${data.serviceRequests}</div>
                <div style="font-size:12px;color:#666;margin-top:4px;">Service Requests</div>
              </td>
            </tr>
          </table>

          <h3 style="margin:20px 0 8px;font-size:14px;color:#333;">Recent WhatsApp Leads</h3>
          ${data.whatsappLeads > 0 ? `<p style="margin:0 0 8px;font-size:13px;"><span style="color:#16a34a;font-weight:600;">${data.uaeLeads} of ${data.whatsappLeads} leads from UAE (valid)</span>${data.nonUaeLeads > 0 ? ` &middot; <span style="color:#999;">${data.nonUaeLeads} outside UAE</span>` : ''}</p>` : ''}
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f9fafb;">
              <th style="padding:6px 10px;text-align:left;">Type</th>
              <th style="padding:6px 10px;text-align:left;">Reference</th>
              <th style="padding:6px 10px;text-align:left;">Location</th>
              <th style="padding:6px 10px;text-align:left;">Status</th>
            </tr></thead>
            <tbody>${leadsRows}</tbody>
          </table>

          <h3 style="margin:20px 0 8px;font-size:14px;color:#333;">Recent Service Requests</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="background:#f9fafb;">
              <th style="padding:6px 10px;text-align:left;">Service</th>
              <th style="padding:6px 10px;text-align:left;">Customer</th>
              <th style="padding:6px 10px;text-align:left;">Status</th>
            </tr></thead>
            <tbody>${srRows}</tbody>
          </table>
        </div>
        <div style="padding:16px 24px;background:#f9fafb;text-align:center;font-size:12px;color:#999;">
          <p style="margin:0;">© ${new Date().getFullYear()} PZM Shop – Automated Daily Report</p>
        </div>
      </div>
    </body></html>`;
  }

  private getMonthlyReportTemplate(data: {
    month: string;
    orders: number;
    serviceRequests: number;
    whatsappLeads: number;
    uaeLeads: number;
    nonUaeLeads: number;
  }): string {
    const total = data.whatsappLeads + data.orders + data.serviceRequests;
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f7;">
      <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#1e3a5f,#7c3aed);padding:20px 24px;color:#fff;">
          <h1 style="margin:0;font-size:20px;">Monthly Report – ${data.month}</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;color:#555;">Here's your monthly summary for <strong>${data.month}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:16px;text-align:center;background:#f0f7ff;border-radius:6px;">
                <div style="font-size:32px;font-weight:bold;color:#2563eb;">${data.whatsappLeads}</div>
                <div style="font-size:12px;color:#666;margin-top:4px;">WhatsApp Leads</div>
              </td>
              <td style="width:8px;"></td>
              <td style="padding:16px;text-align:center;background:#f0fdf4;border-radius:6px;">
                <div style="font-size:32px;font-weight:bold;color:#16a34a;">${data.orders}</div>
                <div style="font-size:12px;color:#666;margin-top:4px;">Orders</div>
              </td>
              <td style="width:8px;"></td>
              <td style="padding:16px;text-align:center;background:#fefce8;border-radius:6px;">
                <div style="font-size:32px;font-weight:bold;color:#ca8a04;">${data.serviceRequests}</div>
                <div style="font-size:12px;color:#666;margin-top:4px;">Service Requests</div>
              </td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:6px;text-align:center;">
            <div style="font-size:14px;color:#666;">Total Interactions</div>
            <div style="font-size:36px;font-weight:bold;color:#1e3a5f;">${total}</div>
          </div>
          ${data.whatsappLeads > 0 ? `
          <div style="margin-top:16px;padding:16px;background:#f0fdf4;border-radius:6px;border:1px solid #bbf7d0;">
            <div style="font-size:13px;font-weight:600;color:#333;margin-bottom:8px;">Lead Quality</div>
            <table style="width:100%;font-size:13px;">
              <tr>
                <td style="padding:4px 0;"><span style="color:#16a34a;font-weight:600;">\u2705 UAE (valid)</span></td>
                <td style="padding:4px 0;text-align:right;font-weight:bold;color:#16a34a;">${data.uaeLeads}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;"><span style="color:#999;">Outside UAE</span></td>
                <td style="padding:4px 0;text-align:right;font-weight:bold;color:#999;">${data.nonUaeLeads}</td>
              </tr>
            </table>
          </div>` : ''}
        </div>
        <div style="padding:16px 24px;background:#f9fafb;text-align:center;font-size:12px;color:#999;">
          <p style="margin:0;">© ${new Date().getFullYear()} PZM Shop – Automated Monthly Report</p>
        </div>
      </div>
    </body></html>`;
  }
}
