import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MainStyle.css';

const MainContent = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const getShakingLetters = (text) => {
    return text.split('').map((char, index) => (
      <span key={index} className="slide-letter" style={{ animationDelay: `${index * 0.1}s` }}>
        {char}
      </span>
    ));
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-5xl font-bold mb-4">{getShakingLetters('Daily Tasks')}</h1>
      <p className="text-center text-xl max-w-lg text-gray-600 mb-8">
        After a stroke, it can take time to figure out how to do the tasks that make up daily life.
        Here are some tips. Find useful services and connect with others living with heart disease or stroke.
      </p>
      <button
        onClick={handleGetStarted} 
        className="px-6 py-3 bg-black text-white rounded-md">
        Get-started
      </button>
    </main>
  );
};

export default MainContent;
