import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

const ProfileSelection = () => {
  const { employees, setActiveEmployee, activeEmployee, user } = useAppContext();
  const navigate = useNavigate();

  // If there's no Supabase user, they shouldn't even be here.
  // But ProtectedRoute handles that.

  const handleSelectProfile = (employee: typeof employees[0]) => {
    setActiveEmployee(employee);
    navigate('/');
  };

  const handleLogout = () => {
    // We let AppContext handle the logout via Supabase, but for now we just clear active employee
    setActiveEmployee(null);
    // Real logout handled in App.tsx typically, let's just use the router to go to login
    navigate('/connexion');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <h1 style={{ marginBottom: '3rem', fontSize: '2.5rem', color: 'var(--text-primary)' }}>
        Qui est là ?
      </h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        maxWidth: '800px'
      }}>
        {employees.map(emp => (
          <div 
            key={emp.id}
            onClick={() => handleSelectProfile(emp)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '1.5rem',
              borderRadius: '12px',
              transition: 'transform 0.2s, background-color 0.2s',
            }}
            className="profile-card"
          >
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}>
              <UserCircle size={80} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{emp.name}</h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{emp.role}</span>
          </div>
        ))}
      </div>

      <style>{`
        .profile-card:hover {
          transform: scale(1.05);
          background-color: #fff;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  );
};

export default ProfileSelection;
