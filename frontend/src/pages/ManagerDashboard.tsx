import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    Snackbar,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Assessment as AssessmentIcon,
    Warning as WarningIcon,
    Category as CategoryIcon,
    Recycling as RecyclingIcon,
    DeleteForever as DeleteForeverIcon,
    Build as BuildIcon,
    LocalShipping as TruckIcon,
    Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCenterStats, getCenterAlerts, getCenters, getAllContainerTypes, createContainerType, updateContainerType, deleteContainerType, getContainerCountByType, ContainerType } from '../services/containerService';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`manager-tabpanel-${index}`}
            aria-labelledby={`manager-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const ManagerDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [centers, setCenters] = useState<any[]>([]);

    // Get first center from user's centerIds or fallback to first available center
    const [centerId, setCenterId] = useState('');

    // Container Types Management State
    const [types, setTypes] = useState<any[]>([]);
    const [typesLoading, setTypesLoading] = useState(false);
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);
    const [deleteTypeDialogOpen, setDeleteTypeDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<any>(null);
    const [typeFormData, setTypeFormData] = useState({
        label: '',
        icon: 'RecyclingIcon',
        color: '#4CAF50',
    });
    const [typeSnackbar, setTypeSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });
    const [isTypeSubmitting, setIsTypeSubmitting] = useState(false);

    // Available icons and colors for container types
    const AVAILABLE_ICONS = [
        { value: 'RecyclingIcon', label: 'Recycling', component: RecyclingIcon },
        { value: 'DeleteForeverIcon', label: 'Trash', component: DeleteForeverIcon },
        { value: 'BuildIcon', label: 'Construction', component: BuildIcon },
        { value: 'TruckIcon', label: 'Truck', component: TruckIcon },
        { value: 'InventoryIcon', label: 'Inventory', component: InventoryIcon },
        { value: 'CategoryIcon', label: 'Category', component: CategoryIcon },
    ];

    const AVAILABLE_COLORS = [
        '#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0',
        '#607D8B', '#795548', '#009688', '#FFC107', '#E91E63',
    ];

    // Load available centers and determine which center to use
    useEffect(() => {
        const loadCenters = async () => {
            try {
                const centersData = await getCenters();
                setCenters(centersData);

                // Determine centerId: prefer user's assigned center, otherwise use first available
                let selectedCenterId = '';
                if (user?.centerIds && user.centerIds.length > 0) {
                    selectedCenterId = user.centerIds[0];
                } else if (centersData.length > 0) {
                    selectedCenterId = centersData[0]._id;
                }
                setCenterId(selectedCenterId);
                console.log('Selected center ID:', selectedCenterId);
                console.log('User centerIds:', user?.centerIds);
            } catch (error) {
                console.error('Failed to load centers:', error);
            }
        };

        if (user) {
            loadCenters();
        }
    }, [user]);

    // Load container types
    const loadTypes = async () => {
        try {
            setTypesLoading(true);
            const typesData = await getAllContainerTypes();

            // Load container count for each type
            const typesWithCount = await Promise.all(
                typesData.map(async (type: any) => {
                    try {
                        const count = await getContainerCountByType(type._id);
                        return { ...type, containerCount: count };
                    } catch (error) {
                        return { ...type, containerCount: 0 };
                    }
                })
            );

            setTypes(typesWithCount);
        } catch (error) {
            console.error('Failed to load container types:', error);
        } finally {
            setTypesLoading(false);
        }
    };

    // Container type dialog handlers
    const handleOpenTypeDialog = (type?: any) => {
        if (type) {
            setSelectedType(type);
            setTypeFormData({
                label: type.label,
                icon: type.icon || 'RecyclingIcon',
                color: type.color || '#4CAF50',
            });
        } else {
            setSelectedType(null);
            setTypeFormData({
                label: '',
                icon: 'RecyclingIcon',
                color: '#4CAF50',
            });
        }
        setTypeDialogOpen(true);
    };

    const handleCloseTypeDialog = () => {
        setTypeDialogOpen(false);
        setSelectedType(null);
        setTypeFormData({ label: '', icon: 'RecyclingIcon', color: '#4CAF50' });
    };

    const handleTypeSubmit = async () => {
        if (!typeFormData.label.trim()) {
            setTypeSnackbar({
                open: true,
                message: 'Le libellé est requis',
                severity: 'error',
            });
            return;
        }

        setIsTypeSubmitting(true);
        try {
            if (selectedType) {
                await updateContainerType(selectedType._id, typeFormData);
                setTypeSnackbar({
                    open: true,
                    message: 'Type modifié avec succès',
                    severity: 'success',
                });
            } else {
                await createContainerType(typeFormData);
                setTypeSnackbar({
                    open: true,
                    message: 'Type créé avec succès',
                    severity: 'success',
                });
            }
            handleCloseTypeDialog();
            loadTypes();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erreur lors de la sauvegarde';
            setTypeSnackbar({
                open: true,
                message,
                severity: 'error',
            });
        } finally {
            setIsTypeSubmitting(false);
        }
    };

    const handleOpenDeleteTypeDialog = (type: any) => {
        setSelectedType(type);
        setDeleteTypeDialogOpen(true);
    };

    const handleCloseDeleteTypeDialog = () => {
        setDeleteTypeDialogOpen(false);
        setSelectedType(null);
    };

    const handleConfirmDeleteType = async () => {
        if (!selectedType) return;

        setIsTypeSubmitting(true);
        try {
            await deleteContainerType(selectedType._id);
            setTypeSnackbar({
                open: true,
                message: 'Type supprimé avec succès',
                severity: 'success',
            });
            handleCloseDeleteTypeDialog();
            loadTypes();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erreur lors de la suppression';
            setTypeSnackbar({
                open: true,
                message,
                severity: 'error',
            });
        } finally {
            setIsTypeSubmitting(false);
        }
    };

    const getIconComponent = (iconName: string) => {
        const iconData = AVAILABLE_ICONS.find(icon => icon.value === iconName);
        if (iconData) {
            const IconComponent = iconData.component;
            return <IconComponent />;
        }
        return <CategoryIcon />;
    };

    const handleCloseTypeSnackbar = () => {
        setTypeSnackbar(prev => ({ ...prev, open: false }));
    };

    // Load types when tab 3 is accessed
    useEffect(() => {
        if (currentTab === 3) {
            loadTypes();
        }
    }, [currentTab]);

    // Check authorization
    useEffect(() => {
        if (user && user.role !== 'manager' && user.role !== 'superadmin') {
            navigate('/');
        }
    }, [user, navigate]);

    // Fetch statistics when Statistics tab is active
    useEffect(() => {
        if (currentTab === 0 && centerId) {
            fetchStats();
        }
    }, [currentTab, centerId]);

    // Fetch alerts when Alerts tab is active
    useEffect(() => {
        if (currentTab === 1 && centerId) {
            fetchAlerts();
        }
    }, [currentTab, centerId]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getCenterStats(centerId);
            setStats(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load statistics');
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getCenterAlerts(centerId, 6); // 6 hours threshold
            setAlerts(data.alerts || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load alerts');
            console.error('Error fetching alerts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    if (!user || (user.role !== 'manager' && user.role !== 'superadmin')) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    You do not have permission to access this page.
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
                Manager Dashboard
            </Typography>
            {centers.length > 0 && centerId && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Center: {centers.find(c => c._id === centerId)?.name || 'Unknown'}
                </Typography>
            )}
            {!centerId && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    No centers available or assigned to your account. Contact an administrator.
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleTabChange} aria-label="manager dashboard tabs">
                    <Tab label="Statistics" icon={<AssessmentIcon />} iconPosition="start" />
                    <Tab label="Alerts" icon={<WarningIcon />} iconPosition="start" />
                    <Tab label="Manage Containers" />
                    <Tab label="Manage Types" />
                </Tabs>
            </Box>

            {/* Tab 1: Statistics */}
            <TabPanel value={currentTab} index={0}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : !stats ? (
                    <Alert severity="info">No center assigned or no data available</Alert>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>
                                        Total Containers
                                    </Typography>
                                    <Typography variant="h3">
                                        {stats.totalContainers || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Empty: {stats.empty || 0} | Full: {stats.full || 0} | Maintenance: {stats.maintenance || 0}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>
                                        Fill Rate
                                    </Typography>
                                    <Typography variant="h3">
                                        {stats.fillRate ? stats.fillRate.toFixed(1) : 0}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Percentage of containers currently full
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>
                                        Containers Full
                                    </Typography>
                                    <Typography variant="h3" color="error">
                                        {stats.full || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Requiring collection
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        {stats.byType && stats.byType.length > 0 && (
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Containers by Type
                                        </Typography>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Type</TableCell>
                                                        <TableCell align="right">Total</TableCell>
                                                        <TableCell align="right">Empty</TableCell>
                                                        <TableCell align="right">Full</TableCell>
                                                        <TableCell align="right">Fill Rate</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {stats.byType.map((type: any) => (
                                                        <TableRow key={type.typeId}>
                                                            <TableCell>{type.typeName}</TableCell>
                                                            <TableCell align="right">{type.total}</TableCell>
                                                            <TableCell align="right">{type.empty}</TableCell>
                                                            <TableCell align="right">{type.full}</TableCell>
                                                            <TableCell align="right">{type.fillRate.toFixed(1)}%</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                )}
            </TabPanel>

            {/* Tab 2: Alerts */}
            <TabPanel value={currentTab} index={1}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : alerts.length === 0 ? (
                    <Alert severity="success">No alerts! All containers are in good condition.</Alert>
                ) : (
                    <>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {alerts.length} container{alerts.length > 1 ? 's' : ''} have been full for more than 6 hours
                        </Alert>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Container</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Hours Full</TableCell>
                                        <TableCell>Last Updated</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {alerts.map((alert: any) => (
                                        <TableRow
                                            key={alert.containerId}
                                            sx={{
                                                bgcolor: alert.hoursFull > 12 ? 'error.light' : 'warning.light',
                                                '&:hover': { bgcolor: alert.hoursFull > 12 ? 'error.main' : 'warning.main' }
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {alert.containerLabel}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={alert.typeLabel} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color={alert.hoursFull > 12 ? 'error' : 'warning'}>
                                                    {alert.hoursFull.toFixed(1)} hours
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(alert.lastUpdated).toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {alert.hoursFull > 12 ? (
                                                    <Chip label="URGENT" color="error" size="small" />
                                                ) : (
                                                    <Chip label="Attention Needed" color="warning" size="small" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </TabPanel>

            {/* Tab 3: Manage Containers */}
            <TabPanel value={currentTab} index={2}>
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<CategoryIcon />}
                        onClick={() => navigate('/manage-types')}
                        size="large"
                    >
                        Go to Container Types Management
                    </Button>
                </Box>
                <Alert severity="info">
                    Use the button above to access the dedicated Container Types Management page where you can create, edit, and delete container types.
                </Alert>
            </TabPanel>

            {/* Tab 4: Manage Types */}
            <TabPanel value={currentTab} index={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">
                        Types de Conteneurs
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenTypeDialog()}
                    >
                        Ajouter un Type
                    </Button>
                </Box>

                {typesLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Icône</TableCell>
                                    <TableCell>Libellé</TableCell>
                                    <TableCell>Couleur</TableCell>
                                    <TableCell align="right">Conteneurs</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {types.map((type) => (
                                    <TableRow key={type._id} hover>
                                        <TableCell>
                                            <Avatar
                                                sx={{
                                                    bgcolor: type.color || '#4CAF50',
                                                    width: 32,
                                                    height: 32,
                                                }}
                                            >
                                                {getIconComponent(type.icon || 'CategoryIcon')}
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1" fontWeight="medium">
                                                {type.label}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={type.color || '#4CAF50'}
                                                sx={{
                                                    backgroundColor: type.color || '#4CAF50',
                                                    color: 'white',
                                                    fontFamily: 'monospace',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                label={type.containerCount || 0}
                                                color={type.containerCount ? 'primary' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={() => handleOpenTypeDialog(type)}
                                                size="small"
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleOpenDeleteTypeDialog(type)}
                                                size="small"
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {types.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                Aucun type de conteneur trouvé
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </TabPanel>

            {/* Type Management Dialogs */}
            {/* Add/Edit Type Dialog */}
            <Dialog
                open={typeDialogOpen}
                onClose={handleCloseTypeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedType ? 'Modifier le Type' : 'Ajouter un Type'}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={3} mt={1}>
                        <TextField
                            label="Libellé"
                            value={typeFormData.label}
                            onChange={(e) => setTypeFormData(prev => ({ ...prev, label: e.target.value }))}
                            required
                            fullWidth
                            inputProps={{ maxLength: 50 }}
                            helperText={`${typeFormData.label.length}/50 caractères`}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Icône</InputLabel>
                            <Select
                                value={typeFormData.icon}
                                label="Icône"
                                onChange={(e) => setTypeFormData(prev => ({ ...prev, icon: e.target.value }))}
                            >
                                {AVAILABLE_ICONS.map((icon) => (
                                    <MenuItem key={icon.value} value={icon.value}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <icon.component />
                                            {icon.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Couleur
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {AVAILABLE_COLORS.map((color) => (
                                    <Avatar
                                        key={color}
                                        sx={{
                                            bgcolor: color,
                                            width: 32,
                                            height: 32,
                                            cursor: 'pointer',
                                            border: typeFormData.color === color ? '2px solid #000' : '2px solid transparent',
                                        }}
                                        onClick={() => setTypeFormData(prev => ({ ...prev, color }))}
                                    >
                                        {typeFormData.color === color && '✓'}
                                    </Avatar>
                                ))}
                            </Box>
                        </Box>

                        {/* Preview */}
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Aperçu
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: typeFormData.color }}>
                                    {getIconComponent(typeFormData.icon)}
                                </Avatar>
                                <Typography variant="body1">
                                    {typeFormData.label || 'Nom du type'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseTypeDialog}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleTypeSubmit}
                        variant="contained"
                        disabled={isTypeSubmitting || !typeFormData.label.trim()}
                    >
                        {isTypeSubmitting ? <CircularProgress size={20} /> : (selectedType ? 'Modifier' : 'Créer')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Type Confirmation Dialog */}
            <Dialog
                open={deleteTypeDialogOpen}
                onClose={handleCloseDeleteTypeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    {selectedType && (
                        <Box>
                            <Typography variant="body1" gutterBottom>
                                Êtes-vous sûr de vouloir supprimer le type "{selectedType.label}" ?
                            </Typography>
                            {selectedType.containerCount && selectedType.containerCount > 0 && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    <Typography variant="body2">
                                        <strong>{selectedType.containerCount}</strong> conteneur(s) utilisent ce type.
                                        Cette action ne sera possible que si aucun conteneur n'utilise ce type.
                                    </Typography>
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteTypeDialog}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirmDeleteType}
                        variant="contained"
                        color="error"
                        disabled={isTypeSubmitting}
                    >
                        {isTypeSubmitting ? <CircularProgress size={20} /> : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Type Snackbar */}
            <Snackbar
                open={typeSnackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseTypeSnackbar}
            >
                <Alert
                    onClose={handleCloseTypeSnackbar}
                    severity={typeSnackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {typeSnackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ManagerDashboard;
