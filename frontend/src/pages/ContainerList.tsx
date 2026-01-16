import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Snackbar,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    History as HistoryIcon,
} from '@mui/icons-material';
import {
    getContainersByCenter,
    getContainerTypes,
    getCenters,
    Container,
    ContainerType,
    RecyclingCenter,
} from '../services/containerService';
import { useSocket } from '../context/SocketContext';
import { joinCenter, leaveCenter, onContainerStatusUpdated, offContainerStatusUpdated } from '../services/socket';
import StatusDeclarationDialog from '../components/StatusDeclarationDialog';
import { useNavigate } from 'react-router-dom';

const ContainerList: React.FC = () => {
    const navigate = useNavigate();
    const { isConnected } = useSocket();
    const [centers, setCenters] = useState<RecyclingCenter[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<string>('');
    const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
    const [containers, setContainers] = useState<Container[]>([]);
    const [filteredContainers, setFilteredContainers] = useState<Container[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
    const [newState, setNewState] = useState<'empty' | 'full'>('empty');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Fetch centers on mount
    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const data = await getCenters();
                console.log('Centers API response:', data);
                console.log('Type of data:', typeof data);
                console.log('Is array:', Array.isArray(data));

                // Handle different response structures
                let centersArray: RecyclingCenter[] = [];

                if (Array.isArray(data)) {
                    centersArray = data;
                } else if (data && typeof data === 'object') {
                    // Check if data has a 'data' property containing the array
                    if (Array.isArray((data as any).data)) {
                        centersArray = (data as any).data;
                    } else if (Array.isArray((data as any).centers)) {
                        centersArray = (data as any).centers;
                    }
                }

                console.log('Centers array:', centersArray);
                setCenters(centersArray);
                if (centersArray.length > 0) {
                    setSelectedCenter(centersArray[0]._id);
                }
            } catch (err) {
                console.error('Failed to fetch centers:', err);
                setError('Failed to load recycling centers');
            }
        };

        fetchCenters();
    }, []);

    // Fetch container types on mount
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const data = await getContainerTypes();
                // Ensure data is an array
                setContainerTypes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch container types:', err);
            }
        };

        fetchTypes();
    }, []);

    // Fetch containers when center changes
    useEffect(() => {
        if (selectedCenter) {
            fetchContainers();
        }
    }, [selectedCenter]);

    // Join/leave WebSocket room when center changes
    useEffect(() => {
        if (selectedCenter && isConnected) {
            joinCenter(selectedCenter);

            return () => {
                leaveCenter(selectedCenter);
            };
        }
    }, [selectedCenter, isConnected]);

    // Listen for real-time updates
    useEffect(() => {
        onContainerStatusUpdated((data) => {
            if (data.centerId === selectedCenter) {
                setContainers((prev) =>
                    prev.map((container) =>
                        container._id === data.containerId
                            ? { ...container, state: data.newState, updatedAt: data.updatedAt }
                            : container
                    )
                );
            }
        });

        return () => {
            offContainerStatusUpdated();
        };
    }, [selectedCenter]);

    // Apply filters
    useEffect(() => {
        console.log('Applying filters to containers:', containers);
        console.log('Containers length:', containers.length);
        console.log('Status filter:', statusFilter);
        console.log('Type filter:', typeFilter);
        console.log('Search query:', searchQuery);

        let filtered = [...containers];

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((c) => c.state === statusFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter((c) => c.typeId._id === typeFilter);
        }

        // Search query
        if (searchQuery) {
            filtered = filtered.filter((c) =>
                c.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        console.log('Filtered containers:', filtered);
        console.log('Filtered length:', filtered.length);
        setFilteredContainers(filtered);
    }, [containers, statusFilter, typeFilter, searchQuery]);

    const fetchContainers = async () => {
        if (!selectedCenter) return;

        setLoading(true);
        setError('');
        try {
            const data = await getContainersByCenter(selectedCenter);
            console.log('Raw containers data:', data);

            // Handle response structure: {containers: [...], count: 7}
            let containersArray: Container[] = [];
            if (Array.isArray(data)) {
                containersArray = data;
            } else if (data && Array.isArray((data as any).containers)) {
                containersArray = (data as any).containers;
            }

            console.log('Setting containers:', containersArray);
            console.log('Containers array length:', containersArray.length);

            setContainers(containersArray);
            setFilteredContainers(containersArray);
        } catch (err: any) {
            console.error('Error fetching containers:', err);
            setError(err.message || 'Failed to load containers');
        } finally {
            setLoading(false);
        }
    };

    const handleDeclareClick = (container: Container, state: 'empty' | 'full') => {
        setSelectedContainer(container);
        setNewState(state);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedContainer(null);
    };

    const handleStatusDeclared = () => {
        fetchContainers();
        setSnackbarMessage(`Status successfully updated to ${newState.toUpperCase()}`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const getStateColor = (state: string) => {
        switch (state) {
            case 'empty':
                return 'success';
            case 'full':
                return 'error';
            case 'maintenance':
                return 'default';
            default:
                return 'default';
        }
    };

    const getStateLabel = (state: string) => {
        switch (state) {
            case 'empty':
                return 'VIDE';
            case 'full':
                return 'PLEIN';
            case 'maintenance':
                return 'MAINTENANCE';
            default:
                return state;
        }
    };

    const currentCenter = centers && centers.length > 0 ? centers.find((c) => c._id === selectedCenter) : null;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Containers</Typography>
                <Chip
                    label={isConnected ? 'Connected' : 'Disconnected'}
                    color={isConnected ? 'success' : 'default'}
                    size="small"
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Recycling Center"
                        value={selectedCenter}
                        onChange={(e) => setSelectedCenter(e.target.value)}
                        disabled={centers.length === 0}
                    >
                        {centers.length === 0 ? (
                            <MenuItem value="">No centers available</MenuItem>
                        ) : (
                            centers.map((center) => (
                                <MenuItem key={center._id} value={center._id}>
                                    {center.name}
                                </MenuItem>
                            ))
                        )}
                    </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="empty">Empty</MenuItem>
                        <MenuItem value="full">Full</MenuItem>
                        <MenuItem value="maintenance">Maintenance</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Type"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <MenuItem value="all">All Types</MenuItem>
                        {containerTypes.map((type) => (
                            <MenuItem key={type._id} value={type._id}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField
                        fullWidth
                        label="Search"
                        placeholder="Search by label"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Grid>
            </Grid>

            {/* Container Grid */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : filteredContainers.length === 0 ? (
                <Alert severity="info">No containers found</Alert>
            ) : (
                <Grid container spacing={2}>
                    {filteredContainers.map((container) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={container._id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                                        <Typography variant="h6" component="div">
                                            {container.label}
                                        </Typography>
                                        <Tooltip title="View History">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/containers/${container._id}/history`)}
                                            >
                                                <HistoryIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        {container.typeId.label}
                                    </Typography>
                                    <Chip
                                        label={getStateLabel(container.state)}
                                        color={getStateColor(container.state)}
                                        sx={{ mb: 1 }}
                                    />
                                    {container.locationHint && (
                                        <Typography variant="body2" color="text.secondary">
                                            📍 {container.locationHint}
                                        </Typography>
                                    )}
                                    {container.capacityLiters && (
                                        <Typography variant="body2" color="text.secondary">
                                            Capacity: {container.capacityLiters}L
                                        </Typography>
                                    )}
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                                        Updated: {new Date(container.updatedAt).toLocaleString()}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    {container.state === 'empty' && (
                                        <Button
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                            onClick={() => handleDeclareClick(container, 'full')}
                                        >
                                            Declare Full
                                        </Button>
                                    )}
                                    {container.state === 'full' && (
                                        <Button
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                            onClick={() => handleDeclareClick(container, 'empty')}
                                        >
                                            Declare Empty
                                        </Button>
                                    )}
                                    {container.state === 'maintenance' && (
                                        <Chip label="In Maintenance" size="small" disabled />
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Status Declaration Dialog */}
            {selectedContainer && (
                <StatusDeclarationDialog
                    open={dialogOpen}
                    container={selectedContainer}
                    newState={newState}
                    onClose={handleDialogClose}
                    onSuccess={handleStatusDeclared}
                />
            )}

            {/* Success/Error Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ContainerList;
