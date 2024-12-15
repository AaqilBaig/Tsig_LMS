import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout; 