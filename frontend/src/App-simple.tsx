import React from 'react';

function App() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('http://localhost:3000/health')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Backend connection failed:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Connecting to Goombas x Goated VIPs backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            Goombas x Goated VIPs v2.0
          </h1>
          <p className="text-gray-300">
            Advanced VIP Casino Platform with Domain-Driven Architecture
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Backend Status</h2>
            {data ? (
              <div className="space-y-2">
                <p className="text-green-400">✓ Connected</p>
                <p className="text-sm text-gray-300">Status: {data.status}</p>
                <p className="text-sm text-gray-300">Version: {data.version || '2.0.0'}</p>
                <p className="text-sm text-gray-300">Timestamp: {new Date(data.timestamp).toLocaleTimeString()}</p>
              </div>
            ) : (
              <p className="text-red-400">✗ Connection Failed</p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">API Endpoints</h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">• /api/auth - Authentication</p>
              <p className="text-gray-300">• /api/users - User Management</p>
              <p className="text-gray-300">• /api/leaderboard - Rankings</p>
              <p className="text-gray-300">• /health - Health Check</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Features</h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">• VIP Tier System</p>
              <p className="text-gray-300">• Wager Races</p>
              <p className="text-gray-300">• Real-time Leaderboards</p>
              <p className="text-gray-300">• Bonus Code System</p>
              <p className="text-gray-300">• Admin Dashboard</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Architecture</h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">• Domain-Driven Design</p>
              <p className="text-gray-300">• PostgreSQL Database</p>
              <p className="text-gray-300">• Redis Caching</p>
              <p className="text-gray-300">• JWT Authentication</p>
              <p className="text-gray-300">• TypeScript</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Quick Test</h2>
            <button
              onClick={() => window.open('http://localhost:3000/api', '_blank')}
              className="w-full bg-yellow-400 text-gray-900 font-semibold py-2 px-4 rounded hover:bg-yellow-500 transition-colors"
            >
              Test API
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Health Check</h2>
            <button
              onClick={() => window.open('http://localhost:3000/health', '_blank')}
              className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded hover:bg-green-700 transition-colors"
            >
              Check Health
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400">
          <p>Real backend running with domain-driven architecture</p>
          <p className="text-sm">Frontend: React + Vite | Backend: Node.js + Express + TypeScript</p>
        </div>
      </div>
    </div>
  );
}

export default App;