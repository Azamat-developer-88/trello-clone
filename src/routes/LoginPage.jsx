import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const [email, setEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpEmail, setOtpEmail] = useState('');  // Store the email where OTP is sent
  const [resetSuccess, setResetSuccess] = useState(false);  // Track if password reset was successful

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'email') {
      setEmail(value);
    } else if (name === 'otpCode') {
      setOtpCode(value);
    } else if (name === 'newPassword') {
      setNewPassword(value);
    }
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://95.130.227.110:8000/api/auth/login/', {
        username,
        password,
      });
      if (response.status === 200) {
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        console.log('Login Successful:', response.data);
        navigate('/today-challenges');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
    }
  };

  // Step 1: Request OTP via Email
  const handleForgotPassword = async () => {
    try {
      const response = await axios.post('http://95.130.227.110:8000/api/auth/password_reset/', {
        email: email,
      });

      if (response.status === 200) {
        console.log('OTP sent to email:', response.data);
        setOtpEmail(email);  // Store the email where OTP was sent
        setOtpSent(true); // Show OTP input field
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
    }
  };

  // Step 2: Confirm OTP and reset password
  const handleResetPassword = async () => {
    try {
      const response = await axios.post('http://95.130.227.110:8000/api/auth/password_reset/confirm/', {
        email: otpEmail,   // Include email where OTP was sent
        otp: otpCode,      // Include OTP code
        new_password: newPassword, // Include new password
      });
      
      if (response.status === 200) {
        console.log('Password reset successful:', response.data);
        alert('Your password has been reset successfully!');
        setResetSuccess(true);  // Mark reset as successful
        setOtpSent(false); // Hide OTP section
        navigate('/login'); // Redirect to login page after successful password reset
      } else {
        throw new Error('Password reset failed');
      }
    } catch (error) {
      setError(error.response?.data?.detail || error.message);
    }
  };

  const isFormValid = username && password;

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl text-center font-bold mb-2">Sign in</h2>
        <p className="text-gray-600 text-center mb-4">
          Nice to meet you! Enter your username and password to login.
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form className="drop-shadow-xl" onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">
            Username:
          </label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            className="border w-full bg-white p-2 rounded-md mb-4"
            value={username}
            onChange={handleChange}
            required
          />

          <label className="block mb-2 text-sm font-medium">
            Password:
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            className="border w-full p-2 bg-white rounded-md mb-4"
            value={password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className={`w-full py-2 rounded-md ${isFormValid ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
            disabled={!isFormValid}
          >
            Sign-in
          </button>
        </form>

        <div className="text-center flex flex-col mt-4">
          <button
            onClick={() => setShowForgotPassword(!showForgotPassword)}
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </button>
          <Link to="/signup" className="text-red-500 hover:underline ml-2"><u className='text-black'>Regestration➡️</u> Sign-up</Link>
        </div>

        {showForgotPassword && !otpSent && (
          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium">
              Enter your email to reset password
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="border w-full p-2 rounded-md mb-4"
              value={email}
              onChange={handleChange}
              required
            />
            <button
              onClick={handleForgotPassword}
              className="w-full py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
            >
              Send OTP to Email
            </button>
          </div>
        )}

        {otpSent && !resetSuccess && (
          <div className="mt-4">
            <label className="block mb-2 text-sm font-medium">
              Enter your email to confirm OTP
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="border w-full p-2 rounded-md mb-4"
              value={otpEmail}  // The email where OTP was sent
              onChange={handleChange}
              required
            />
            <label className="block mb-2 text-sm font-medium">
              Enter the OTP code
            </label>
            <input
              type="text"
              name="otpCode"
              placeholder="Enter your OTP code"
              className="border w-full p-2 rounded-md mb-4"
              value={otpCode}
              onChange={handleChange}
              required
            />
            <label className="block mb-2 text-sm font-medium">
              New Password:
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter your new password"
              className="border w-full p-2 rounded-md mb-4"
              value={newPassword}
              onChange={handleChange}
              required
            />
            <button
              onClick={handleResetPassword}
              className="w-full py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
            >
              Reset Password
            </button>
          </div>
        )}

        {resetSuccess && (
          <div className="mt-4 text-green-500 text-center">
            Your password has been successfully reset. Please log in with your new password.
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
