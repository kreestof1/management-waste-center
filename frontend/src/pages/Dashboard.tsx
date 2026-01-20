import { Box, Typography, Paper, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { Recycling, TrendingUp, LocalShipping } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getGlobalStats } from '../services/containerService';

interface GlobalStats {
    totalContainers: number;
    stateCounts: {
        empty: number;
        full: number;
        maintenance: number;
    };
    monthlyEvolution: number;
    collectionsToday: number;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await getGlobalStats();
                setStats(data);
            } catch (err) {
                console.error('Error fetching global stats:', err);
                setError('Failed to load dashboard statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Welcome back, {user?.email}! You are logged in as{' '}
                <strong>{user?.role}</strong>.
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            ) : !stats ? (
                <Alert severity="info" sx={{ mb: 3 }}>No statistics available</Alert>
            ) : (
                <Grid container spacing={3}>
                    {/* Total Containers Card */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={3}>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <Recycling
                                    sx={{
                                        fontSize: 48,
                                        color: 'primary.main',
                                        mb: 2
                                    }}
                                />
                                <Typography variant="h3" component="div" gutterBottom>
                                    {stats.totalContainers}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Total Containers
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Empty: {stats.stateCounts.empty} | Full: {stats.stateCounts.full} | Maintenance: {stats.stateCounts.maintenance}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Monthly Evolution Card */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={3}>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <TrendingUp
                                    sx={{
                                        fontSize: 48,
                                        color: stats.monthlyEvolution >= 0 ? 'success.main' : 'error.main',
                                        mb: 2
                                    }}
                                />
                                <Typography variant="h3" component="div" gutterBottom>
                                    {stats.monthlyEvolution >= 0 ? '+' : ''}{stats.monthlyEvolution}%
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Monthly Evolution
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Containers growth this month
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Collections Today Card */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Card elevation={3}>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <LocalShipping
                                    sx={{
                                        fontSize: 48,
                                        color: 'secondary.main',
                                        mb: 2
                                    }}
                                />
                                <Typography variant="h3" component="div" gutterBottom>
                                    {stats.collectionsToday}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Collections Today
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Containers emptied today
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <Paper
                sx={{
                    p: 3,
                    mt: 4,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Container Fill-Level Tracking System
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Monitor and manage container status across all recycling centers.
                </Typography>
            </Paper>
        </Box>
    );
}
