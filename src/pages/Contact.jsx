import React, { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Ambil data dari form
    const { name, email, subject, message } = formData;

    // 2. Format Isi Pesan agar rapi saat dibuka di Gmail
    // Kita sertakan email pengirim di dalam body pesan, 
    // karena kita mengirim lewat akun Gmail pribadi user.
    const emailBody = `Name: ${name}\nUser Email: ${email}\n\nMessage:\n${message}`;

    // 3. Buat Link Khusus Gmail Web (Compose Mode)
    // view=cm (Compose Mode)
    // fs=1 (Fullscreen)
    // to (Tujuan)
    // su (Subject)
    // body (Isi Pesan)
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=sonix.rush.ai@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    // 4. Buka Gmail di Tab Baru
    window.open(gmailLink, '_blank');
    
    // Opsional: Reset form setelah membuka tab
    // setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    // Container Utama dengan padding agar tidak tertutup Navbar
    <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
      
      {/* Kartu Utama (Floating Card) */}
      <div className="w-full max-w-6xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        
        {/* BAGIAN KIRI: Informasi Kontak (Navy Blue Background) */}
        <div className="bg-[#010038] p-10 md:p-14 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Hiasan Lingkaran Abstrak */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>

          <div>
            <h2 className="text-4xl font-bold mb-4 font-serif">Report</h2>
            <p className="text-gray-300 text-lg mb-10 leading-relaxed">
              Help us improve RUSH! If you spot any errors, bugs, or can't find your favorite running shoes, 
              please share your feedback with us below.
            </p>

            {/* List Info Kontak */}
            <div className="space-y-8">

              {/* Email */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Email</h3>
                  <p className="text-gray-300">sonix.rush.ai@gmail.com</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Location</h3>
                  <p className="text-gray-300">Sentul, Indonesia</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN KANAN: Form Input (White Background) */}
        <div className="p-10 md:p-14 bg-white">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Grid Nama & Email */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 uppercase">Your Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#010038] focus:border-[#010038] block p-4 outline-none transition-all focus:bg-white shadow-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 uppercase">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#010038] focus:border-[#010038] block p-4 outline-none transition-all focus:bg-white shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 uppercase">Subject</label>
              <input 
                type="text" 
                name="subject"
                placeholder="Ex: Problem with recommendation..."
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#010038] focus:border-[#010038] block p-4 outline-none transition-all focus:bg-white shadow-sm"
                required
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 uppercase">Message</label>
              <textarea 
                name="message"
                rows="4" 
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#010038] focus:border-[#010038] block p-4 outline-none transition-all focus:bg-white shadow-sm resize-none"
                required
              ></textarea>
            </div>

            {/* Button */}
            <button 
              type="submit" 
              className="w-full text-white bg-[#010038] hover:bg-blue-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-xl text-lg px-5 py-4 text-center transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Send
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}