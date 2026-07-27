import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';
import { RefreshCw, Server, ShieldCheck, AlertCircle } from 'lucide-react';

export default function HealthStatus() {
  const [statusState, setStatusState] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null,
    latency: null,
  });

  const checkHealth = useCallback(async () => {
    setStatusState((prev) => ({ ...prev, loading: true, error: null }));
    const startTime = performance.now();

    try {
      const response = await api.get('/health');
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      if (response.data && response.data.status === 'success') {
        setStatusState({
          loading: false,
          connected: true,
          data: response.data,
          error: null,
          latency: latencyMs,
        });
      } else {
        throw new Error('Unexpected health check response format.');
      }
    } catch (err) {
      console.error('Health check failed:', err);
      setStatusState({
        loading: false,
        connected: false,
        data: null,
        error: err.response?.data?.message || err.message || 'Unable to reach backend API server.',
        latency: null,
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const { loading, connected, data, error, latency } = statusState;

  return (
    <div className="status-card">
      <div className="status-header">
        <div className="status-title-group">
          <Server className="text-primary" size={24} />
          <h2>System Connectivity</h2>
        </div>

        <div
          className={`connection-indicator ${
            loading ? 'connecting' : connected ? 'connected' : 'error'
          }`}
        >
          <span className="pulse-dot" />
          <span>
            {loading ? 'Checking status...' : connected ? 'Backend Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {connected && data && (
        <div className="status-details-grid">
          <div className="detail-box">
            <div className="detail-label">Status Message</div>
            <div className="detail-value" style={{ color: '#34d399' }}>
              <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px' }} />
              {data.message}
            </div>
          </div>

          <div className="detail-box">
            <div className="detail-label">System Engine</div>
            <div className="detail-value">{data.system || 'AttendAI API'}</div>
          </div>

          <div className="detail-box">
            <div className="detail-label">Response Time</div>
            <div className="detail-value">{latency !== null ? `${latency} ms` : 'N/A'}</div>
          </div>

          <div className="detail-box">
            <div className="detail-label">Uptime</div>
            <div className="detail-value">
              {data.uptime ? `${Math.floor(data.uptime)}s` : 'Active'}
            </div>
          </div>
        </div>
      )}

      {!connected && !loading && (
        <div className="detail-box" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="detail-label" style={{ color: '#f87171' }}>Connection Error</div>
          <div className="detail-value" style={{ color: '#fca5a5' }}>
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
            {error}
          </div>
        </div>
      )}

      <div className="actions-row">
        <button
          className="btn-refresh"
          onClick={checkHealth}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Ping Endpoint'}
        </button>
      </div>
    </div>
  );
}
