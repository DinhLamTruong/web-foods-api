import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const emailUser = this.configService.get<string>('email.user');
    const emailPass = this.configService.get<string>('email.pass');

    if (!emailUser || !emailPass) {
      console.warn(
        'Email configuration is missing. Email functionality will be disabled. Please set EMAIL_USER and EMAIL_PASS environment variables.',
      );
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  formatVietnameseDate(date: Date): string {
    return date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatVietnameseCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN') + ' VND';
  }

  generateOrderEmailTemplate(order: any): string {
    const orderItems = order.items || [];
    return `
      <div style="max-width: 800px; margin: 0 auto; background-color: #1e1e1e; padding: 20px; color: white;">
        <h1>Xin Chào ${order.fullName}</h1>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        <p><strong>Order Time:</strong> ${this.formatVietnameseDate(order.createdAt)}</p>
        <table style="width: 100%; border-spacing: 2px; border-collapse: separate; margin-top: 20px;">
          <thead>
            <tr style="background-color: #333; text-align: center;">
              <th style="border: 1px solid #a49987; padding: 10px;">Tên Sản Phẩm</th>
              <th style="border: 1px solid #a49987; padding: 10px;">Hình Ảnh</th>
              <th style="border: 1px solid #a49987; padding: 10px;">Giá</th>
              <th style="border: 1px solid #a49987; padding: 10px;">Số Lượng</th>
              <th style="border: 1px solid #a49987; padding: 10px;">Thành Tiền</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems
              .map(
                (item: any, index: number) => `
                <tr style="text-align: center;" key=${index}>
                  <td style="border: 1px solid #a49987; padding: 10px;">
                    ${item.description}
                  </td>
                  <td style="border: 1px solid #a49987; padding: 2px 0;">
                    <img
                      src="${item.imageUrl}"
                      alt="${item.description}"
                      style="width: 60px;"
                    />
                  </td>
                  <td style="border: 1px solid #a49987; padding: 10px;">
                    ${this.formatVietnameseCurrency(item.price)}
                  </td>
                  <td style="border: 1px solid #a49987; padding: 10px;">
                    ${item.quantity}
                  </td>
                  <td style="border: 1px solid #a49987; padding: 10px;">
                    ${this.formatVietnameseCurrency(
                      item.price * item.quantity,
                    )}
                  </td>
                </tr>
              `,
              )
              .join('')}
          </tbody>
        </table>
        <h2 style="padding: 10px 0;">Tổng Thanh Toán: ${this.formatVietnameseCurrency(
          order.totalPrice,
        )}</h2>
        <h2 style="margin-top: 10px;">Cảm ơn bạn!</h2>
      </div>
    `;
  }

  async sendOrderConfirmation(order: any): Promise<void> {
    if (!order.email) {
      console.log(
        'No email provided for order confirmation, skipping email send',
      );
      return;
    }

    if (!this.transporter) {
      console.log('Email service is disabled, skipping email send');
      return;
    }

    try {
      const emailBody = this.generateOrderEmailTemplate(order);
      const mailOptions = {
        from: `"Admin 👻" <${this.configService.get<string>('email.user')}>`,
        to: order.email,
        subject: 'Confirm Your Order ✔',
        text: 'Confirm Your Order ✔',
        html: emailBody,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent: %s', info.messageId);
    } catch (error: any) {
      console.error(
        'Error while sending order confirmation email:',
        error,
      );
      throw new Error(
        `Failed to send order confirmation email: ${error.message}`,
      );
    }
  }
}
