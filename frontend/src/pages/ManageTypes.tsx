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
    Avatar,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Recycling as RecyclingIcon,
    DeleteForever as DeleteForeverIcon,
    Build as BuildIcon,
    LocalShipping as TruckIcon,
    Inventory as InventoryIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    getAllContainerTypes,
    createContainerType,
    updateContainerType,
    deleteContainerType,
    getContainerCountByType,
    ContainerType,
} from '../services/containerService';

// Available icons for container types
const AVAILABLE_ICONS = [
    { value: 'RecyclingIcon', label: 'Recycling', component: RecyclingIcon },
    { value: 'DeleteForeverIcon', label: 'Trash', component: DeleteForeverIcon },
    { value: 'BuildIcon', label: 'Construction', component: BuildIcon },
    { value: 'TruckIcon', label: 'Truck', component: TruckIcon },
    { value: 'InventoryIcon', label: 'Inventory', component: InventoryIcon },
    { value: 'CategoryIcon', label: 'Category', component: CategoryIcon },
];

// Available colors for container types
const AVAILABLE_COLORS = [
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#2196F3', // Blue
    '#F44336', // Red
    '#9C27B0', // Purple
    '#607D8B', // Blue Grey
    '#795548', // Brown
    '#009688', // Teal
    '#FFC107', // Amber
    '#E91E63', // Pink
];

interface ContainerTypeWithCount extends ContainerType {
    containerCount?: number;
}

const ManageTypes: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Check if user has manager or superadmin role
    useEffect(() => {
        if (user && !['manager', 'superadmin'].includes(user.role)) {
            navigate('/');
        }
    }, [user, navigate]);

    // State
    const [types, setTypes] = useState<ContainerTypeWithCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<ContainerTypeWithCount | null>(null);
    const [formData, setFormData] = useState({
        label: '',
        icon: 'RecyclingIcon',
        color: '#4CAF50',
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load container types
    const loadTypes = async () => {
        try {
            setLoading(true);
            const typesData = await getAllContainerTypes();

            // Load container count for each type
            const typesWithCount = await Promise.all(
                typesData.map(async (type) => {
                    try {
                        const count = await getContainerCountByType(type._id);
                        return { ...type, containerCount: count };
                    } catch (error) {
                        console.warn(`Failed to load count for type ${type._id}:`, error);
                        return { ...type, containerCount: 0 };
                    }
                })
            );

            setTypes(typesWithCount);
        } catch (error) {
            console.error('Failed to load container types:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des types de conteneurs',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTypes();
    }, []);

    // Handle create/edit dialog
    const handleOpenDialog = (type?: ContainerTypeWithCount) => {
        if (type) {
            setSelectedType(type);
            setFormData({
                label: type.label,
                icon: type.icon || 'RecyclingIcon',
                color: type.color || '#4CAF50',
            });
        } else {
            setSelectedType(null);
            setFormData({
                label: '',
                icon: 'RecyclingIcon',
                color: '#4CAF50',
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedType(null);
        setFormData({ label: '', icon: 'RecyclingIcon', color: '#4CAF50' });
    };

    const handleSubmit = async () => {
        if (!formData.label.trim()) {
            setSnackbar({
                open: true,
                message: 'Le libellé est requis',
                severity: 'error',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            if (selectedType) {
                // Update existing type
                await updateContainerType(selectedType._id, formData);
                setSnackbar({
                    open: true,
                    message: 'Type modifié avec succès',
                    severity: 'success',
                });
            } else {
                // Create new type
                await createContainerType(formData);
                setSnackbar({
                    open: true,
                    message: 'Type créé avec succès',
                    severity: 'success',
                });
            }
            handleCloseDialog();
            loadTypes(); // Reload the list
        } catch (error: any) {
            console.error('Failed to save type:', error);
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

    // Handle delete
    const handleOpenDeleteDialog = (type: ContainerTypeWithCount) => {
        setSelectedType(type);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedType(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedType) return;

        setIsSubmitting(true);
        try {
            await deleteContainerType(selectedType._id);
            setSnackbar({
                open: true,
                message: 'Type supprimé avec succès',
                severity: 'success',
            });
            handleCloseDeleteDialog();
            loadTypes(); // Reload the list
        } catch (error: any) {
            console.error('Failed to delete type:', error);
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

    // Get icon component
    const getIconComponent = (iconName: string) => {
        const iconData = AVAILABLE_ICONS.find(icon => icon.value === iconName);
        if (iconData) {
            const IconComponent = iconData.component;
            return <IconComponent />;
        }
        return <CategoryIcon />;
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
                    Gestion des Types de Conteneurs
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Ajouter un Type
                </Button>
            </Box>

            {/* Types Table */}
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
                                        onClick={() => handleOpenDialog(type)}
                                        size="small"
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleOpenDeleteDialog(type)}
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

            {/* Add/Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
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
                            value={formData.label || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                            required
                            fullWidth
                            inputProps={{ maxLength: 50 }}
                            helperText={`${(formData.label || '').length}/50 caractères`}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Icône</InputLabel>
                            <Select
                                value={formData.icon}
                                label="Icône"
                                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
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
                                            border: formData.color === color ? '2px solid #000' : '2px solid transparent',
                                        }}
                                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                                    >
                                        {formData.color === color && '✓'}
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
                                <Avatar sx={{ bgcolor: formData.color }}>
                                    {getIconComponent(formData.icon)}
                                </Avatar>
                                <Typography variant="body1">
                                    {formData.label || 'Nom du type'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isSubmitting || !formData.label.trim()}
                    >
                        {isSubmitting ? <CircularProgress size={20} /> : (selectedType ? 'Modifier' : 'Créer')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
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
                    <Button onClick={handleCloseDeleteDialog}>
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

            {/* Snackbar for notifications */}
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

export default ManageTypes;