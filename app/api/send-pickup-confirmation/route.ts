import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { name, email, pickupTime, items, finalCost } = await req.json();

    await transporter.sendMail({
      from: `Beacon Street Gardens <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Pickup is Confirmed | Beacon Street Gardens',
      html: `
        <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; background: #F8F2F2; padding: 40px 32px;">

          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
            <img src="https://zcjkbrfiqelulixqjsjx.supabase.co/storage/v1/object/public/product-images/logo_optimized.png" alt="Beacon Street Gardens" width="48" height="56" style="display: block;" />
            <div>
              <div style="padding-left: 10px; font-size: 20px; color: #4D5143; font-weight: 500;">Beacon Street Gardens</div>
              <div style="padding-left: 10px; font-size: 11px; color: #9D9389; letter-spacing: 2px; text-transform: uppercase;">LLC</div>
            </div>
          </div>

          <hr style="border: none; border-top: 1px solid #D6CFCC; margin-bottom: 28px;" />

          <p style="font-size: 16px; color: #4D5143; margin: 0 0 8px 0;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #4D5143; line-height: 1.6; margin: 0 0 28px 0;">
            Your pickup has been confirmed! We'll see you at the time below. If this time no longer works, just reply to this email and we'll find a new time.
          </p>

          <h2 style="font-size: 11px; color: #9D9389; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px 0;">Pickup Time</h2>
          <div style="background: #EAE3E0; border-radius: 8px; padding: 14px 16px; margin-bottom: 28px;">
            <p style="font-size: 15px; color: #4D5143; margin: 0; font-weight: 500;">${pickupTime}</p>
          </div>

          <h2 style="font-size: 11px; color: #9D9389; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px 0;">Your Order</h2>
          <table style="width: 100%; border-collapse: collapse; background: #EAE3E0; border-radius: 8px; margin-bottom: 28px;">
            ${items.map((item: any, i: number) => `
              <tr style="${i < items.length - 1 ? 'border-bottom: 1px solid #D6CFCC;' : ''}">
                <td style="padding: 12px 16px; font-size: 14px; color: #4D5143;">${item.product_name} <span style="color: #9D9389;">×${item.quantity}</span></td>
                <td style="padding: 12px 16px; font-size: 14px; color: #4D5143; text-align: right; white-space: nowrap;">$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr style="border-top: 1px solid #D6CFCC;">
              <td style="padding: 12px 16px; font-size: 14px; font-weight: bold; color: #4D5143;">Total</td>
              <td style="padding: 12px 16px; font-size: 14px; font-weight: bold; color: #4D5143; text-align: right; white-space: nowrap;">$${finalCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 4px 16px 12px 16px; font-size: 12px; color: #9D9389; font-style: italic;">Payment is due at pickup.</td>
            </tr>
          </table>

          <hr style="border: none; border-top: 1px solid #D6CFCC; margin-bottom: 24px;" />

          <p style="font-size: 12px; color: #9D9389; margin: 0; line-height: 1.6;">
            Beacon Street Gardens LLC<br/>
            Have questions? Feel free to reply directly to this email.
          </p>

        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Pickup confirmation email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}