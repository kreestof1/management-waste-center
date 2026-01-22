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
    Checkbox,
    TablePagination,
    Tooltip,
    LinearProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Build as MaintenanceIcon,
    Clear as ClearIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    getAllContainers,
    createContainer,
    updateContainer,
    deleteContainer,
    setContainerMaintenance,
    bulkSetMaintenance,
    bulkDeleteContainers,
    getCenters,
    getAllContainerTypes,
    Container,
    RecyclingCenter,
    ContainerType,
} from '../services/containerService';

interface ContainerWithMeta extends Container {
    selected?: boolean;
}

const ManageContainers: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Check if user has manager or superadmin role
    useEffect(() => {
        if (user && !['manager', 'superadmin'].includes(user.role)) {
            navigate('/');
        }
    }, [user, navigate]);

    // State
    const [containers, setContainers] = useState<ContainerWithMeta[]>([]);
    const [centers, setCenters] = useState<RecyclingCenter[]>([]);
    const [types, setTypes] = useState<ContainerType[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [selectedContainer, setSelectedContainer] = useState<ContainerWithMeta | null>(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        label: '',
        centerId: '',
        typeId: '',
        capacityLiters: '',
        locationHint: '',
        state: 'empty' as 'empty' | 'full',
    });

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        centerId: '',
        typeId: '',
        state: '',
    });

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [totalCount, setTotalCount] = useState(0);

    // Selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load initial data
    useEffect(() => {
        loadCenters();
        loadTypes();
    }, []);

    // Load containers when filters or pagination change
    useEffect(() => {
        loadContainers();
    }, [filters, page, rowsPerPage]);

    const loadContainers = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                page: page + 1,
                limit: rowsPerPage,
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (!params[key as keyof typeof params]) {
                    delete params[key as keyof typeof params];
                }
            });

            const data = await getAllContainers(params);
            const containersList = Array.isArray(data?.containers) ? data.containers : [];
            setContainers(containersList.map(container => ({ ...container, selected: false })));
            setTotalCount(data?.total || 0);
        } catch (error) {
            console.error('Failed to load containers:', error);
            setContainers([]);
            setTotalCount(0);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des conteneurs',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const loadCenters = async () => {
        try {
            const centersData = await getCenters();
            setCenters(Array.isArray(centersData) ? centersData : []);
        } catch (error) {
            console.error('Failed to load centers:', error);
            setCenters([]);
        }
    };

    const loadTypes = async () => {
        try {
            const typesData = await getAllContainerTypes();
            setTypes(Array.isArray(typesData) ? typesData : []);
        } catch (error) {
            console.error('Failed to load types:', error);
            setTypes([]);
        }
    };

    // Dialog handlers
    const handleOpenDialog = (container?: ContainerWithMeta) => {
        if (container) {
            setSelectedContainer(container);
            setFormData({
                label: container.label,
                centerId: typeof container.centerId === 'string' ? container.centerId : container.centerId._id,
                typeId: typeof container.typeId === 'string' ? container.typeId : container.typeId._id,
                capacityLiters: container.capacityLiters?.toString() || '',
                locationHint: container.locationHint || '',
                state: container.state === 'maintenance' ? 'empty' : container.state,
            });
        } else {
            setSelectedContainer(null);
            setFormData({
                label: '',
                centerId: user?.centerIds?.[0] || '',
                typeId: '',
                capacityLiters: '',
                locationHint: '',
                state: 'empty',
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedContainer(null);
        setFormData({
            label: '',
            centerId: '',
            typeId: '',
            capacityLiters: '',
            locationHint: '',
            state: 'empty',
        });
    };

    const handleSubmit = async () => {
        if (!formData.label.trim() || !formData.centerId || !formData.typeId) {
            setSnackbar({
                open: true,
                message: 'Libellé, centre et type sont requis',
                severity: 'error',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const data = {
                ...formData,
                capacityLiters: formData.capacityLiters ? parseInt(formData.capacityLiters) : undefined,
            };

            console.log('Submitting container data:', data);
            console.log('Selected container:', selectedContainer);

            if (selectedContainer) {
                const updatedContainer = await updateContainer(selectedContainer._id, data);
                console.log('Updated container response:', updatedContainer);
                setSnackbar({
                    open: true,
                    message: 'Conteneur modifié avec succès',
                    severity: 'success',
                });
            } else {
                const newContainer = await createContainer(data);
                console.log('Created container response:', newContainer);
                setSnackbar({
                    open: true,
                    message: 'Conteneur créé avec succès',
                    severity: 'success',
                });
            }
            handleCloseDialog();
            loadContainers();
        } catch (error: any) {
            console.error('Failed to save container:', error);
            const message = error.response?.data?.message || 'Erreur lors de la sauvegarde';
            setSnackbar({
                open: true,
                message,
                severity: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Maintenance handlers
    const handleOpenMaintenanceDialog = (container: ContainerWithMeta) => {
        setSelectedContainer(container);
        setMaintenanceMode(container.state === 'maintenance');
        setMaintenanceDialogOpen(true);
    };

    const handleConfirmMaintenance = async () => {
        if (!selectedContainer) return;

        setIsSubmitting(true);
        try {
            await setContainerMaintenance(selectedContainer._id, !maintenanceMode);
            setSnackbar({
                open: true,
                message: `Mode maintenance ${!maintenanceMode ? 'activé' : 'désactivé'}`,
                severity: 'success',
            });
            setMaintenanceDialogOpen(false);
            loadContainers();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erreur lors de la modification';
            setSnackbar({
                open: true,
                message,
                severity: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete handlers
    const handleOpenDeleteDialog = (container: ContainerWithMeta) => {
        setSelectedContainer(container);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedContainer) return;

        setIsSubmitting(true);
        try {
            await deleteContainer(selectedContainer._id);
            setSnackbar({
                open: true,
                message: 'Conteneur supprimé avec succès',
                severity: 'success',
            });
            setDeleteDialogOpen(false);
            loadContainers();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erreur lors de la suppression';
            setSnackbar({
                open: true,
                message,
                severity: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Selection handlers
    const handleSelectAll = () => {
        if (selectedIds.length === containers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(containers.map(c => c._id));
        }
    };

    const handleSelectContainer = (containerId: string) => {
        setSelectedIds(prev => {
            if (prev.includes(containerId)) {
                return prev.filter(id => id !== containerId);
            } else {
                return [...prev, containerId];
            }
        });
    };

    // Bulk operations
    const handleBulkMaintenance = async (maintenance: boolean) => {
        if (selectedIds.length === 0) return;

        setBulkProcessing(true);
        try {
            const result = await bulkSetMaintenance(selectedIds, maintenance);
            setSnackbar({
                open: true,
                message: `${result.success} conteneurs modifiés, ${result.failed} échecs`,
                severity: result.failed > 0 ? 'info' : 'success',
            });
            setSelectedIds([]);
            loadContainers();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erreur lors de l\'opération groupée';
            setSnackbar({
                open: true,
                message,
                severity: 'error',
            });
        } finally {
            setBulkProcessing(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        setBulkProcessing(true);
        try {
            const result = await bulkDeleteContainers(selectedIds);
            setSnackbar({
                open: true,
                message: `${result.success} conteneurs supprimés, ${result.failed} échecs`,
                severity: result.failed > 0 ? 'info' : 'success',
            });
            setSelectedIds([]);
            loadContainers();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Erreur lors de la suppression groupée';
            setSnackbar({
                open: true,
                message,
                severity: 'error',
            });
        } finally {
            setBulkProcessing(false);
        }
    };

    // Filter handlers
    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0); // Reset to first page when filtering
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            centerId: '',
            typeId: '',
            state: '',
        });
        setPage(0);
    };

    // Utility functions
    const getStateChip = (state: string) => {
        const configs = {
            empty: { label: 'Vide', color: 'success' as const },
            full: { label: 'Plein', color: 'warning' as const },
            maintenance: { label: 'Maintenance', color: 'info' as const },
        };
        const config = configs[state as keyof typeof configs] || { label: state, color: 'default' as const };
        return <Chip label={config.label} color={config.color} size="small" />;
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
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
            {/* Page Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Gestion des Conteneurs
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Ajouter Conteneur
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                        label="Recherche"
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        placeholder="Nom du conteneur..."
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        sx={{ minWidth: 200 }}
                    />

                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Centre</InputLabel>
                        <Select
                            value={filters.centerId}
                            label="Centre"
                            onChange={(e) => handleFilterChange('centerId', e.target.value)}
                        >
                            <MenuItem value="">Tous</MenuItem>
                            {centers.map((center) => (
                                <MenuItem key={center._id} value={center._id}>
                                    {center.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={filters.typeId}
                            label="Type"
                            onChange={(e) => handleFilterChange('typeId', e.target.value)}
                        >
                            <MenuItem value="">Tous</MenuItem>
                            {types.map((type) => (
                                <MenuItem key={type._id} value={type._id}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>État</InputLabel>
                        <Select
                            value={filters.state}
                            label="État"
                            onChange={(e) => handleFilterChange('state', e.target.value)}
                        >
                            <MenuItem value="">Tous</MenuItem>
                            <MenuItem value="empty">Vide</MenuItem>
                            <MenuItem value="full">Plein</MenuItem>
                            <MenuItem value="maintenance">Maintenance</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={handleClearFilters}
                    >
                        Effacer
                    </Button>
                </Box>
            </Paper>

            {/* Bulk Actions Toolbar */}
            {selectedIds.length > 0 && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body1" fontWeight="medium">
                            {selectedIds.length} conteneur(s) sélectionné(s)
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<MaintenanceIcon />}
                            onClick={() => handleBulkMaintenance(true)}
                            disabled={bulkProcessing}
                            sx={{ color: 'inherit', borderColor: 'currentColor' }}
                        >
                            Maintenance ON
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<MaintenanceIcon />}
                            onClick={() => handleBulkMaintenance(false)}
                            disabled={bulkProcessing}
                            sx={{ color: 'inherit', borderColor: 'currentColor' }}
                        >
                            Maintenance OFF
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={handleBulkDelete}
                            disabled={bulkProcessing}
                            sx={{ color: 'inherit', borderColor: 'currentColor' }}
                        >
                            Supprimer
                        </Button>
                        {bulkProcessing && <CircularProgress size={20} sx={{ color: 'inherit' }} />}
                    </Box>
                </Paper>
            )}

            {/* Containers Table */}
            <TableContainer component={Paper}>
                {bulkProcessing && <LinearProgress />}
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selectedIds.length > 0 && selectedIds.length < containers.length}
                                    checked={containers.length > 0 && selectedIds.length === containers.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell>Libellé</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Centre</TableCell>
                            <TableCell>État</TableCell>
                            <TableCell>Capacité</TableCell>
                            <TableCell>Localisation</TableCell>
                            <TableCell>Mise à jour</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {containers.map((container) => (
                            <TableRow key={container._id} hover selected={selectedIds.includes(container._id)}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedIds.includes(container._id)}
                                        onChange={() => handleSelectContainer(container._id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1" fontWeight="medium">
                                        {container.label}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                bgcolor: container.typeId.color || '#4CAF50',
                                                borderRadius: '50%',
                                            }}
                                        />
                                        {container.typeId.label}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {centers.find(c => c._id === container.centerId)?.name || 'N/A'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {getStateChip(container.state)}
                                </TableCell>
                                <TableCell>
                                    {container.capacityLiters ? `${container.capacityLiters}L` : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {container.locationHint || '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(container.updatedAt).toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Modifier">
                                        <IconButton
                                            onClick={() => handleOpenDialog(container)}
                                            size="small"
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={container.state === 'maintenance' ? 'Désactiver maintenance' : 'Activer maintenance'}>
                                        <IconButton
                                            onClick={() => handleOpenMaintenanceDialog(container)}
                                            size="small"
                                            color={container.state === 'maintenance' ? 'warning' : 'info'}
                                        >
                                            <MaintenanceIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Supprimer">
                                        <IconButton
                                            onClick={() => handleOpenDeleteDialog(container)}
                                            size="small"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {containers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Aucun conteneur trouvé
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
            />

            {/* Add/Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedContainer ? 'Modifier le Conteneur' : 'Ajouter un Conteneur'}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={3} mt={1}>
                        <TextField
                            label="Libellé"
                            value={formData.label || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                            required
                            fullWidth
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Centre</InputLabel>
                            <Select
                                value={formData.centerId}
                                label="Centre"
                                onChange={(e) => setFormData(prev => ({ ...prev, centerId: e.target.value }))}
                            >
                                {centers.map((center) => (
                                    <MenuItem key={center._id} value={center._id}>
                                        {center.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={formData.typeId}
                                label="Type"
                                onChange={(e) => setFormData(prev => ({ ...prev, typeId: e.target.value }))}
                            >
                                {types.map((type) => (
                                    <MenuItem key={type._id} value={type._id}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Box
                                                sx={{
                                                    width: 16,
                                                    height: 16,
                                                    bgcolor: type.color || '#4CAF50',
                                                    borderRadius: '50%',
                                                }}
                                            />
                                            {type.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Capacité (Litres)"
                            type="number"
                            value={formData.capacityLiters || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, capacityLiters: e.target.value }))}
                            fullWidth
                        />

                        <TextField
                            label="Indice de localisation"
                            value={formData.locationHint || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, locationHint: e.target.value }))}
                            fullWidth
                            inputProps={{ maxLength: 100 }}
                            helperText={`${(formData.locationHint || '').length}/100 caractères`}
                        />

                        {!selectedContainer && (
                            <FormControl fullWidth>
                                <InputLabel>État initial</InputLabel>
                                <Select
                                    value={formData.state}
                                    label="État initial"
                                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value as 'empty' | 'full' }))}
                                >
                                    <MenuItem value="empty">Vide</MenuItem>
                                    <MenuItem value="full">Plein</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isSubmitting || !formData.label.trim() || !formData.centerId || !formData.typeId}
                    >
                        {isSubmitting ? <CircularProgress size={20} /> : (selectedContainer ? 'Modifier' : 'Créer')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Maintenance Dialog */}
            <Dialog
                open={maintenanceDialogOpen}
                onClose={() => setMaintenanceDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {maintenanceMode ? 'Désactiver' : 'Activer'} le mode maintenance
                </DialogTitle>
                <DialogContent>
                    {selectedContainer && (
                        <Typography variant="body1">
                            Êtes-vous sûr de vouloir {maintenanceMode ? 'désactiver' : 'activer'} le mode maintenance
                            pour le conteneur "{selectedContainer.label}" ?
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMaintenanceDialogOpen(false)}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirmMaintenance}
                        variant="contained"
                        color={maintenanceMode ? 'primary' : 'warning'}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={20} /> : 'Confirmer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    {selectedContainer && (
                        <Box>
                            <Typography variant="body1" gutterBottom>
                                Êtes-vous sûr de vouloir supprimer le conteneur "{selectedContainer.label}" ?
                            </Typography>
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                Cette action supprimera également tout l'historique des statuts associé à ce conteneur.
                            </Alert>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={20} /> : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ManageContainers;