// src/components/TermsModal.jsx

export default function TermsModal({ onClose, onAccept }) {
  return (
    // Overlay Gelap
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Kotak Modal */}
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
        
        {/* Header: Judul + Tombol X */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Terms & Conditions</h2>
          
          {/* Tombol X: Hanya Menutup (Tanpa Centang) */}
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold transition"
          >
            &times;
          </button>
        </div>

        {/* Body: Isi Teks Scrollable */}
        <div className="p-6 overflow-y-auto text-slate-600 text-sm leading-relaxed space-y-4 text-justify">
          
          <div>
            <h3 className="font-bold text-slate-800 mb-1">RUSH by Sonix</h3>
            <p className="text-xs text-slate-400">Last updated: January, 20th 2026</p>
            <p className="mt-2">
              RUSH is a digital product recommendation service developed and operated by Sonix. By registering for and using RUSH, you agree to comply with and be bound by these Terms & Conditions. If you do not agree to these terms, you must not access or use the service.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-1">Purpose of the Service</h3>
            <p>
              RUSH is designed to assist users in discovering running and trail footwear that may align with their preferences, usage context, and self-reported information. RUSH operates as a decision-support and recommendation tool only.
            </p>
            <p className="mt-2">
              All recommendations are generated using system-defined logic, product attributes, and user-provided data. RUSH does not determine absolute suitability or guarantee outcomes.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-1">Disclaimer</h3>
            <p>RUSH does not provide medical, clinical, biomechanical, or professional advice of any kind. Any information, insights, or recommendations provided through RUSH:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Are not intended as medical advice</li>
              <li>Are not a substitute for consultation with healthcare professionals, coaches, or footwear specialists</li>
              <li>Should not be relied upon in situations involving injury, chronic pain, medical conditions, or rehabilitation</li>
            </ul>
            <p className="mt-2">
              Users are strongly advised to seek professional guidance when necessary. Sonix makes no warranties or guarantees regarding product suitability, performance improvement, or injury prevention.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-1">Commercial Relationships</h3>
            <p>
              Products displayed or recommended through RUSH may originate from third-party brands, retailers, or marketplace partners. While Sonix aims to prioritize relevance and data quality, product availability, ranking, or inclusion does not constitute endorsement, guarantee, or obligation. RUSH does not claim to present a complete or exhaustive list of available products.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-1">Intellectual Property & Liability</h3>
            <p>
              All content, system logic, branding, and materials within RUSH are the intellectual property of Sonix. Unauthorized use, reproduction, or distribution is prohibited.
            </p>
            <p className="mt-2">
              To the fullest extent permitted by law, Sonix shall not be liable for any direct or indirect damages, including but not limited to personal injury, financial loss, dissatisfaction, or consequential damages arising from the use of RUSH or reliance on its recommendations.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-1">Acceptance of Terms</h3>
            <p>
              By creating an account and using RUSH, you confirm that you have read, understood, and agreed to these Terms & Conditions.
            </p>
            <p className="mt-2">
              Sonix reserves the right to suspend or terminate user access to RUSH if these Terms & Conditions are violated or if misuse of the service is identified.
            </p>
          </div>
        </div>

        {/* Footer: Tombol Setuju */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          {/* Tombol INI yang menjalankan onAccept (Tutup + Centang) */}
          <button 
            onClick={onAccept}
            className="bg-[#0a0a5c] text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-900 transition shadow-md"
          >
            I Agree & Close
          </button>
        </div>

      </div>
    </div>
  );
}