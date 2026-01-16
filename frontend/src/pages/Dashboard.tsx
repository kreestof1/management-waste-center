import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { Recycling, TrendingUp, LocalShipping } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();

    // Mock data for statistics cards (will be replaced with real API data later)
    const stats = {
        totalContainers: 42,
        monthlyEvolution: 12.5, // percentage
        collectionsToday: 8
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Welcome back, {user?.email}! You are logged in as{' '}
                <strong>{user?.role}</strong>.
            </Typography>

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
                                    color: 'success.main',
                                    mb: 2
                                }}
                            />
                            <Typography variant="h3" component="div" gutterBottom>
                                +{stats.monthlyEvolution}%
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Monthly Evolution
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
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

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
