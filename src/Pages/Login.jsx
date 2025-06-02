import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const { login, loading } = useUserStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const from = location.state?.from?.pathname || '/'; // fallback to home

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#B6B09F] px-6 md:px-20 py-20 space-y-14 animate-fadeUp">

    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#EAE4D5] mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#B6B09F]/30 rounded-lg text-[#EAE4D5] focus:outline-none focus:border-[#EAE4D5]"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#EAE4D5] mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#B6B09F]/30 rounded-lg text-[#EAE4D5] focus:outline-none focus:border-[#EAE4D5]"
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full mt-6 px-4 py-2 ${loading ? 'bg-[#B6B09F]' : 'bg-[#EAE4D5]'} text-[#0a0a0a] font-medium rounded-lg transition-colors duration-200`}
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
    </div>
  );
};

export default Login;