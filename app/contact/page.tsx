"use client";
import Link from "next/link";
import { useState } from "react";
import { Instagram, Facebook } from "lucide-react";
import { Sprout } from "lucide-react";
import { CircleAlert } from "lucide-react";

// Tailwind styling for repeated components
const contactStyles = {
  h2: "text-xl font-semibold text-nowrap mb-2",
  infoSpan: "flex gap-4 items-center",
  label: "block text-base font-medium text-[var(--text)] mb-1",
  input: "w-full px-3 py-2 bg-[var(--header)] border border-[var(--input-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--teal)] text-sm text-[var(--text)]",
};

// Decorative line
const DecLine = () => (
  <hr className="w-full border-0 h-[2px] bg-(--card-border)" />
);

export default function ContactPage() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [err, setErr] = useState(false);
  const [submitted, setSubmittted] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (userName.length === 0 || userEmail.length === 0 || userMessage.length === 0) {
      setErrMessage("Please fill out all fields");
      setErr(true);
      return;
    }
    if (!emailRegex.test(userEmail)) {
      setErrMessage("Please enter a valid email address");
      setErr(true);
      return;
    }

    setErr(false);
    setLoading(true);

    const res = await fetch('/api/send-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName, email: userEmail, message: userMessage }),
    });

    setLoading(false);

    if (res.ok) {
      event.target.reset();
      setSubmittted(true);
    } else {
      setErrMessage("Something went wrong. Please try again.");
      setErr(true);
    }
  };

  const exitSubmit = () => {
    setUserName("");
    setUserEmail("");
    setUserMessage("");
    setSubmittted(false);
  };

  // confirmation screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--header)] flex flex-col items-center justify-center px-8">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-10 max-w-md w-full text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <Sprout size={40} className="text-[var(--teal)]" />
          </div>
          <h2 className="text-2xl font-semibold text-[var(--text)] mb-2">
            Message Sent!
          </h2>
          <p className="text-sm text-[var(--text)] mb-4">
            Thanks for reaching out, we'll review your message soon.
          </p>
          <button
            onClick={exitSubmit}
            className="bg-[var(--teal)] hover:bg-[var(--teal-hover)] text-white px-6 py-2.5 rounded-md transition-colors font-medium text-sm"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-(--header) mx-auto px-4 md:px-8 py-6 md:py-10 max-w-5xl">
      {/* page title */}
      <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text)] mb-2 text-center">
        Contact Us
      </h1>
      <div className="border-t border-[var(--card-border)] mb-8" />

      <div className="relative flex flex-col md:flex-row my-8 gap-8">
        {/* Contact form */}
        <div className="relative w-auto md:w-1/2 order-2 md:order-1">
          <form
            onSubmit={handleSubmit}
            className="p-6 bg-(--secondary) shadow-md rounded-lg"
          >
            {/* Name */}
            <label htmlFor="senderName" className={`${contactStyles.label}`}>
              Name <span className="text-[var(--rust)]">*</span>
            </label>
            <input
              type="text"
              name="senderName"
              onChange={(e) => setUserName(e.target.value)}
              className={`${contactStyles.input} mb-4`}
            />

            {/* Email */}
            <label htmlFor="senderEmail" className={`${contactStyles.label}`}>
              Email <span className="text-[var(--rust)]">*</span>
            </label>
            <input
              type="text"
              name="senderEmail"
              onChange={(e) => setUserEmail(e.target.value)}
              className={`${contactStyles.input} mb-4`}
            />

            {/* Message */}
            <label htmlFor="message" className={`${contactStyles.label}`}>
              Message <span className="text-[var(--rust)]">*</span>
            </label>
            <textarea
              rows={4}
              name="message"
              onChange={(e) => setUserMessage(e.target.value)}
              maxLength={1000}
              className={`${contactStyles.input} resize-none`}
            ></textarea>
            <p className={`text-xs text-right mt-1 ${userMessage.length >= 1000 ? 'text-[var(--rust)]' : 'text-[var(--input-border)]'}`}>
              {userMessage.length} / 1000
            </p>

            {/* Error message */}
            <div className="flex h-10 items-center">
              {err && (
                <span className="flex items-center gap-1">
                  <CircleAlert size={20} color="var(--rust)" />
                  <p className="text-(--rust) font-medium">{errMessage}</p>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-(--rust) text-white py-2 rounded-md hover:bg-(--dark-rust) transition disabled:opacity-60"
            >
               {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Store Information */}
        <div className="relative w-auto md:w-1/2 p-6 bg-(--secondary) shadow-md rounded-lg space-y-1 order-1 md:order-2">
          {/* Email */}
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Email</h2>
            <DecLine />
          </span>
          <a
            href="mailto:beaconstgardens@gmail.com"
            className="hover:text-[var(--rust)] transition-colors flex items-center mb-8"
          >
            <span>beaconstgardens@gmail.com</span>
          </a>

          {/* Market hours */}
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Farmers Market</h2>
            <DecLine />
          </span>
          <p className="mb-2">Down the street from the Squirrel Hill Farmers Market</p>
          <p className="mb-2">Sundays 9AM - 1PM</p>
          <address className="not-italic mb-8">
            <p>On Beacon St Near Wightman St</p>
            <p>Pittsburgh, PA 15217</p>
          </address>

          {/* Social Media */}
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Follow Us</h2>
            <DecLine />
          </span>
          {/* <a
            href="https://www.facebook.com/profile.php?id=61587902987683"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--rust)] transition-colors flex items-center gap-2"
          >
            <Instagram size={15} />
            <span>@beaconstgardens</span>
          </a> */}
          <a
            href="https://www.facebook.com/profile.php?id=61587902987683"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--rust)] transition-colors flex items-center gap-2"
          >
            <Facebook size={15} />
            <span>@beaconstgardens</span>
          </a>
        </div>
      </div>
    </div>
  );
}
