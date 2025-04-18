import { useState, useEffect } from 'react';
import { useParams, Navigate, useOutletContext } from 'react-router-dom';
import TaskModal from '../components/TaskModal';

const Dashboard = () => {
  const { userId } = useParams();
  const { setIsSidebarOpen } = useOutletContext();
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get user data from localStorage
  useEffect(() => {
    
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Fetch tasks for the user
  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://tsiglms-production.up.railway.app/api/tasks/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      console.log("data : ", data);
      if (data.success) {
        console.log("data", data.success);
      }
      
      // Calculate stats
      const totalTasks = data.length;
      const pendingTasks = data.filter(task => task.status === null || task.status === false).length;
      const completedTasks = data.filter(task => task.status === true).length;
      
      setTasks(data);
      setStats({
        total: totalTasks,
        pending: pendingTasks,
        completed: completedTasks,
      });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserTasks();
    }
  }, [userId]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskSubmit = async (taskId, file) => {
    try {
      if (!userData || !userData._id) {
        throw new Error('User data not found');
      }
  
      // Create multipart FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userData._id);
      formData.append('taskId', taskId);
  
      // Debug: log each FormData pair
      for (let pair of formData.entries()) {
        console.log('FormData:', pair[0], pair[1]);
      }
  
      const response = await fetch('https://tsiglms-production.up.railway.app/api/tasks/submit', {
        method: 'POST',
        body: formData,
        // No "Content-Type" header; browser sets it for multipart/form-data
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error submitting task:', errorData);
        throw new Error(errorData.message || 'Failed to submit task');
      }
      const data = await response.json();
      await fetchUserTasks();
      console.log('Task submitted:', data);
      return data;
    } catch (error) {
      console.error('Error submitting task:', error);
      throw error;
    }
  };

  // Redirect if no userId
  if (!userId) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex sm:w-full sm:z-0">
      {/* <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} /> */}
      
      <div className="flex-1 p-4">
        {/* Hamburger Icon */}
        <button onClick={setIsSidebarOpen} className="md:hidden p-2 text-gray-600">
          ☰
        </button>

        <h2 className="mb-6 text-2xl font-bold">
          Welcome, {userData?.fullname || 'User'}
        </h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
            <p className="mt-2 text-3xl font-bold">{stats.pending}</p>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Completed Tasks</h3>
            <p className="mt-2 text-3xl font-bold">{stats.completed}</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-medium">Your Tasks</h3>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task._id}
                onClick={() => handleTaskClick(task)}
                className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>
                <span 
                  className={`rounded-full px-2 py-1 text-xs ${
                    task.status === true 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {task.status === true 
                    ? 'Completed' 
                    : task.status === false 
                    ? 'Incomplete' 
                    : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          task={selectedTask}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }}
          handleTaskSubmit={handleTaskSubmit}
          user={userData}
        />
      </div>
    </div>
  );
};

export default Dashboard;
