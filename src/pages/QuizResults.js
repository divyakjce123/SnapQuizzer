import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  ExpandMore,
  TrendingUp,
  Replay,
  Home,
} from '@mui/icons-material';
import { quizAPI } from '../services/api';

export default function QuizResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch results from API
    // For now, show mock data
    const mockResult = {
      score: 85,
      total_marks: 100,
      percentage: 85,
      correct_answers: 17,
      total_questions: 20,
      detailed_results: Array.from({ length: 20 }, (_, i) => ({
        question_id: i + 1,
        question_text: `Sample question ${i + 1}`,
        selected_options: ['A'],
        correct_options: i < 17 ? ['A'] : ['B'],
        is_correct: i < 17,
        explanation: `Explanation for question ${i + 1}`,
      })),
    };
    
    setResult(mockResult);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading results...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Score Summary */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Quiz Completed!
        </Typography>
        
        <Grid container spacing={4} alignItems="center" sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h1" sx={{ fontWeight: 'bold' }}>
                {result.percentage}%
              </Typography>
              <Typography variant="h6">
                Overall Score
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Correct Answers</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {result.correct_answers}/{result.total_questions}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Score</Typography>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {result.score}/{result.total_marks}
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={result.percentage}
                sx={{ height: 10, borderRadius: 5, mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<Replay />}
          onClick={() => navigate('/dashboard')}
        >
          Take Another Quiz
        </Button>
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Detailed Results */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Question Review
        </Typography>
        
        {result.detailed_results.map((item, index) => (
          <Accordion key={item.question_id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ mr: 2 }}>
                  {item.is_correct ? (
                    <CheckCircle sx={{ color: 'success.main' }} />
                  ) : (
                    <Cancel sx={{ color: 'error.main' }} />
                  )}
                </Box>
                <Typography sx={{ flex: 1 }}>
                  Question {index + 1}
                </Typography>
                <Chip 
                  label={item.is_correct ? 'Correct' : 'Incorrect'} 
                  color={item.is_correct ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" gutterBottom>
                <strong>Question:</strong> {item.question_text}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Your Answer
                      </Typography>
                      <Typography color={item.is_correct ? 'success.main' : 'error.main'}>
                        {item.selected_options.join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Correct Answer
                      </Typography>
                      <Typography color="success.main">
                        {item.correct_options.join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {item.explanation && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Explanation
                  </Typography>
                  <Typography variant="body2">
                    {item.explanation}
                  </Typography>
                </Paper>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Performance Insights */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Performance Insights
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Accuracy Rate
                </Typography>
                <Typography variant="h3" color="primary">
                  {result.percentage}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Correct Answers
                </Typography>
                <Typography variant="h3" color="success.main">
                  {result.correct_answers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Cancel sx={{ fontSize: 40, color: 'error.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Incorrect Answers
                </Typography>
                <Typography variant="h3" color="error.main">
                  {result.total_questions - result.correct_answers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}