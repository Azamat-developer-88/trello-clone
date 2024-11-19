import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignupPage from './routes/SignupPage';
import LoginPage from './routes/LoginPage';
import Header from './components/Header';
import MainContent from './components/MainContent';
import TodayChallenges from './components/TodayChallenges';
import WeeklyTasks from './tasks/WeeklyTasks';
import MonthlyTasks from './tasks/MonthlyTasks';
import AddSpecialDay from './tasks/AddSpecialDay'

function App() {
  return (
      <div className="App">
        <Header /> 
        <Routes>
          <Route path="/" element={<MainContent />} /> 
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/today-challenges" element={<TodayChallenges />} />
          <Route path="/weekly-tasks" element={<WeeklyTasks />} />
          <Route path="/monthly-tasks" element={<MonthlyTasks />} />
          <Route path="/add-special-day" element={<AddSpecialDay />} />
        </Routes>
      </div>
  );
}

export default App;








// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import SignupPage from './routes/SignupPage';
// import LoginPage from './routes/LoginPage';
// import Header from './components/Header';
// import MainContent from './components/MainContent';
// import TodayChallenges from './components/TodayChallenges';


// function App() {
//   return (
//     <div className="App">
//       <Header /> 
//       <Routes>
//         <Route path="/" element={<MainContent />} /> 
//         <Route path="/signup" element={<SignupPage />} />
//         <Route path="/login" element={<LoginPage />} /> 
//         <Route path="/today-challenges" element={<TodayChallenges />} />
//       </Routes>
//     </div>
//   );
// }

// export default App;