import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Snackbar,
    Chip,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TablePagination,
    Toolbar,
    Tooltip,
    Switch,
    FormControlLabel,
    Grid,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    Search as SearchIcon,
    LocationOn as LocationIcon,
    Public as PublicIcon,
    VisibilityOff as PrivateIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    getCenters,
    createCenter,
    updateCenter,
    deleteCenter,
    getAllContainers,
    RecyclingCenter,
} from '../services/containerService';

interface CenterWithStats extends RecyclingCenter {
    containerCount?: number;
}

const ManageCenters: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Check if user has superadmin role
    useEffect(() => {
        if (user && user.role !== 'superadmin') {
            navigate('/');
        }
    }, [user, navigate]);

    // State
    const [centers, setCenters] = useState<CenterWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<CenterWithStats | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        lat: '',
        lng: '',
        publicVisibility: true,
        active: true,
        openingHours: {
            monday: { open: '08:00', close: '18:00', closed: false },
            tuesday: { open: '08:00', close: '18:00', closed: false },
            wednesday: { open: '08:00', close: '18:00', closed: false },
            thursday: { open: '08:00', close: '18:00', closed: false },
            friday: { open: '08:00', close: '18:00', closed: false },
            saturday: { open: '08:00', close: '16:00', closed: false },
            sunday: { open: '', close: '', closed: true },
        },
    });

    // Filters and pagination
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        visibility: '',
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info',
    });

    // Form validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [centersData, containersData] = await Promise.all([
                getCenters(true), // Include inactive centers for management page
                getAllContainers(),
            ]);

            // Count containers per center
            const centerStats = centersData.map(center => {
                const containerCount = containersData.containers?.filter(
                    container => container.centerId === center._id
                ).length || 0;
                return { ...center, containerCount };
            });

            setCenters(centerStats);
        } catch (error) {
            showSnackbar('Erreur lors du chargement des centres', 'error');
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            address: '',
            lat: '',
            lng: '',
            publicVisibility: true,
            active: true,
            openingHours: {
                monday: { open: '08:00', close: '18:00', closed: false },
                tuesday: { open: '08:00', close: '18:00', closed: false },
                wednesday: { open: '08:00', close: '18:00', closed: false },
                thursday: { open: '08:00', close: '18:00', closed: false },
                friday: { open: '08:00', close: '18:00', closed: false },
                saturday: { open: '08:00', close: '16:00', closed: false },
                sunday: { open: '', close: '', closed: true },
            },
        });
        setErrors({});
        setIsEditing(false);
        setSelectedCenter(null);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Le nom est obligatoire';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'L\'adresse est obligatoire';
        }

        const lat = parseFloat(formData.lat);
        const lng = parseFloat(formData.lng);

        if (!formData.lat || isNaN(lat) || lat < -90 || lat > 90) {
            newErrors.lat = 'Latitude invalide (-90 à +90)';
        }

        if (!formData.lng || isNaN(lng) || lng < -180 || lng > 180) {
            newErrors.lng = 'Longitude invalide (-180 à +180)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAdd = () => {
        resetForm();
        setDialogOpen(true);
    };

    const handleEdit = (center: CenterWithStats) => {
        setSelectedCenter(center);
        setIsEditing(true);
        setFormData({
            name: center.name,
            address: center.address,
            lat: center.geo.lat.toString(),
            lng: center.geo.lng.toString(),
            publicVisibility: center.publicVisibility,
            active: center.active,
            openingHours: center.openingHours || {
                monday: { open: '08:00', close: '18:00', closed: false },
                tuesday: { open: '08:00', close: '18:00', closed: false },
                wednesday: { open: '08:00', close: '18:00', closed: false },
                thursday: { open: '08:00', close: '18:00', closed: false },
                friday: { open: '08:00', close: '18:00', closed: false },
                saturday: { open: '08:00', close: '16:00', closed: false },
                sunday: { open: '', close: '', closed: true },
            },
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            const centerData = {
                name: formData.name.trim(),
                address: formData.address.trim(),
                geo: {
                    lat: parseFloat(formData.lat),
                    lng: parseFloat(formData.lng),
                },
                publicVisibility: formData.publicVisibility,
                active: formData.active,
                openingHours: formData.openingHours,
            };

            if (isEditing && selectedCenter) {
                await updateCenter(selectedCenter._id, centerData);
                showSnackbar('Centre mis à jour avec succès', 'success');
            } else {
                await createCenter(centerData);
                showSnackbar('Centre créé avec succès', 'success');
            }

            setDialogOpen(false);
            loadData();
            resetForm();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erreur lors de la sauvegarde';
            showSnackbar(message, 'error');
        }
    };

    const handleDeleteClick = (center: CenterWithStats) => {
        setSelectedCenter(center);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedCenter) return;

        try {
            await deleteCenter(selectedCenter._id);
            showSnackbar('Centre supprimé avec succès', 'success');
            setDeleteDialogOpen(false);
            loadData();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erreur lors de la suppression';
            showSnackbar(message, 'error');
        }
    };

    const handleToggleActive = async (center: CenterWithStats) => {
        try {
            await updateCenter(center._id, { active: !center.active });
            showSnackbar(
                `Centre ${center.active ? 'désactivé' : 'activé'} avec succès`,
                'success'
            );
            loadData();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erreur lors de la mise à jour';
            showSnackbar(message, 'error');
        }
    };

    const filteredCenters = centers.filter(center => {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = center.name.toLowerCase().includes(searchLower) ||
            center.address.toLowerCase().includes(searchLower);

        const matchesStatus = !filters.status ||
            (filters.status === 'active' && center.active) ||
            (filters.status === 'inactive' && !center.active);

        const matchesVisibility = !filters.visibility ||
            (filters.visibility === 'public' && center.publicVisibility) ||
            (filters.visibility === 'private' && !center.publicVisibility);

        return matchesSearch && matchesStatus && matchesVisibility;
    });

    const paginatedCenters = filteredCenters.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleOpeningHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            openingHours: {
                ...prev.openingHours,
                [day]: {
                    ...prev.openingHours[day],
                    [field]: value,
                },
            },
        }));
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Gestion des Centres de Recyclage
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    sx={{ minWidth: 150 }}
                >
                    Ajouter Centre
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Filtres
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            label="Rechercher"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Statut</InputLabel>
                            <Select
                                value={filters.status}
                                label="Statut"
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <MenuItem value="">Tous</MenuItem>
                                <MenuItem value="active">Actif</MenuItem>
                                <MenuItem value="inactive">Inactif</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Visibilité</InputLabel>
                            <Select
                                value={filters.visibility}
                                label="Visibilité"
                                onChange={(e) => setFilters(prev => ({ ...prev, visibility: e.target.value }))}
                            >
                                <MenuItem value="">Tous</MenuItem>
                                <MenuItem value="public">Public</MenuItem>
                                <MenuItem value="private">Privé</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={() => setFilters({ search: '', status: '', visibility: '' })}
                            fullWidth
                        >
                            Effacer
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Centers Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nom</TableCell>
                            <TableCell>Adresse</TableCell>
                            <TableCell align="center">Statut</TableCell>
                            <TableCell align="center">Visibilité</TableCell>
                            <TableCell align="center">Coordonnées</TableCell>
                            <TableCell align="center">Conteneurs</TableCell>
                            <TableCell align="center">Créé le</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedCenters.length > 0 ? (
                            paginatedCenters.map((center) => (
                                <TableRow key={center._id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {center.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {center.address}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            icon={center.active ? <ActiveIcon /> : <InactiveIcon />}
                                            label={center.active ? 'Actif' : 'Inactif'}
                                            color={center.active ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            icon={center.publicVisibility ? <PublicIcon /> : <PrivateIcon />}
                                            label={center.publicVisibility ? 'Public' : 'Privé'}
                                            color={center.publicVisibility ? 'primary' : 'secondary'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={`${center.geo.lat}, ${center.geo.lng}`}>
                                            <IconButton size="small" color="primary">
                                                <LocationIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2">
                                            {center.containerCount || 0}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            {center.createdAt ? new Date(center.createdAt).toLocaleDateString('fr-FR') : '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Modifier">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(center)}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={center.active ? 'Désactiver' : 'Activer'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleActive(center)}
                                                color={center.active ? 'warning' : 'success'}
                                            >
                                                {center.active ? <InactiveIcon /> : <ActiveIcon />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Supprimer">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteClick(center)}
                                                color="error"
                                                disabled={!!(center.containerCount && center.containerCount > 0)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        {filteredCenters.length === 0 && centers.length === 0
                                            ? 'Aucun centre de recyclage trouvé'
                                            : 'Aucun centre ne correspond aux filtres sélectionnés'
                                        }
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        {filteredCenters.length === 0 && centers.length === 0
                                            ? 'Commencez par créer votre premier centre'
                                            : 'Modifiez vos filtres pour voir plus de résultats'
                                        }
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredCenters.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    labelRowsPerPage="Lignes par page"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                />
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {isEditing ? 'Modifier le Centre' : 'Ajouter un Centre'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nom du Centre"
                                fullWidth
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                    />
                                }
                                label="Centre actif"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Adresse Complète"
                                fullWidth
                                required
                                multiline
                                rows={2}
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                error={!!errors.address}
                                helperText={errors.address}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Latitude"
                                fullWidth
                                required
                                type="number"
                                value={formData.lat}
                                onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                                error={!!errors.lat}
                                helperText={errors.lat || 'Valeur entre -90 et +90'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Longitude"
                                fullWidth
                                required
                                type="number"
                                value={formData.lng}
                                onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                                error={!!errors.lng}
                                helperText={errors.lng || 'Valeur entre -180 et +180'}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.publicVisibility}
                                        onChange={(e) => setFormData(prev => ({ ...prev, publicVisibility: e.target.checked }))}
                                    />
                                }
                                label="Visible publiquement"
                            />
                        </Grid>

                        {/* Opening Hours */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Horaires d'Ouverture
                            </Typography>
                            {Object.entries(formData.openingHours).map(([day, hours]) => (
                                <Box key={day} sx={{ mb: 2 }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={3}>
                                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                                {day.charAt(0).toUpperCase() + day.slice(1)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={!hours.closed}
                                                        onChange={(e) => handleOpeningHoursChange(day, 'closed', !e.target.checked)}
                                                        size="small"
                                                    />
                                                }
                                                label="Ouvert"
                                            />
                                        </Grid>
                                        {!hours.closed && (
                                            <>
                                                <Grid item xs={3}>
                                                    <TextField
                                                        label="Ouverture"
                                                        type="time"
                                                        size="small"
                                                        fullWidth
                                                        value={hours.open}
                                                        onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                    />
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <TextField
                                                        label="Fermeture"
                                                        type="time"
                                                        size="small"
                                                        fullWidth
                                                        value={hours.close}
                                                        onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                    />
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                </Box>
                            ))}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleSave} variant="contained">
                        {isEditing ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmer la Suppression</DialogTitle>
                <DialogContent>
                    {selectedCenter && (
                        <Box>
                            <Typography gutterBottom>
                                Êtes-vous sûr de vouloir supprimer le centre "{selectedCenter.name}" ?
                            </Typography>
                            {selectedCenter.containerCount && selectedCenter.containerCount > 0 && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    Ce centre contient {selectedCenter.containerCount} conteneur(s).
                                    La suppression les affectera également.
                                </Alert>
                            )}
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Cette action ne peut pas être annulée.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ManageCenters;