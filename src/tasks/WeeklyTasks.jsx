

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaTrashAlt, FaEdit, FaSave, FaEllipsisV } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const WeeklyTasks = () => {
  const user = useSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState({
    todo: [],
    inProcess: [],
    done: [],
  });
  const [newTask, setNewTask] = useState(''); 
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [showMenu, setShowMenu] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    (() => {
      const today = new Date();
      today.setDate(today.getDate() - today.getDay());
      return today;
    })()
  );
  const navigate = useNavigate();
  const location = useLocation();

  const goToPreviousWeek = () => {
    setCurrentWeekStart((prevWeek) => {
      const newDate = new Date(prevWeek);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };  

  const goToNextWeek = () => {
    setCurrentWeekStart((prevWeek) => {
      const newDate = new Date(prevWeek);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const formatWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentWeekStart);
    for (let i = 0; i < 5; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push({
        label: day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
        date: day,
      });
    }
    return days;
  };
  
  const goToSpecificDay = (day) => {
    setCurrentWeekStart(day);
  };

  useEffect(() => {
    const fetchTasks = async () => {
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
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            console.error('Unauthorized access, please log in again');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        const weekStart = currentWeekStart.toISOString().split('T')[0];
        const weekTasks = data.filter((task) => task.due_date === weekStart);
    
        setTasks({
          todo: weekTasks.filter((task) => task.status === 'pending'),
          inProcess: weekTasks.filter((task) => task.status === 'inProcess'),
          done: weekTasks.filter((task) => task.status === 'completed'),
        });
      } catch (error) {
        console.error('Error fetching tasks:', error.message);
      }
    };
    
  
    fetchTasks();
  }, [currentWeekStart, navigate]);


  const addTask = async () => {
    const token = localStorage.getItem('access_token');
    if (newTask.trim()) {
      try {
        const dueDate = currentWeekStart; 
        const formattedDueDate = dueDate.toISOString().split('T')[0]; 
  
        const response = await fetch('http://95.130.227.110:8000/api/todos/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({    
            title: newTask,
            status: "pending",
            due_date: formattedDueDate,  
            created_date: new Date().toISOString().split('T')[0],
            is_special_day: false,
          }),
        });
  
        if (!response.ok) throw new Error('Failed to add task');
        const createdTask = await response.json();
        setTasks((prevTasks) => ({
          ...prevTasks,
          todo: [...prevTasks.todo, createdTask],
        }));
        setNewTask('');
      } catch (error) {
        console.error('Error adding task:', error.message);
      }
    }
  };



  const onDragEnd = async (result) => {
    if (!result.destination) return;
  
    const { source, destination } = result;
  
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
  
    const sourceColumn = Array.from(tasks[source.droppableId]);
    const destColumn = Array.from(tasks[destination.droppableId]);
    const [movedTask] = sourceColumn.splice(source.index, 1);
  
    // Update the task's status in the backend when moved between columns
    try {
      const token = localStorage.getItem("access_token");
  
      let newStatus = destination.droppableId;
      if (destination.droppableId === "todo") {
        newStatus = "pending";
      } else if (destination.droppableId === "inProcess") {
        newStatus = "inProcess";
      } else if (destination.droppableId === "done") {
        newStatus = "completed";
      }
  
      const response = await fetch(
        `http://95.130.227.110:8000/api/todos/${movedTask.id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) throw new Error("Failed to update task status");
  
      movedTask.status = newStatus; // Update the task's status in the frontend
    } catch (error) {
      console.error("Error updating task status:", error.message);
    }
  
    // Update the columns in the frontend
    destColumn.splice(destination.index, 0, movedTask);
    setTasks((prevTasks) => ({
      ...prevTasks,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    }));
  };
  
  

  const startEditing = (task) => {
    setEditTaskId(task.id);
    setEditTaskTitle(task.title);
  };

  const saveTask = async (taskId, column) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://95.130.227.110:8000/api/todos/${taskId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTaskTitle }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      setTasks((prevTasks) => ({
        ...prevTasks,
        [column]: prevTasks[column].map((task) =>
          task.id === taskId ? { ...task, title: editTaskTitle } : task
        ),
      }));
      setEditTaskId(null);
      setEditTaskTitle('');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };


  const deleteTask = async (taskId, column) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://95.130.227.110:8000/api/todos/${taskId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to delete task');
      
      setTasks((prevTasks) => ({
        ...prevTasks,
        [column]: prevTasks[column].filter((task) => task.id !== taskId),
      }));
    } catch (error) {
      console.error('Error deleting task:', error.message);
    }
  };

  const moveTask = (taskId, fromColumn, toColumn) => {
    setTasks((prevTasks) => {
      const sourceTasks = Array.from(prevTasks[fromColumn]);
      const targetTasks = Array.from(prevTasks[toColumn]);
      const taskIndex = sourceTasks.findIndex((task) => task.id === taskId);
      const [movedTask] = sourceTasks.splice(taskIndex, 1);
      movedTask.status = toColumn;
      targetTasks.push(movedTask);

      return {
        ...prevTasks,
        [fromColumn]: sourceTasks,
        [toColumn]: targetTasks,
      };
    });
    setShowMenu(null);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-800 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl">📅 Weekly Tasks</h1>
        <div className="flex items-center">
          <button
            onClick={goToPreviousWeek}
            className="text-white px-2 py-1  rounded-l"
          >
            &lt;
          </button> 
          <div className="font-semibold text-lg mx-4 flex space-x-2">
  {formatWeekDays().map((day, index) => (
    <button key={index} onClick={() => goToSpecificDay(day.date)} 
    className={`text-blue-400 hover:text-black ${
      day.date.toDateString() === currentWeekStart.toDateString() ? 'bg-slate-200 text-black rounded-lg px-2' : ''
    }`}>
      {day.label}
    </button>
  ))}
</div>


          <button
            onClick={goToNextWeek}
            className="text-white px-2 py-1  rounded-r"
          >
            &gt;
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <p>{user?.username || 'User Name'}</p>
          <img
            src="https://w7.pngwing.com/pngs/831/88/png-transparent-user-profile-computer-icons-user-interface-mystique-miscellaneous-user-interface-design-smile-thumbnail.png"
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-1/4 bg-white p-4 border-r border-gray-300">
          <ul>
            {[{ name: "Today's challenges", path: '/today-challenges' }, { name: 'Weekly Tasks', path: '/weekly-tasks' }, { name: 'Monthly Tasks', path: '/monthly-tasks' }, { name: '+ Add Special Day', path: '/add-special-day' }].map((item) => (
              <li key={item.path} className='mb-2 bg-gray-100 hover:bg-gray-300 drop-shadow-md rounded-md text-2xl cursor-pointer  font-semibold hover:text-blue-500'>
                <a
                  href={item.path}
                  className={`text-sm ${location.pathname === item.path ? 'font-bold' : ''}`}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </aside>


        <main className="flex-1 p-4">
            <h2 className="text-xl font-semibold mb-4">Weekly Tasks</h2>
            <div className="mb-4 flex justify-between">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="border border-gray-400 px-4 bg-white py-2 rounded-lg w-3/4"
                placeholder="Add a new weekly task"
              />
              <button onClick={addTask} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                Add Task
              </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex justify-between">
                {['todo', 'inProcess', 'done'].map((column) => (
                  <div key={column} className="w-1/3 p-2">
                    <h3 className="text-lg font-semibold mb-2 capitalize">{column}</h3>
                    <Droppable droppableId={column}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          {tasks[column].map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                              {(provided) => (
                                <div
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  ref={provided.innerRef}
                                  className={`p-4 rounded-lg shadow-md mb-4 flex justify-between items-center ${
                                    column === 'done' ? 'bg-gray-800 text-white' : column === 'inProcess' ? 'bg-blue-100' : 'bg-white'
                                  }`}
                                >
                                  {editTaskId === task.id ? (
                                    <input
                                      value={editTaskTitle}
                                      onChange={(e) => setEditTaskTitle(e.target.value)}
                                      className="border border-gray-400 px-2 py-1 rounded w-3/4"
                                    />
                                  ) : (
                                    <span>{task.title}</span>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    {editTaskId === task.id ? (
                                      <button
                                        onClick={() => saveTask(task.id, column)}
                                        className="text-green-600"


                                        >
                                        <FaSave />
                                      </button>
                                    ) : (
                                      <button onClick={() => startEditing(task)} className="text-blue-600">
                                        <FaEdit />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setShowMenu(task.id === showMenu ? null : task.id)}
                                      className="text-gray-600"
                                    >
                                      <FaEllipsisV />
                                    </button>
                                    {showMenu === task.id && (
                                      <div className="absolute bg-white border rounded shadow-md mt-2">
                                        {['todo', 'inProcess', 'done'].map((targetColumn) =>
                                          targetColumn !== column ? (
                                            <button
                                              key={targetColumn}
                                              onClick={() => moveTask(task.id, column, targetColumn)}
                                              className="block px-4 py-2 text-blue-500 text-left w-full text-sm hover:bg-gray-100"
                                            >
                                              Move to {targetColumn}
                                            </button>
                                          ) : null  
                                        )}
                                      </div>
                                    )}
                                    <button
                                      onClick={() => deleteTask(task.id, column)}
                                      className="text-red-600"
                                    >
                                      <FaTrashAlt />  
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </main>
        </div>
      </div>
    );
  };

  export default WeeklyTasks;
