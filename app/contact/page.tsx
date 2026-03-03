'use client'
import { useState } from 'react';
import { Instagram } from 'lucide-react';
import { Bird } from 'lucide-react';
import { CircleAlert } from 'lucide-react';


// Tailwind styling for repeated components
const contactStyles = {
  h2: "text-xl font-semibold",
  infoSpan: "flex gap-4 items-center",
  label: "block text-md font-semibold mb-1",
  input: "w-full bg-(--header) border border-gray-300 rounded-sm shadow-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-(--input-border)"
};

// Decorative line
const DecLine = () => (
    <hr className="w-full border-0 h-[2px] bg-(--card-border)" />
  );

export default function ContactPage() {

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [err, setErr] = useState(false);
  const [submitted, setSubmittted] = useState(false);
  const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  /* TODO: Handle form submission
     - use Web3Forms to send email?
  */
  const handleSubmit = (event) => {
    event.preventDefault();
    if (userName.length === 0 || userEmail.length === 0 || userMessage.length === 0){
      setSubmittted(false);
      setPopupMessage("Please fill out all fields");
      setErr(true);
    }
    else if (!emailRegex.test(userEmail)){
      setSubmittted(false);
      setPopupMessage("Please enter a valid email address");
      setErr(true);
    }
    else{
      setErr(false);
      event.target.reset();
      setUserName("");
      setUserEmail("");
      setUserMessage("");
      setPopupMessage("Message Sent");
      setSubmittted(true);
      // setSubmitMsg(true);
      // const timeoutID = setTimeout(() => {
      //   setSubmitMsg(false), 3000
      // })
      // clearTimeout(timeoutID);
      // alert("form submitted");
    }
  }

  return (
    <div className="bg-(--header)">
      <h1 className="text-3xl font-medium text-center my-6">Contact</h1>
      <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-(--card-border) to-transparent" />
      <div className="relative flex max-w-5xl mx-auto my-8">
        
        {/* Contact form */}
        <div className="relative w-1/2">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-(--secondary) shadow-md rounded-lg">
            
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
              className={`${contactStyles.input} resize-none`}>
            </textarea>

            {/* Submission result message */}
            <div className="flex h-10 items-center">
              {err && 
                <span className="flex items-center gap-1">
                  <CircleAlert size={20} color="var(--rust)"/>
                  <p className="text-(--rust) font-medium">{popupMessage}</p>
                </span>
              }
              {submitted && 
                <span className="flex items-center gap-1">
                  <Bird size={20} color="var(--teal)"/>
                  <p className="text-(--teal) font-semibold">{popupMessage}</p>
                </span>
              }
            </div>

            <button type="submit" className="w-full bg-(--rust) text-white py-2 rounded-md hover:bg-(--dark-rust) transition">Send Message</button>
          </form>
        </div>

        {/* Store Information */}
        <div className="relative w-1/2 max-w-md mx-auto p-6 bg-(--secondary) shadow-md rounded-lg space-y-1">
          
          {/* Email */}
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Email</h2>
            <DecLine />
          </span>
          <p className="mb-5">beaconstgardens@email.com</p>

          {/* Market hours */}
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Hours</h2>
            <DecLine />
          </span>          
          <p className="mb-5">Saturdays 10AM - 1PM</p>

          {/* Location */}
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Location</h2>
            <DecLine />
          </span>
          <p>Address line 1</p>
          <p className="mb-5">Address line 2</p>

          {/* Pickup Details */}
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Pickup</h2>
            <DecLine />
          </span>
          <p className="mb-5">You can reserve items online for scheduled pickup</p>

          {/* Instagram */}
          <span className={`${contactStyles.infoSpan}`}>
            <h2 className={`${contactStyles.h2}`}>Follow</h2>
            <DecLine />
          </span>
          <span className="flex gap-2 items-center">
            <Instagram size={15} color="var(--text)" />
            <p>@beaconstgardens</p>
          </span>

        </div>
      </div>
    </div>
  );
}
