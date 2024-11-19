import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import '../styles/HeaderStyle.css'
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWelcome, setIsWelcome] = useState(false);

  const handleSignInClick = () => {
    navigate('/login');  
  };

  const hiddenPaths = ['/today-challenges', '/weekly-tasks', '/monthly-tasks', '/add-special-day'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWelcome(true);
    }, 3000); 
    return () => clearTimeout(timer); 
  }, []);

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <Link to="/" className="text-xl font-bold flex items-center">
        <span className="mr-2 text-red-600">🎯</span>
        <span className={`text-2xl font-semibold ${isWelcome ? 'fade-text' : 'animate-text'}`}>
          {isWelcome ? 'Hush kelibsiz !!!' : 'Daily Tasks'}
        </span>
      </Link>
      {!hiddenPaths.includes(location.pathname) && (
        <button
          onClick={handleSignInClick} 
          className="px-4 py-2 bg-black text-white rounded-md">
          Sign-in
        </button>
      )}
    </header>
  );
};

export default Header;
