import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { errorMessage, occurredAt, context } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `Beacon Street Gardens Reservation Error`,
      html: `
        <h2 style="color:#B8604C;">Reservation Error Alert</h2>
        <p><strong>Occurred at:</strong> ${occurredAt}</p>
        <p><strong>Error:</strong> ${errorMessage}</p>
        <hr/>
        <h3>Customer Info</h3>
        <p><strong>Name:</strong> ${context.customerName}</p>
        <p><strong>Email:</strong> ${context.customerEmail}</p>
        <h3>Cart Items</h3>
        <pre style="background:#f5f5f5;padding:12px;border-radius:4px;">${JSON.stringify(context.cartItems, null, 2)}</pre>
        <h3>Order Notes</h3>
        <p>${context.orderNotes || "(none)"}</p>
        <h3>Availability</h3>
        <pre style="background:#f5f5f5;padding:12px;border-radius:4px;">${JSON.stringify(context.availability, null, 2)}</pre>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to send error alert email:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}