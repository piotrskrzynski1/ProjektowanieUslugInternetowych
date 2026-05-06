import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./pages/Dashboard";
import { Spinner } from "./components/ui";

const AppInner: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner size={36} />
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <AuthPage />;
};

const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
