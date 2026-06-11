import { Link } from 'react-router-dom';
import PageTransition from '../components/layout/PageTransition';

export default function UnauthorizedPage() {
  return (
    <PageTransition>
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          padding: '24px',
          fontFamily: 'inherit',
          textAlign: 'center',
        }}
      >
        <div 
          style={{
            maxWidth: '480px',
            backgroundColor: '#1E293B',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '48px 32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.05)',
          }}
        >
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #EF4444',
              borderRadius: '50%',
              color: '#EF4444',
              marginBottom: '24px',
              fontSize: '28px',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.2)',
            }}
          >
            🔒
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
            Access Restricted
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: '1.6', margin: '0 0 32px 0' }}>
            You do not have the required administrative permissions to access this command area. 
            If you believe this is an error, please contact the platform owner.
          </p>
          <div>
            <Link 
              to="/" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#3B82F6',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Return to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
