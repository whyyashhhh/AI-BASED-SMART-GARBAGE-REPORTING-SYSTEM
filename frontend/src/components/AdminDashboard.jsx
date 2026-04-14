import { useEffect, useState } from 'react';
import { adminLogin, fetchComplaints, resolveComplaint } from '../services/api';

const severityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function AdminDashboard() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortDescending, setSortDescending] = useState(false);

  useEffect(() => {
    if (token) {
      loadComplaints(token);
    }
  }, [token, sortDescending]);

  async function loadComplaints(activeToken) {
    try {
      setError('');
      const response = await fetchComplaints(activeToken);
      const items = response.complaints || [];
      const sorted = [...items].sort((left, right) => {
        const severityDelta = severityRank[left.severity] - severityRank[right.severity];
        return sortDescending ? -severityDelta : severityDelta;
      });
      setComplaints(sorted);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load complaints');
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await adminLogin(username, password);
      localStorage.setItem('adminToken', response.access_token);
      setToken(response.access_token);
    } catch (requestError) {
      setError(requestError.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (complaintId, resolved) => {
    if (!token) return;
    try {
      await resolveComplaint(token, complaintId, resolved);
      await loadComplaints(token);
    } catch (requestError) {
      setError(requestError.message || 'Unable to update complaint');
    }
  };

  if (!token) {
    return (
      <section className="panel admin-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Admin access</p>
            <h2>Sign in to manage complaints</h2>
          </div>
        </div>
        <form className="login-form" onSubmit={handleLogin}>
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Admin username" />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
          <button className="button primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>
        {error ? <div className="alert error">{error}</div> : null}
      </section>
    );
  }

  return (
    <section className="panel admin-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Operations dashboard</p>
          <h2>Complaint queue</h2>
        </div>
        <button className="button secondary" onClick={() => setSortDescending((value) => !value)} type="button">
          Sort {sortDescending ? 'ascending' : 'descending'}
        </button>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="complaint-list">
        {complaints.map((complaint) => (
          <article key={complaint.id} className={`complaint-card severity-${complaint.severity.toLowerCase()}`}>
            <div className="complaint-top">
              <strong>#{complaint.id}</strong>
              <span>{complaint.severity}</span>
              <span>{complaint.waste_type}</span>
              <span>{complaint.resolved ? 'Resolved' : 'Open'}</span>
            </div>
            <p>{complaint.complaint_text || 'No complaint text provided.'}</p>
            <div className="complaint-meta">
              <span>Urgency: {complaint.urgency}</span>
              <span>Keywords: {complaint.keywords.join(', ') || 'n/a'}</span>
              <span>
                Location: {complaint.latitude ?? 'n/a'}, {complaint.longitude ?? 'n/a'}
              </span>
            </div>
            <div className="complaint-actions">
              <button className="button secondary" type="button" onClick={() => handleResolve(complaint.id, !complaint.resolved)}>
                {complaint.resolved ? 'Mark open' : 'Mark resolved'}
              </button>
            </div>
          </article>
        ))}
        {!complaints.length ? <div className="empty-state">No complaints available yet.</div> : null}
      </div>
    </section>
  );
}
