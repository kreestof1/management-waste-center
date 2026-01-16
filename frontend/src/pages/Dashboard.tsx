import { Box, Typography, Paper, Alert } from '@mui/material';
import { Recycling } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        Welcome back, {user?.firstName} {user?.lastName}! You are logged in as{' '}
        <strong>{user?.role}</strong>.
      </Alert>

      <Paper
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Recycling sx={{ fontSize: 64, color: 'primary.main' }} />
        <Typography variant="h5" gutterBottom>
          Container Fill-Level Tracking System
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Phase 3: Frontend implementation is in progress.
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Authentication is complete. Container list and other features coming soon!
        </Typography>
      </Paper>
    </Box>
  );
}
