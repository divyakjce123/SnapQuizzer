import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Quiz as QuizIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    avgScore: 0,
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getQuizzes();
      setQuizzes(response.data);
      
      // Calculate stats
      const totalQs = response.data.reduce((acc, quiz) => acc + quiz.questions.length, 0);
      setStats({
        totalQuizzes: response.data.length,
        totalQuestions: totalQs,
        avgScore: 75, // Mock data - replace with actual calculation
      });
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const handleCreateQuiz = () => {
    navigate('/create-quiz');
  };

  const handleTakeQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      // Add delete API call here
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.full_name || user?.username}!
        </Typography>
        <Typography variant="subtitle1">
          {user?.role === 'teacher' 
            ? 'Create engaging quizzes for your students' 
            : 'Practice makes perfect! Continue your learning journey'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mt: 2, bgcolor: 'white', color: '#6366f1', '&:hover': { bgcolor: '#f1f5f9' } }}
          onClick={handleCreateQuiz}
        >
          Create New Quiz
        </Button>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
            <QuizIcon sx={{ fontSize: 40, color: '#6366f1', mr: 2 }} />
            <Box>
              <Typography color="textSecondary" variant="body2">
                Total Quizzes
              </Typography>
              <Typography variant="h4">{stats.totalQuizzes}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: '#10b981', mr: 2 }} />
            <Box>
              <Typography color="textSecondary" variant="body2">
                Average Score
              </Typography>
              <Typography variant="h4">{stats.avgScore}%</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ fontSize: 40, color: '#f59e0b', mr: 2 }} />
            <Box>
              <Typography color="textSecondary" variant="body2">
                Total Questions
              </Typography>
              <Typography variant="h4">{stats.totalQuestions}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Quizzes */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Your Recent Quizzes
      </Typography>
      
      {quizzes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No quizzes yet
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Get started by creating your first quiz!
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateQuiz}>
            Create Quiz
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {quizzes.slice(0, 6).map((quiz) => (
            <Grid item xs={12} sm={6} md={4} key={quiz.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                      label={quiz.difficulty || 'Medium'} 
                      size="small" 
                      color={
                        quiz.difficulty === 'easy' ? 'success' :
                        quiz.difficulty === 'hard' ? 'error' : 'warning'
                      }
                    />
                    <Chip label={`${quiz.questions.length} Qs`} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {quiz.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {quiz.description || 'No description'}
                  </Typography>
                  {quiz.subject && (
                    <Chip label={quiz.subject} size="small" sx={{ mr: 1 }} />
                  )}
                  {quiz.topic && (
                    <Chip label={quiz.topic} size="small" variant="outlined" />
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleTakeQuiz(quiz.id)}>
                    Take Quiz
                  </Button>
                  <IconButton size="small" onClick={() => handleDeleteQuiz(quiz.id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton size="small">
                    <ShareIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Progress Section */}
      {user?.role === 'student' && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Learning Progress
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Mathematics
            </Typography>
            <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Physics
            </Typography>
            <LinearProgress variant="determinate" value={65} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Chemistry
            </Typography>
            <LinearProgress variant="determinate" value={78} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
        </Paper>
      )}
    </Container>
  );
}