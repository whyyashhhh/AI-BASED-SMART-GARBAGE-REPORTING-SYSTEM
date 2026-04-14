import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ComplaintForm } from './components/ComplaintForm';
import { AdminDashboard } from './components/AdminDashboard';

export function App() {
  const [portalTab, setPortalTab] = useState('report');

  return (
    <>
      <LandingPage />
      <section id="portal" className="portal-shell">
        <div className="portal-header">
          <p className="eyebrow">Connected workspace</p>
          <h2>Frontend and backend are live</h2>
          <p>Use this section to submit complaints to FastAPI and manage them from the admin queue.</p>
        </div>

        <div className="portal-tabs">
          <button
            type="button"
            className={portalTab === 'report' ? 'button button-primary' : 'button button-light'}
            onClick={() => setPortalTab('report')}
          >
            Report Complaint
          </button>
          <button
            type="button"
            className={portalTab === 'admin' ? 'button button-primary' : 'button button-light'}
            onClick={() => setPortalTab('admin')}
          >
            Admin Dashboard
          </button>
        </div>

        <div className="portal-content">
          {portalTab === 'report' ? <ComplaintForm /> : <AdminDashboard />}
        </div>
      </section>
    </>
  );
}
