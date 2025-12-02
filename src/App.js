import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuizCreate from './pages/QuizCreate';
import QuizTake from './pages/QuizTake';
import QuizResults from './pages/QuizResults';
import Classes from './pages/Classes';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#10b981',
    },
    background: {
      default: '#f8fafc',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/create-quiz" element={<PrivateRoute><QuizCreate /></PrivateRoute>} />
        <Route path="/quiz/:id" element={<PrivateRoute><QuizTake /></PrivateRoute>} />
        <Route path="/results/:id" element={<PrivateRoute><QuizResults /></PrivateRoute>} />
        <Route path="/classes" element={<PrivateRoute><Classes /></PrivateRoute>} />
      </Routes>
    </>
  );
}

export default App;