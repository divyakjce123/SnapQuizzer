import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  ContentCopy as CopyIcon,
  Person as PersonIcon,
  Quiz as QuizIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { classAPI } from '../services/api';

export default function Classes() {
  const [classes, setClasses] = useState([
    {
      id: 1,
      name: 'Physics 101',
      description: 'Introduction to Physics',
      class_code: 'PHY101',
      student_count: 25,
      created_at: '2024-01-15',
    },
    {
      id: 2,
      name: 'Mathematics Advanced',
      description: 'Advanced Mathematics Course',
      class_code: 'MATH202',
      student_count: 18,
      created_at: '2024-01-10',
    },
  ]);
  
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateClass = async () => {
    if (!newClass.name.trim()) return;
    
    setLoading(true);
    try {
      // In real app, call API
      const mockClass = {
        id: classes.length + 1,
        ...newClass,
        class_code: `CLASS${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        student_count: 0,
        created_at: new Date().toISOString(),
      };
      
      setClasses([...classes, mockClass]);
      setNewClass({ name: '', description: '' });
      setOpenCreate(false);
    } catch (error) {
      console.error('Error creating class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async () => {
    if (!joinCode.trim()) return;
    
    setLoading(true);
    try {
      // In real app, call API
      alert(`Joining class with code: ${joinCode}`);
      setJoinCode('');
      setOpenJoin(false);
    } catch (error) {
      console.error('Error joining class:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Class code ${code} copied to clipboard!`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            My Classes
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your classes and join new ones
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenJoin(true)}
          >
            Join Class
          </Button>
          <Button
            variant="contained"
            startIcon={<GroupIcon />}
            onClick={() => setOpenCreate(true)}
          >
            Create Class
          </Button>
        </Box>
      </Box>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <GroupIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No classes yet
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Create your first class or join an existing one
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
            Create Class
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {classes.map((classItem) => (
            <Grid item xs={12} sm={6} md={4} key={classItem.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <GroupIcon sx={{ color: 'primary.main' }} />
                    <Chip 
                      label={`${classItem.student_count} students`} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    {classItem.name}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {classItem.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
                      Class Code:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mr: 1 }}>
                      {classItem.class_code}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => copyClassCode(classItem.class_code)}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button size="small">View Details</Button>
                  <Button size="small">Manage</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Recent Activity */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          <ListItem>
            <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
            <ListItemText 
              primary="John Doe joined Physics 101" 
              secondary="2 hours ago"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <QuizIcon sx={{ mr: 2, color: 'success.main' }} />
            <ListItemText 
              primary="New quiz assigned: Newton's Laws" 
              secondary="1 day ago"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <GroupIcon sx={{ mr: 2, color: 'warning.main' }} />
            <ListItemText 
              primary="Mathematics Advanced class created" 
              secondary="3 days ago"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Create Class Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            value={newClass.name}
            onChange={(e) => setNewClass({...newClass, name: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newClass.description}
            onChange={(e) => setNewClass({...newClass, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateClass} 
            variant="contained"
            disabled={loading || !newClass.name.trim()}
          >
            {loading ? 'Creating...' : 'Create Class'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Class Dialog */}
      <Dialog open={openJoin} onClose={() => setOpenJoin(false)}>
        <DialogTitle>Join Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Code"
            fullWidth
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter 6-digit class code"
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Ask your teacher for the class code to join
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoin(false)}>Cancel</Button>
          <Button 
            onClick={handleJoinClass} 
            variant="contained"
            disabled={loading || !joinCode.trim()}
          >
            {loading ? 'Joining...' : 'Join Class'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}