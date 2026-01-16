import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Alert,
    Chip,
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent,
} from '@mui/lab';
import {
    ArrowBack as ArrowBackIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { getContainerById, getContainerHistory, Container, StatusEvent } from '../services/containerService';

const ContainerHistory: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [container, setContainer] = useState<Container | null>(null);
    const [history, setHistory] = useState<StatusEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            setLoading(true);
            setError('');

            try {
                const [containerData, historyData] = await Promise.all([
                    getContainerById(id),
                    getContainerHistory(id),
                ]);

                setContainer(containerData);
                setHistory(Array.isArray(historyData) ? historyData : []);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load container history');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const formatRelativeTime = (date: string) => {
        const now = new Date();
        const eventDate = new Date(date);
        const diffMs = now.getTime() - eventDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !container) {
        return (
            <Box>
                <Alert severity="error">{error || 'Container not found'}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/containers')} sx={{ mt: 2 }}>
                    Back to Containers
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/containers')} sx={{ mb: 2 }}>
                Back to Containers
            </Button>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {container.label}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    {container.typeId && typeof container.typeId === 'object' && (
                        <Chip label={container.typeId.label} color="primary" />
                    )}
                    {container.state && (
                        <Chip
                            label={container.state.toUpperCase()}
                            color={container.state === 'empty' ? 'success' : container.state === 'full' ? 'error' : 'default'}
                        />
                    )}
                    {container.locationHint && (
                        <Typography variant="body2" color="text.secondary">
                            📍 {container.locationHint}
                        </Typography>
                    )}
                </Box>
            </Paper>

            <Typography variant="h5" gutterBottom>
                Status History
            </Typography>

            {history.length === 0 ? (
                <Alert severity="info">No status history available</Alert>
            ) : (
                <Timeline position="alternate">
                    {history.map((event, index) => (
                        <TimelineItem key={event._id}>
                            <TimelineOppositeContent color="text.secondary">
                                <Typography variant="body2">{formatRelativeTime(event.createdAt)}</Typography>
                                <Typography variant="caption">{new Date(event.createdAt).toLocaleString()}</Typography>
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot color={event.newState === 'full' ? 'error' : 'success'}>
                                    {event.newState === 'full' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                </TimelineDot>
                                {index < history.length - 1 && <TimelineConnector />}
                            </TimelineSeparator>
                            <TimelineContent>
                                <Paper elevation={3} sx={{ p: 2 }}>
                                    <Typography variant="h6" component="span">
                                        Declared {event.newState.toUpperCase()}
                                    </Typography>
                                    {event.authorId && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2">
                                                By: {event.authorId.firstName} {event.authorId.lastName}
                                            </Typography>
                                            <Chip label={event.authorId.role} size="small" sx={{ mt: 0.5 }} />
                                        </Box>
                                    )}
                                    {event.comment && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            💬 {event.comment}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                        Source: {event.source} • Confidence: {(event.confidence * 100).toFixed(0)}%
                                    </Typography>
                                </Paper>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            )}
        </Box>
    );
};

export default ContainerHistory;
