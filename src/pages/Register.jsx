import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// 1. Gunakan instance api buatan kita
import api from "../api/axios"; 
import TermsModal from "../components/TermsModal";

export default function Register() {
  const navigate = useNavigate();

  // STATE
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState("register"); // 'register' atau 'verify'

  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // --- EFFECT UNTUK JALANIN TIMER ---
  useEffect(() => {
    let interval;
    if (step === "verify" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // HANDLE CHANGE
  const handleChange = (e) => {
    const { id, value } = e.target;
    if (step === 'verify' && id === 'otpCode') {
        setOtpCode(value);
    } else {
        setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  // --- 1. PROSES REGISTER (Minta OTP) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms & Conditions."); return;
    }

    setIsLoading(true);

    try {
      // 2. Gunakan instance api (URL otomatis ke Railway/Backend)
      await api.post("/api/register/", {
        email: formData.email,
        password: formData.password
      });

      setStep("verify"); 
      setResendTimer(60);
      alert("Kode OTP telah dikirim ke email kamu!");

    } catch (err) {
      const data = err.response?.data;
      if (data?.email) setError(data.email[0]);
      else if (data?.error) setError(data.error);
      else setError("Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI KIRIM ULANG OTP ---
  const handleResendCode = async () => {
    setResendTimer(60);
    try {
      // 3. Gunakan instance api
      await api.post("/api/resend-otp/", {
        email: formData.email
      });
      alert("Kode OTP baru telah dikirim!");
    } catch (err) {
      alert("Gagal mengirim ulang kode. Coba lagi nanti.");
    }
  };

  // --- 2. PROSES VERIFIKASI OTP ---
  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) { setError("Masukkan kode 6 digit."); return; }
    
    setError("");
    setIsLoading(true);

    try {
      // 4. Gunakan instance api
      await api.post("/api/verify-otp/", {
        email: formData.email,
        otp: otpCode,
        password: formData.password
      });

      alert("Account created successfully! Please Login.");
      navigate("/login");

    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP Code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgreeFromModal = () => {
    setAgreeTerms(true); setShowTerms(false);
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#f5f5f7] px-4 pt-20">
      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
        
        {step === "register" && (
          <>
            <div className="mb-5">
              <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
              <p className="text-slate-500 mt-2 text-sm">Join us to find your perfect running shoes.</p>
            </div>

            <form className="flex flex-col gap-3" onSubmit={handleRegister}>
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-sm">Email Address</label>
                <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="runner@example.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50" required />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-sm">Password</label>
                <input type="password" id="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50" required />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-sm">Confirm Password</label>
                <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50" required />
              </div>

              <div className="flex items-center gap-2 mt-3">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreeTerms} 
                  onChange={(e) => setAgreeTerms(e.target.checked)} 
                  style={{ accentColor: '#0a0a5c' }}
                  className="w-4 h-4 border border-gray-400 rounded bg-white cursor-pointer" 
                />
                <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer select-none">
                  I agree to the <span onClick={() => setShowTerms(true)} className="text-blue-600 font-bold underline cursor-pointer hover:text-blue-800">Terms & Conditions</span>
                </label>
              </div>

              {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

              <button type="submit" disabled={isLoading} className="mt-2 w-full text-white font-bold py-3.5 rounded-lg bg-[#0a0a5c] hover:bg-blue-900 transition-all">
                {isLoading ? "Processing..." : "Sign Up"}
              </button>
            </form>

            <p className="text-center text-slate-600 mt-4 text-sm">Already have an account? <Link to="/login" className="text-blue-600 font-bold ml-1">Login</Link></p>
          </>
        )}

        {step === "verify" && (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verify Email</h2>
            <p className="text-slate-500 text-sm mb-6">Enter the code sent to <b>{formData.email}</b></p>
            
            <input 
                id="otpCode"
                type="text" 
                maxLength="6"
                value={otpCode}
                onChange={handleChange}
                placeholder="• • • • • •"
                className="w-full text-center text-2xl tracking-[10px] py-3 rounded-lg border border-slate-300 mb-4 bg-slate-50 focus:border-blue-600 outline-none"
            />
            
            {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

            <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full text-white font-bold py-3.5 rounded-lg bg-[#0a0a5c] hover:bg-blue-900 transition-all">
              {isLoading ? "Verifying..." : "Confirm Code"}
            </button>
            
            <div className="mt-6 text-center text-sm">
              {resendTimer > 0 ? (
                <p className="text-slate-500">
                  Didn't receive code? Resend in <span className="font-bold text-slate-800">{resendTimer}s</span>
                </p>
              ) : (
                <button 
                  onClick={handleResendCode} 
                  className="text-blue-600 font-bold hover:underline cursor-pointer bg-transparent border-none"
                >
                  Resend Code
                </button>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-500 text-center cursor-pointer hover:underline" onClick={() => setStep("register")}>
              Wrong email? Go Back
            </p>
          </>
        )}

      </div>
      
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} onAccept={handleAgreeFromModal} />}
    </div>
  );
}