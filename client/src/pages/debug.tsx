import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

export default function Debug() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [localStorage_user, setLocalStorageUser] = useState<any>(null);
  const [apiTest, setApiTest] = useState<any>(null);

  useEffect(() => {
    // Check localStorage
    const stored = localStorage.getItem('geektunes-user');
    if (stored) {
      try {
        setLocalStorageUser(JSON.parse(stored));
      } catch (e) {
        setLocalStorageUser({ error: 'Failed to parse localStorage data' });
      }
    }

    // Test API endpoint
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setApiTest({ status: 'success', data }))
      .catch(err => setApiTest({ status: 'error', error: err.message }));
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">useAuth Hook State</h2>
            <div className="space-y-2 text-sm">
              <div>isLoading: {isLoading ? 'true' : 'false'}</div>
              <div>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</div>
              <div>user: {user ? JSON.stringify(user, null, 2) : 'null'}</div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">localStorage Data</h2>
            <div className="space-y-2 text-sm">
              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                {localStorage_user ? JSON.stringify(localStorage_user, null, 2) : 'No data in localStorage'}
              </pre>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">API Test (/api/user)</h2>
            <div className="space-y-2 text-sm">
              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                {apiTest ? JSON.stringify(apiTest, null, 2) : 'Loading...'}
              </pre>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
            <div className="space-y-2 text-sm">
              <div>URL: {window.location.href}</div>
              <div>Origin: {window.location.origin}</div>
              <div>User Agent: {navigator.userAgent}</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.href = '/auth'}
              className="bg-primary text-primary-foreground px-4 py-2 rounded"
            >
              Go to Auth
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded"
            >
              Go to Home
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('geektunes-user');
                window.location.reload();
              }}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded"
            >
              Clear localStorage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}