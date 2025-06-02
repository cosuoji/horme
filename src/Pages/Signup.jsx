import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { toast } from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading } = useUserStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    const success = await signup(formData);
    if (success) {
      toast.success('Account created successfully!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#B6B09F] px-6 md:px-20 py-20 space-y-14 animate-fadeUp">

    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-[#EAE4D5] mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#B6B09F]/30 rounded-lg text-[#EAE4D5] focus:outline-none focus:border-[#EAE4D5]"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-[#EAE4D5] mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#B6B09F]/30 rounded-lg text-[#EAE4D5] focus:outline-none focus:border-[#EAE4D5]"
            required
            disabled={loading}
          />
        </div>
      </div>

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

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#EAE4D5] mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
    </div>
  );
};

export default Signup;