import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';

// Create a simple query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Simple Home component
function Home() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/race-config')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-xl">Loading Goombas x Goated VIPs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-yellow-500">
                Goombas x Goated VIPs
              </h1>
            </div>
            <nav className="flex space-x-8">
              <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Home
              </a>
              <a href="#leaderboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Leaderboard
              </a>
              <a href="#races" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Races
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-yellow-500 mb-4">
              Welcome to Goombas x Goated VIPs v2.0
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Your VIP casino experience starts here
            </p>
            
            {data && (
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-yellow-500 mb-4">Current Race</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p className="text-white font-semibold">{data.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Prize</p>
                    <p className="text-green-400 font-semibold">{data.prize}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <p className="text-green-400 font-semibold">
                      {data.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-500 mb-2">VIP Tiers</h3>
                <p className="text-gray-300">Track your progress through Bronze, Silver, Gold, and beyond</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-500 mb-2">Wager Races</h3>
                <p className="text-gray-300">Compete with other players for amazing prizes</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-500 mb-2">Bonus Codes</h3>
                <p className="text-gray-300">Exclusive codes for VIP members only</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple Not Found component
function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-500 mb-4">404</h1>
        <p className="text-xl text-gray-300">Page not found</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Switch>
            <Route path="/" component={Home} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    </QueryClientProvider>
  );
}