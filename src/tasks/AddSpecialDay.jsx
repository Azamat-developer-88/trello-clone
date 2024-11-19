import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate ,Link} from 'react-router-dom';

const AddSpecialDay = () => {
  const user = useSelector((state) => state.auth.user);
  const [specialDayTasks, setSpecialDayTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpecialTasks = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token found, please log in');
        navigate('/login');
        return;
      }
      try {
        const response = await fetch('http://95.130.227.110:8000/api/todos/', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            console.error('Unauthorized access, please log in again');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch special day tasks');
        }
        const data = await response.json();
        
        // Filter tasks where is_special_day is true
        const specialTasks = data.filter((task) => task.is_special_day === true);
        
        setSpecialDayTasks(specialTasks);
      } catch (error) {
        console.error('Error fetching special day tasks:', error.message);
      }
    };
    fetchSpecialTasks();
  }, [navigate]);

  const handleAddTask = async () => {
    if (taskTitle.trim() && selectedYear && selectedMonth && selectedDay) {
      const token = localStorage.getItem('access_token');
      try {
        const response = await fetch('http://95.130.227.110:8000/api/todos/', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: taskTitle,
            created_date: new Date().toISOString().split('T')[0],
            status: 'pending', // Assuming the status is 'pending' initially
            due_date: `${selectedYear}-${selectedMonth}-${selectedDay}`,
            is_special_day: true, // Mark as special day task
          }),
        });
        if (!response.ok) throw new Error('Failed to add special day task');
        const createdTask = await response.json();
        setSpecialDayTasks((prevTasks) => [...prevTasks, createdTask]);
        setTaskTitle('');
        setSelectedYear('');
        setSelectedMonth('');
        setSelectedDay('');
      } catch (error) {
        console.error('Error adding special day task:', error.message);
      }
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-800 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl">🎉 Add Special Day Tasks</h1>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-4">
            <Link to="/today-challenges" className='mr-4 rounded-lg underline hover:text-red-500 hover:bg-white'>Today Challenges</Link>
            <Link to="/weekly-tasks" className='mr-4 rounded-lg underline hover:text-red-500 hover:bg-white'>Weekly Tasks</Link>
            <Link to="/monthly-tasks" className='mr-4 rounded-lg underline hover:text-red-500 hover:bg-white'>Monthly Tasks</Link>
          </div>
          <p>{user?.username || 'User Name'}</p>
          <img
            src="https://w7.pngwing.com/pngs/831/88/png-transparent-user-profile-computer-icons-user-interface-mystique-miscellaneous-user-interface-design-smile-thumbnail.png"
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Add a Task for a Special Day</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="border border-gray-400 bg-white px-4 py-2 rounded w-full"
              placeholder="Task Title"
            />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-400 bg-white px-4 py-2 rounded w-full"
            >
              <option value="">Select Year</option>
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-400 bg-white px-4 py-2 rounded w-full"
            >
              <option value="">Select Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="border border-gray-400 bg-white px-4 py-2 rounded w-full"
            >
              <option value="">Select Day</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {i + 1}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Add Task
            </button>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Special Day Tasks</h3>
          <ul className="space-y-4 text-center">
            {specialDayTasks.map((task) => (
              <li key={task.id} className="bg-white p-4 rounded shadow-md">
                <p className="font-bold text-xl">{task.title}</p>
                <p className="text-gray-500">
                  {`Scheduled for: ${task.due_date}`}
                </p>
                <p className="text-gray-500">
                  {`Status: ${task.status}`}
                </p>
                <p className="text-gray-500">
                  {`Created on: ${new Date(task.created_date).toLocaleDateString()}`}
                </p>
                <p className="text-gray-500">
                  {`Special Day: ${task.is_special_day ? 'Yes' : 'No'}`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default AddSpecialDay;
