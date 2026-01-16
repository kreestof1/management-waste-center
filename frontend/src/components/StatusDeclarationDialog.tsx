import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Container, declareContainerStatus } from '../services/containerService';

interface StatusDeclarationDialogProps {
  open: boolean;
  container: Container;
  newState: 'empty' | 'full';
  onClose: () => void;
  onSuccess: () => void;
}

const StatusDeclarationDialog: React.FC<StatusDeclarationDialogProps> = ({
  open,
  container,
  newState,
  onClose,
  onSuccess,
}) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      await declareContainerStatus(container._id, newState, comment || undefined);
      onSuccess();
      onClose();
      setComment('');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('You have already declared this container recently. Please wait.');
      } else if (err.response?.status === 422) {
        setError('This container is in maintenance mode.');
      } else {
        setError(err.response?.data?.message || 'Failed to declare status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setComment('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Declare Container Status</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to declare this container as <strong>{newState.toUpperCase()}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Container: <strong>{container.label}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Type: {container.typeId.label}
          </Typography>
          {container.locationHint && (
            <Typography variant="body2" color="text.secondary">
              Location: {container.locationHint}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Comment (optional)"
          placeholder="Add any additional information..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={loading}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={newState === 'full' ? 'error' : 'success'}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Declaring...' : `Declare ${newState}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusDeclarationDialog;
