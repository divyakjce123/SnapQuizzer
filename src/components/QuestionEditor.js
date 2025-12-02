import React, { useState } from 'react';
import {
  Paper,
  Box,
  TextField,
  Typography,
  IconButton,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Grid,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';

export default function QuestionEditor({ question, index, onUpdate, onDelete }) {
  const [editedQuestion, setEditedQuestion] = useState(question);
  const isMultiple = editedQuestion.question_type === 'multiple_select';

  const handleQuestionTextChange = (text) => {
    const updated = { ...editedQuestion, question_text: text };
    setEditedQuestion(updated);
    onUpdate(updated);
  };

  const handleOptionChange = (optionIndex, field, value) => {
    const updatedOptions = [...editedQuestion.options];
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      [field]: value,
    };
    
    const updated = { ...editedQuestion, options: updatedOptions };
    setEditedQuestion(updated);
    onUpdate(updated);
  };

  const handleCorrectAnswerChange = (optionId) => {
    let updatedCorrectAnswer;
    
    if (isMultiple) {
      if (editedQuestion.correct_answer.includes(optionId)) {
        updatedCorrectAnswer = editedQuestion.correct_answer.filter(id => id !== optionId);
      } else {
        updatedCorrectAnswer = [...editedQuestion.correct_answer, optionId];
      }
    } else {
      updatedCorrectAnswer = [optionId];
    }
    
    const updated = { ...editedQuestion, correct_answer: updatedCorrectAnswer };
    setEditedQuestion(updated);
    onUpdate(updated);
  };

  const addOption = () => {
    const newOptionId = String.fromCharCode(65 + editedQuestion.options.length);
    const newOption = {
      id: newOptionId,
      text: '',
      is_correct: false,
    };
    
    const updated = {
      ...editedQuestion,
      options: [...editedQuestion.options, newOption],
    };
    setEditedQuestion(updated);
    onUpdate(updated);
  };

  const removeOption = (optionIndex) => {
    if (editedQuestion.options.length <= 2) return;
    
    const updatedOptions = editedQuestion.options.filter((_, idx) => idx !== optionIndex);
    const updated = { ...editedQuestion, options: updatedOptions };
    setEditedQuestion(updated);
    onUpdate(updated);
  };

  const handleTypeChange = (type) => {
    const updated = {
      ...editedQuestion,
      question_type: type,
      correct_answer: type === 'multiple_select' ? [] : [editedQuestion.correct_answer[0] || 'A'],
    };
    setEditedQuestion(updated);
    onUpdate(updated);
  };

  return (
    <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'grey.200' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DragIcon sx={{ mr: 1, color: 'grey.500', cursor: 'move' }} />
          <Typography variant="subtitle1">
            Question {index + 1}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onDelete} color="error">
          <DeleteIcon />
        </IconButton>
      </Box>

      {/* Question Text */}
      <TextField
        fullWidth
        multiline
        rows={2}
        label="Question Text"
        value={editedQuestion.question_text}
        onChange={(e) => handleQuestionTextChange(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Question Type Selector */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Question Type</InputLabel>
        <Select
          value={editedQuestion.question_type}
          label="Question Type"
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <MenuItem value="mcq">Single Select (MCQ)</MenuItem>
          <MenuItem value="multiple_select">Multiple Select</MenuItem>
          <MenuItem value="true_false">True/False</MenuItem>
        </Select>
      </FormControl>

      {/* Options */}
      <Typography variant="subtitle2" gutterBottom>
        Options {isMultiple ? '(Select all that apply)' : '(Select one)'}
      </Typography>

      {editedQuestion.options.map((option, optIndex) => (
        <Box
          key={option.id}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            mb: 2,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, minWidth: 100 }}>
            {isMultiple ? (
              <Checkbox
                checked={editedQuestion.correct_answer.includes(option.id)}
                onChange={() => handleCorrectAnswerChange(option.id)}
                sx={{ mr: 1 }}
              />
            ) : (
              <Radio
                checked={editedQuestion.correct_answer.includes(option.id)}
                onChange={() => handleCorrectAnswerChange(option.id)}
                sx={{ mr: 1 }}
              />
            )}
            <Typography sx={{ fontWeight: 'bold', minWidth: 20 }}>
              {option.id}.
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={option.text}
            onChange={(e) => handleOptionChange(optIndex, 'text', e.target.value)}
            placeholder={`Option ${option.id}`}
            size="small"
          />

          <IconButton
            size="small"
            onClick={() => removeOption(optIndex)}
            disabled={editedQuestion.options.length <= 2}
            sx={{ ml: 1 }}
          >
            <RemoveIcon />
          </IconButton>
        </Box>
      ))}

      {/* Add Option Button */}
      {editedQuestion.options.length < 6 && (
        <Button
          startIcon={<AddIcon />}
          onClick={addOption}
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
        >
          Add Option
        </Button>
      )}

      {/* Explanation */}
      <TextField
        fullWidth
        multiline
        rows={2}
        label="Explanation (Optional)"
        value={editedQuestion.explanation || ''}
        onChange={(e) => {
          const updated = { ...editedQuestion, explanation: e.target.value };
          setEditedQuestion(updated);
          onUpdate(updated);
        }}
        sx={{ mt: 3 }}
        placeholder="Add explanation for correct answer"
      />

      {/* Marks */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" sx={{ mr: 2 }}>
          Marks:
        </Typography>
        <TextField
          type="number"
          size="small"
          value={editedQuestion.marks}
          onChange={(e) => {
            const updated = { ...editedQuestion, marks: parseInt(e.target.value) || 1 };
            setEditedQuestion(updated);
            onUpdate(updated);
          }}
          sx={{ width: 80 }}
        />
      </Box>
    </Paper>
  );
}