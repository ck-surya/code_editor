// SubmissionPage.jsx
import React, { useEffect, useState } from 'react';


const SubmissionPage = () => {
  const [submissions, setSubmissions] = useState([]);

  // Helper to fetch status for a submission from DOMjudge (using judgements endpoint)
  async function fetchSubmissionStatus(subId) {
    try {
      const res = await fetch(`/api/v4/contests/1/judgements?submission_id=${subId}&strict=false`, {
        headers: {
          Authorization: 'Basic cmFuaTpyYW5pQGp1c3R1anUuaW4=',
          Accept: 'application/json',
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const judgement = data[0];
        console.log("Judgement data:", judgement);
        if (judgement.judgement_type_id) {
          console.log("✅ Judgement Found:", judgement);
          // Show verdict (e.g. AC, WA, etc.)
          return judgement.judgement_type_id;
        } else {
          const status = judgement.status_id || 'judging';
          console.log("⌛ Judgement not ready, status:", status);
          return status;
        }
      }
      return 'pending';
    } catch {
      return null;
    }
  }

  // Polling logic and manual refresh
  async function pollSubmissions() {
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem('submissions')) || [];
    } catch {}
    setSubmissions(stored);

    // Find pending submissions (status: 'pending' or 'judging')
    const pending = stored.filter(s => s.status === 'pending' || s.status === 'judging');
    if (pending.length === 0) {
      return;
    }

    // Fetch status for each pending submission
    const updates = await Promise.all(pending.map(async (sub) => {
      if (!sub.id) return sub;
      // Fetch the latest judgement object
      let verdict = sub.verdict;
      let status = await fetchSubmissionStatus(sub.id);
      const verdicts = ["AC", "WA", "TLE", "RTE", "MLE", "CE", "NO"];
      // If the status is a verdict, always update verdict and status
      if (verdicts.includes(status)) {
        return { ...sub, status: 'judged', verdict: status };
      }
      // If status is 'judged' but verdict is not set, keep last known verdict or show 'judged'
      if (status === 'judged') {
        return { ...sub, status: 'judged', verdict: verdict || sub.status };
      }
      // If status changed, update it
      if (status && status !== sub.status) {
        return { ...sub, status };
      }
      return sub;
    }));

    // Update localStorage and state if any status changed
    let changed = false;
    const newSubs = stored.map(sub => {
      const upd = updates.find(u => u.id === sub.id);
      if (upd && upd.status !== sub.status) changed = true;
      return upd || sub;
    });
    if (changed) {
      localStorage.setItem('submissions', JSON.stringify(newSubs));
      setSubmissions(newSubs);
    }
  }

  useEffect(() => {
    let intervalId;
    let isUnmounted = false;
    pollSubmissions();
    intervalId = setInterval(pollSubmissions, 3000);
    return () => {
      isUnmounted = true;
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>My Submissions</h2>
      <button
        style={{
          marginBottom: 18,
          padding: '7px 22px',
          background: 'linear-gradient(90deg, #4f8cff 0%, #2355d6 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(79,140,255,0.10)',
          letterSpacing: '0.01em',
          transition: 'background 0.2s, box-shadow 0.2s, transform 0.1s',
        }}
        onClick={pollSubmissions}
      >
        ⟳ Refresh
      </button>
      {submissions.length === 0 ? (
        <div>No submissions yet.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>ID</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Time</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Problem</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Language</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Status</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Code</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, idx) => (
              <tr key={sub.id || idx}>
                <td style={{ borderBottom: '1px solid #eee', fontFamily: 'monospace', color: '#2355d6' }}>{sub.id}</td>
                <td style={{ borderBottom: '1px solid #eee' }}>{new Date(sub.time).toLocaleString()}</td>
                <td style={{ borderBottom: '1px solid #eee' }}>{sub.problemId}</td>
                <td style={{ borderBottom: '1px solid #eee' }}>{sub.language}</td>
                <td style={{ borderBottom: '1px solid #eee' }}>
                  {sub.status === 'judged' && sub.verdict ? (
                    <span style={{ fontWeight: 700, color: sub.verdict === 'AC' ? '#28a745' : '#d9534f' }}>{sub.verdict}</span>
                  ) : (
                    sub.status
                  )}
                </td>
                <td style={{ borderBottom: '1px solid #eee', maxWidth: 200, overflow: 'auto' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{sub.code.slice(0, 200)}{sub.code.length > 200 ? '...' : ''}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SubmissionPage;
