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
  label: "block text-md font-semibold mb-1",
  input:
    "w-full bg-(--header) border border-gray-300 rounded-sm shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-(--input-border)",
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
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  /* TODO: Handle form submission
     - use Web3Forms to send email?
     - loading icon during api calls
  */
  const handleSubmit = (event) => {
    event.preventDefault();
    if (
      userName.length === 0 ||
      userEmail.length === 0 ||
      userMessage.length === 0
    ) {
      // setSubmittted(false);
      setErrMessage("Please fill out all fields");
      setErr(true);
    } else if (!emailRegex.test(userEmail)) {
      setErrMessage("Please enter a valid email address");
      setErr(true);
    } else {
      setErr(false);
      event.target.reset();
      setSubmittted(true);
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
    <div className="bg-(--header)">
      <h1 className="text-3xl font-medium text-center my-6">Contact</h1>
      <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-(--card-border) to-transparent" />
      <div className="relative flex flex-col md:flex-row max-w-5xl mx-auto my-8 gap-8 md:gap-0">
        {/* Contact form */}
        <div className="relative w-auto md:w-1/2 mx-6">
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
              maxLength={200}
              className={`${contactStyles.input} resize-none`}
            ></textarea>

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
              className="w-full bg-(--rust) text-white py-2 rounded-md hover:bg-(--dark-rust) transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Store Information */}
        <div className="relative w-auto md:w-1/2 mx-6 p-6 bg-(--secondary) shadow-md rounded-lg space-y-1">
          {/* Email */}
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Email</h2>
            <DecLine />
          </span>
          <a
            href="https://www.instagram.com/crfrencho/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--rust)] transition-colors flex items-center mb-8"
          >
            <span>beaconstgardens@gmail.com</span>
          </a>

          {/* Market hours */}
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Farmers Market</h2>
            <DecLine />
          </span>
          <p className="mb-2">Squirrel Hill Farmers Market</p>
          <p className="mb-2">Sundays 9AM - 1PM</p>
          <address className="not-italic mb-8">
            <p>5737 Beacon St</p>
            <p>Pittsburgh, PA 15217</p>
          </address>

          {/* Location
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Location</h2>
            <DecLine />
          </span>
          <p>Address line 1</p>
          <p className="mb-5">Address line 2</p> */}

          {/* Pickup Details */}
          {/* <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Pickup</h2>
            <DecLine />
          </span>
          <p className="mb-5">You can reserve items online for scheduled pickup</p> */}

          {/* Social Media */}
          {/* TODO - make links */}
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Follow Us</h2>
            <DecLine />
          </span>

          <a
            href="https://www.instagram.com/crfrencho/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--rust)] transition-colors flex items-center gap-2"
          >
            <Instagram size={15} />
            <span>@beaconstgardens</span>
          </a>
          <a
            href="https://www.instagram.com/crfrencho/"
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
