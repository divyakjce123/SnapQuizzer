import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Grid,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { imageAPI } from '../services/api';

export default function ImageUpload({ onQuestionsExtracted }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    maxSize: 5242880, // 5MB
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processImages = async () => {
    if (files.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const processedQuestions = [];
      
      for (const fileObj of files) {
        const reader = new FileReader();
        
        await new Promise((resolve) => {
          reader.onloadend = async () => {
            const base64Data = reader.result.split(',')[1];
            
            try {
              const response = await imageAPI.processImage({
                image_data: base64Data,
                has_answer_key: false,
                subject: 'General',
              });
              
              if (response.data.processed_questions) {
                processedQuestions.push(...response.data.processed_questions);
              }
              
              resolve();
            } catch (error) {
              console.error('Error processing image:', error);
              resolve();
            }
          };
          
          reader.readAsDataURL(fileObj.file);
        });
      }
      
      if (processedQuestions.length > 0) {
        onQuestionsExtracted(processedQuestions);
      } else {
        setError('No questions could be extracted from the images');
      }
    } catch (error) {
      setError('Failed to process images. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setError('');
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Dropzone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop images here' : 'Drag & drop MCQ images here'}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          or click to browse
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Supports JPG, PNG, GIF, BMP (Max 5MB each)
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Uploaded Files Preview */}
      {files.length > 0 && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle1">
              {files.length} image{files.length !== 1 ? 's' : ''} uploaded
            </Typography>
            <Button size="small" onClick={clearAll} color="error">
              Clear All
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {files.map((file, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Paper
                  sx={{
                    p: 1,
                    position: 'relative',
                    '&:hover .delete-button': {
                      opacity: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                    )}
                  </Box>
                  <Typography variant="caption" noWrap sx={{ display: 'block', mt: 1 }}>
                    {file.name}
                  </Typography>
                  <IconButton
                    className="delete-button"
                    size="small"
                    onClick={() => removeFile(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'background.paper',
                      opacity: 0.7,
                      '&:hover': {
                        bgcolor: 'error.light',
                        color: 'white',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Process Button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={processImages}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Processing...' : 'Extract Questions'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}