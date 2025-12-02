import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import QuestionEditor from '../components/QuestionEditor';

const steps = ['Upload Images', 'Review Questions', 'Quiz Details'];

export default function QuizCreate() {
  const [activeStep, setActiveStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    difficulty: 'medium',
    time_limit: null,
    is_public: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // --- THIS IS THE FIXED FUNCTION ---
  const handleQuestionsExtracted = (response) => {
    console.log("Raw Response from Upload:", response);

    let finalQuestions = [];

    // 1. Check if response has 'detected_questions' (Backend format)
    if (response && response.detected_questions) {
      finalQuestions = response.detected_questions;
    } 
    // 2. Check if response.data has 'detected_questions' (Axios format)
    else if (response && response.data && response.data.detected_questions) {
      finalQuestions = response.data.detected_questions;
    }
    // 3. Check if response is already an array
    else if (Array.isArray(response)) {
      finalQuestions = response;
    }

    // Safety Check
    if (!finalQuestions || finalQuestions.length === 0) {
      setError("Text was extracted, but no questions were found. Please try a clearer image.");
      return;
    }

    // Map to frontend format
    const formattedQuestions = finalQuestions.map((q, index) => ({
      id: `extracted-${Date.now()}-${index}`,
      question_text: q.question_text || '',
      question_type: 'mcq',
      options: Array.isArray(q.options) ? q.options.map(opt => ({
        id: opt.id || '',
        text: opt.text || '',
        is_correct: opt.is_correct || false
      })) : [],
      correct_answer: q.predicted_answer || [],
      explanation: q.explanation || '',
      marks: 1,
      ai_generated: true,
    }));
    
    console.log("Formatted Questions:", formattedQuestions);
    setQuestions(prev => [...prev, ...formattedQuestions]);
    setActiveStep(1); // Move to next step
  };
  // ----------------------------------

  const handleNext = () => {
    if (activeStep === 1 && questions.length === 0) {
      setError('Please add at least one question');
      return;
    }
    if (activeStep === 2) {
      handleSubmit();
      return;
    }
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleQuizDataChange = (field, value) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!quizData.title.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const quizToSubmit = {
        ...quizData,
        questions: questions.map(q => ({
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          marks: q.marks,
        })),
      };

      await quizAPI.createQuiz(quizToSubmit);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const addManualQuestion = () => {
    const newQuestion = {
      id: `manual-${Date.now()}`,
      question_text: '',
      question_type: 'mcq',
      options: [
        { id: 'A', text: '', is_correct: false },
        { id: 'B', text: '', is_correct: false },
        { id: 'C', text: '', is_correct: false },
        { id: 'D', text: '', is_correct: false },
      ],
      correct_answer: [],
      explanation: '',
      marks: 1,
      ai_generated: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Create New Quiz
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Upload Images */}
          <Step>
            <StepLabel>Upload MCQ Images</StepLabel>
            <StepContent>
              <Typography variant="body1" paragraph>
                Upload images of multiple choice questions. Our AI will automatically extract and structure them.
              </Typography>
              
              <ImageUpload onQuestionsExtracted={handleQuestionsExtracted} />
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                      addManualQuestion();
                      setActiveStep(1);
                  }}
                >
                  Add Manual Question Instead
                </Button>
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button disabled>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={questions.length === 0}
                >
                  Next ({questions.length} questions)
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Review Questions */}
          <Step>
            <StepLabel>Review & Edit Questions</StepLabel>
            <StepContent>
              <Typography variant="body1" paragraph>
                Review the extracted questions. You can edit, delete, or add more questions.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    Questions ({questions.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addManualQuestion}
                  >
                    Add Question
                  </Button>
                </Box>
                
                {questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    index={index}
                    onUpdate={(updated) => updateQuestion(index, updated)}
                    onDelete={() => deleteQuestion(index)}
                  />
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Quiz Details */}
          <Step>
            <StepLabel>Quiz Details</StepLabel>
            <StepContent>
              <Typography variant="body1" paragraph>
                Enter the quiz details and settings.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Quiz Title"
                    value={quizData.title}
                    onChange={(e) => handleQuizDataChange('title', e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={quizData.description}
                    onChange={(e) => handleQuizDataChange('description', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={quizData.subject}
                    onChange={(e) => handleQuizDataChange('subject', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Topic"
                    value={quizData.topic}
                    onChange={(e) => handleQuizDataChange('topic', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={quizData.difficulty}
                      label="Difficulty"
                      onChange={(e) => handleQuizDataChange('difficulty', e.target.value)}
                    >
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time Limit (minutes)"
                    type="number"
                    value={quizData.time_limit || ''}
                    onChange={(e) => handleQuizDataChange('time_limit', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Quiz'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Quiz created successfully!"
      />
    </Container>
  );
}