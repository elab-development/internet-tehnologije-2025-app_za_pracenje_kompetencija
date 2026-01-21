import AdminDashboard from './dashboards/AdminDashboard.js';
import ModeratorDashboard from './dashboards/ModeratorDashboard.js';
import UserDashboard from './dashboards/UserDashboard.js';
import GuestDashboard from './dashboards/GuestDashboard.js';


const Dashboard = () => {
  const role = localStorage.getItem('role');
  console.log('ROLE IN DASHBOARD: ', role);

  if (role === 'admin') {
    console.log(AdminDashboard);

    return <AdminDashboard />;
  }
  if (role === 'moderator') return <ModeratorDashboard />;
  if (role === 'guest') return <GuestDashboard />;

  return <UserDashboard />;
};

export default Dashboard;
