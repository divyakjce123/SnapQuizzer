import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function QuizTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (quiz?.time_limit) {
      const totalSeconds = quiz.time_limit * 60;
      setTimeLeft(totalSeconds);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getQuiz(id);
      setQuiz(response.data);
      
      // Initialize answers object
      const initialAnswers = {};
      response.data.questions.forEach((q, index) => {
        initialAnswers[index] = {
          question_id: q.id,
          selected_options: [],
          time_taken: 0,
        };
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOptionChange = (questionIndex, optionId, isMultiple) => {
    setAnswers(prev => {
      const current = { ...prev[questionIndex] };
      
      if (isMultiple) {
        if (current.selected_options.includes(optionId)) {
          current.selected_options = current.selected_options.filter(id => id !== optionId);
        } else {
          current.selected_options = [...current.selected_options, optionId];
        }
      } else {
        current.selected_options = [optionId];
      }
      
      return { ...prev, [questionIndex]: current };
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    
    try {
      const submission = {
        quiz_id: parseInt(id),
        responses: Object.values(answers),
        total_time: quiz.time_limit ? (quiz.time_limit * 60 - timeLeft) : 0,
      };
      
      const response = await quizAPI.submitQuiz(id, submission);
      navigate(`/results/${response.data.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading quiz...</Typography>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Quiz not found</Alert>
      </Container>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const isMultiple = currentQ.question_type === 'multiple_select';

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Quiz Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {quiz.title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </Typography>
          </Box>
          
          {timeLeft !== null && (
            <Paper sx={{ p: 2, bgcolor: timeLeft < 60 ? 'error.light' : 'primary.light', color: 'white' }}>
              <Typography variant="h6" align="center">
                {formatTime(timeLeft)}
              </Typography>
              <Typography variant="caption" display="block" align="center">
                Time Remaining
              </Typography>
            </Paper>
          )}
        </Box>
        
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Paper>

      {/* Question */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {currentQ.question_text}
        </Typography>
        
        {currentQ.image_url && (
          <Box sx={{ my: 2, textAlign: 'center' }}>
            <img
              src={currentQ.image_url}
              alt="Question"
              style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
            />
          </Box>
        )}

        <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
          <FormLabel component="legend">
            {isMultiple ? 'Select all that apply' : 'Select one option'}
          </FormLabel>
          
          {isMultiple ? (
            <Box>
              {currentQ.options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  control={
                    <Checkbox
                      checked={answers[currentQuestion]?.selected_options.includes(option.id)}
                      onChange={() => handleOptionChange(currentQuestion, option.id, true)}
                    />
                  }
                  label={`${option.id}. ${option.text}`}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))}
            </Box>
          ) : (
            <RadioGroup
              value={answers[currentQuestion]?.selected_options[0] || ''}
              onChange={(e) => handleOptionChange(currentQuestion, e.target.value, false)}
            >
              {currentQ.options.map((option) => (
                <FormControlLabel
                  key={option.id}
                  value={option.id}
                  control={<Radio />}
                  label={`${option.id}. ${option.text}`}
                  sx={{ display: 'block', mb: 1 }}
                />
              ))}
            </RadioGroup>
          )}
        </FormControl>
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outlined"
        >
          Previous
        </Button>
        
        <Box>
          {currentQuestion < quiz.questions.length - 1 ? (
            <Button onClick={handleNext} variant="contained">
              Next Question
            </Button>
          ) : (
            <Button
              onClick={() => setShowConfirm(true)}
              variant="contained"
              color="success"
            >
              Submit Quiz
            </Button>
          )}
        </Box>
      </Box>

      {/* Question Navigation */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Jump to Question:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {quiz.questions.map((_, index) => (
            <Button
              key={index}
              variant={index === currentQuestion ? "contained" : "outlined"}
              size="small"
              onClick={() => setCurrentQuestion(index)}
              sx={{ minWidth: 40 }}
            >
              {index + 1}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogTitle>Submit Quiz?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit the quiz? You have answered{' '}
            {Object.values(answers).filter(a => a.selected_options.length > 0).length}{' '}
            out of {quiz.questions.length} questions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}