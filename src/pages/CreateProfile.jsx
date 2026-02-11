import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import InfoTooltip from '../components/InfoTooltip';

// --- IMPORT GAMBAR (Sesuaikan nama file lu) ---
import imgNarrow from '../assets/profile-images/foot-narrow.svg';
import imgRegular from '../assets/profile-images/foot-regular.svg';
import imgWide from '../assets/profile-images/foot-wide.svg';
import imgFlat from '../assets/profile-images/arch-flat.svg';
import imgNormal from '../assets/profile-images/arch-normal.svg';
import imgHigh from '../assets/profile-images/arch-high.svg';

const CreateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // STATE DATA (Sesuai Backend)
  const [formData, setFormData] = useState({
    weight_kg: '',
    foot_width: '',     // Narrow, Regular, Wide
    arch_type: '',      // Flat, Normal, High
    uses_orthotics: null, // true/false
    injury_history: []  // Array of strings
  });

  // 1. Handle Input Biasa (Weight)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Handle Pilihan Kartu Gambar (Foot & Arch)
  const handleSelect = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // 3. Handle Orthotics (Boolean)
  const handleOrthotics = (val) => {
    setFormData({ ...formData, uses_orthotics: val });
  };

  // 4. Handle Injury Checkbox (Multi-Select Logic) 🧠
  const handleInjuryToggle = (injuryLabel) => {
    setFormData((prev) => {
      const current = prev.injury_history;
      if (current.includes(injuryLabel)) {
        return { ...prev, injury_history: current.filter(item => item !== injuryLabel) }; // Remove
      } else {
        return { ...prev, injury_history: [...current, injuryLabel] }; // Add
      }
    });
  };

  // 5. Submit ke Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('userToken');
      // Pastikan weight dikirim sebagai Angka (Integer)
      const payload = {
        ...formData,
        weight_kg: parseInt(formData.weight_kg)
      };

      await axios.post('http://127.0.0.1:8000/api/profile/', payload, {
        headers: { Authorization: `Token ${token}` }
      });

      alert('Profile Created Successfully! 🚀');
      navigate('/'); // Redirect ke Home

    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // DATA OPSI (Biar kodingan rapi)
  const widthOptions = [
    { label: 'Narrow', img: imgNarrow },
    { label: 'Regular', img: imgRegular },
    { label: 'Wide', img: imgWide }
  ];

  const archOptions = [
    { label: 'Flat', img: imgFlat },
    { label: 'Normal', img: imgNormal },
    { label: 'High', img: imgHigh }
  ];

  const injuryOptions = [
    'Ankle Instability', 'Knee Pain', 'Plantar Fasciitis', 
    'Achilles Issue', 'Toe Injury'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Set Up Your Profile</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. WEIGHT (Tidak perlu Tooltip) */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Weight (kg)</label>
            <input
              type="number"
              name="weight_kg"
              value={formData.weight_kg}
              onChange={handleChange}
              // Perhatikan className panjang di bawah ini 👇
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="e.g. 70"
              required
            />
          </div>

          {/* 2. FOOT WIDTH (Image Cards) + TOOLTIP */}
          <div>
            {/* Ubah block jadi flex items-center biar icon i sejajar teks */}
            <label className="flex items-center text-gray-700 font-bold mb-2">
              Foot Width Type
              <InfoTooltip 
                title="What is foot width?" 
                text="Foot width refers to how wide your foot is at the front (toe area). It affects how comfortable a running shoe feels." 
              />
            </label>
            <div className="grid grid-cols-3 gap-4">
              {widthOptions.map((opt) => (
                <div
                  key={opt.label}
                  onClick={() => handleSelect('foot_width', opt.label)}
                  className={`
                    cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center transition-all
                    ${formData.foot_width === opt.label 
                      ? 'border-blue-600 bg-blue-50 scale-105 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300'}
                  `}
                >
                  <img src={opt.img} alt={opt.label} className="h-16 w-auto mb-2" />
                  <span className="text-sm font-semibold">{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. ARCH TYPE (Image Cards) + TOOLTIP */}
          <div>
            <label className="flex items-center text-gray-700 font-bold mb-2">
              Arch Type
              <InfoTooltip 
                title="What is arch type?" 
                text="Arch type describes the height of your foot arch when standing. It affects stability, comfort, and support in running shoes." 
              />
            </label>
            <div className="grid grid-cols-3 gap-4">
              {archOptions.map((opt) => (
                <div
                  key={opt.label}
                  onClick={() => handleSelect('arch_type', opt.label)}
                  className={`
                    cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center transition-all
                    ${formData.arch_type === opt.label 
                      ? 'border-blue-600 bg-blue-50 scale-105 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300'}
                  `}
                >
                  <img src={opt.img} alt={opt.label} className="h-16 w-auto mb-2" />
                  <span className="text-sm font-semibold">{opt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. ORTHOTICS (Simple Selection) + TOOLTIP */}
          {/* 4. ORTHOTICS (Card Style - Konsisten) */}
          <div>
            <label className="flex items-center text-gray-700 font-bold mb-2">
              Orthotics Usage
              <InfoTooltip 
                title="What are orthotics?" 
                text="Orthotics are custom or removable insoles used to improve comfort, support, or alignment inside shoes." 
              />
            </label>
            
            {/* Pakai Grid 2 Kolom biar rapi (Yes/No) */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* OPSI YES */}
              <div
                onClick={() => handleOrthotics(true)}
                className={`
                  cursor-pointer border-2 rounded-xl p-6 flex flex-col items-center justify-center transition-all
                  ${formData.uses_orthotics === true 
                    ? 'border-blue-600 bg-blue-50 scale-105 shadow-md text-blue-900' // Active State
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-sm text-gray-600'} // Hover Effect
                `}
              >
                <span className="text-md text-center">Yes, I use orthotics</span>
              </div>

              {/* OPSI NO */}
              <div
                onClick={() => handleOrthotics(false)}
                className={`
                  cursor-pointer border-2 rounded-xl p-6 flex flex-col items-center justify-center transition-all
                  ${formData.uses_orthotics === false 
                    ? 'border-blue-600 bg-blue-50 scale-105 shadow-md text-blue-900' // Active State
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-sm text-gray-600'} // Hover Effect
                `}
              >
                <span className="text-md text-center">No, I don't</span>
              </div>

            </div>
          </div>

          {/* 5. INJURY HISTORY (Multi Checkbox) + TOOLTIP */}
          <div>
            <label className="flex items-center text-gray-700 font-bold mb-2">
              Past Injuries (Select all that apply)
              <InfoTooltip 
                title="Why we ask this?" 
                text="This helps us recommend shoes that provide better comfort and support for your specific recovery needs." 
              />
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {injuryOptions.map((injury) => (
                <div
                  key={injury}
                  onClick={() => handleInjuryToggle(injury)}
                  className={`
                    cursor-pointer p-3 rounded-lg border flex items-center gap-3 transition-colors
                    ${formData.injury_history.includes(injury) ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}
                  `}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.injury_history.includes(injury) ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}>
                    {formData.injury_history.includes(injury) && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-gray-700 text-sm">{injury}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all shadow-lg cursor-pointer"
          >
            {loading ? 'Saving Profile...' : 'Save Profile'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateProfile;