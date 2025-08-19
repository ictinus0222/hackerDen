import { HackathonNotificationProvider } from '../contexts/HackathonNotificationContext';
import HackathonDashboard from '../pages/HackathonDashboard';

const HackathonWrapper = () => {
  return (
    <HackathonNotificationProvider>
      <HackathonDashboard />
    </HackathonNotificationProvider>
  );
};

export default HackathonWrapper;