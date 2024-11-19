import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOtpChange = (e) => {
    setEnteredOtp(e.target.value);
    console.log('Otp:', e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password === formData.confirmPassword) {
      try {
        const response = await axios.post('http://95.130.227.110:8000/api/auth/signup/', {
          email: formData.email,
          username: formData.username,
          password: formData.password,
        });

        console.log('Signup muvaffaqiyatli:', response.data);

        // OTP modalni ochish
        setIsOtpModalOpen(true);
      } catch (error) {
        console.error('Signup xatolik:', error.response || error.message);
        setError(error.response?.data?.message || error.message);
      }
    } else {
      alert('Parollar mos kelmadi!');
    }
  };

  const handleOtpSubmit = async () => {
    if (!enteredOtp || !formData.email) {
      setError('Iltimos, email va OTP kodni kiriting!');
      return;
    }

    // Ro'yxatdan o'tish paytidagi email bilan mosligini tekshirish
    if (formData.email !== formData.email) {
      setError('Kiritilgan email avval yuborilgan email bilan mos emas.');
      return;
    }

    const requestData = {
      email: formData.email,
      otp: enteredOtp,
    };

    try {
      const response = await fetch('http://95.130.227.110:8000/api/auth/register/confirm/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);

        // Serverdan kelgan xabarni ko'rsatish
        if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else {
          setError(errorData.detail || 'Произошла ошибка на сервере.');
        }
        return;
      }

      const responseData = await response.json();
      console.log('Response from server:', responseData);

      // Muvaffaqiyatli javobni qayta ishlash
      setIsOtpModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error message:', error.message);
      setError('Произошла ошибка при отправке запроса.');
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    navigate('/login');
  };

  const isFormValid = formData.email && formData.password && formData.password === formData.confirmPassword;

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">Ro'yxatdan o'tish</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form className="drop-shadow-xl" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white">Foydalanuvchi nomi:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Foydalanuvchi nomini kiriting"
              className="w-full px-4 py-2 border bg-white border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Emailni kiriting"
              className="w-full px-4 py-2 border bg-white border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white">Parol:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Parolni kiriting"
              className="w-full px-4 py-2 border bg-white border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-white">Parolni tasdiqlash:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Parolni qayta kiriting"
              className="w-full px-4 py-2 border bg-white border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-md font-semibold ${isFormValid ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
            disabled={!isFormValid}
          >
            Ro'yxatdan o'tish
          </button>
          <div className="text-center mt-4">
            <Link to="/login" className="text-blue-500 hover:underline">
              Allaqachon akkountingiz bormi?
            </Link>
          </div>
        </form>
      </div>

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-500 bg-opacity-50">
          <div className="bg-white p-6 mt-24 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">OTP Tasdiqlash</h3>
            <p>Emailga yuborilgan kodni va emailni kiriting:</p>

            {/* Editable Email Input */}
            <div className="mb-4">
              <label className="block text-white">Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border bg-white border-gray-300 rounded-md"
                placeholder="Emailni kiriting"
              />
            </div>

            {/* OTP Input */}
            <input
              type="text"
              value={enteredOtp}
              onChange={handleOtpChange}
              className="w-full px-4 py-2 border bg-white border-gray-300 rounded-md mt-4"
              placeholder="OTP kod"
            />
            <div className="mt-4 flex justify-end">
              <button onClick={handleOtpSubmit} className="bg-blue-500 text-white py-2 px-4 rounded-md">
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg text-green-500 font-semibold mb-4">
              <i className="fa fa-check-circle" aria-hidden="true"></i> Muvaffaqiyatli!
            </h3>
            <p>Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi!</p>
            <button onClick={handleSuccessClose} className="bg-blue-500 text-white py-2 px-4 rounded-md mt-4">
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupForm;
