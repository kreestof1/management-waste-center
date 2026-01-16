import { ReactNode } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Chip,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Recycling,
    AccountCircle,
    FiberManualRecord,
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Inventory as ContainersIcon,
    SupervisorAccount as ManagerIcon,
    Category as TypesIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';


interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { user, isAuthenticated, logout } = useAuth();
    const { isConnected } = useSocket();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate('/login');
    };

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuOpen(false);
    };

    const handleNavigateAndClose = (path: string) => {
        navigate(path);
        handleMobileMenuClose();
    };

    // Navigation items configuration
    const navigationItems = [
        {
            label: 'Dashboard',
            path: '/',
            icon: <DashboardIcon />,
            show: true,
        },
        {
            label: 'Containers',
            path: '/containers',
            icon: <ContainersIcon />,
            show: true,
        },
        {
            label: 'Manager',
            path: '/manager',
            icon: <ManagerIcon />,
            show: user?.role === 'manager' || user?.role === 'superadmin',
        },
        {
            label: 'Manage Types',
            path: '/manage-types',
            icon: <TypesIcon />,
            show: user?.role === 'manager' || user?.role === 'superadmin',
        },
        {
            label: 'Manage Containers',
            path: '/manage-containers',
            icon: <ContainersIcon />,
            show: user?.role === 'manager' || user?.role === 'superadmin',
        },
    ];

    const visibleItems = navigationItems.filter(item => item.show);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Recycling sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Container Tracking System
                    </Typography>

                    {isAuthenticated && (
                        <>
                            {/* Desktop Navigation */}
                            {!isMobile && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {visibleItems.map((item) => (
                                        <Button
                                            key={item.path}
                                            color="inherit"
                                            component={RouterLink}
                                            to={item.path}
                                            startIcon={item.icon}
                                            sx={{
                                                minWidth: 'auto',
                                                '& .MuiButton-startIcon': {
                                                    marginRight: { xs: 0, sm: '8px' }
                                                }
                                            }}
                                        >
                                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                                {item.label}
                                            </Box>
                                        </Button>
                                    ))}
                                </Box>
                            )}

                            {/* Mobile Menu Button */}
                            {isMobile && (
                                <IconButton
                                    color="inherit"
                                    onClick={handleMobileMenuToggle}
                                    sx={{ mr: 1 }}
                                >
                                    <MenuIcon />
                                </IconButton>
                            )}

                            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                    icon={<FiberManualRecord sx={{ fontSize: 12 }} />}
                                    label={isConnected ? 'Connected' : 'Disconnected'}
                                    size="small"
                                    color={isConnected ? 'success' : 'default'}
                                    variant="outlined"
                                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                                />
                                <IconButton
                                    size="large"
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleMenu}
                                    color="inherit"
                                >
                                    <AccountCircle />
                                </IconButton>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorEl}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem disabled>
                                        <Typography variant="body2">
                                            {user?.firstName} {user?.lastName}
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem disabled>
                                        <Typography variant="caption" color="text.secondary">
                                            {user?.email}
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem disabled>
                                        <Chip label={user?.role} size="small" color="primary" />
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </Box>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {/* Mobile Navigation Drawer */}
            <Drawer
                anchor="left"
                open={mobileMenuOpen}
                onClose={handleMobileMenuClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 280,
                        bgcolor: 'background.paper',
                    },
                }}
            >
                <Box sx={{ overflow: 'auto' }}>
                    {/* Header */}
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Recycling sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" color="primary">
                                Container Tracking
                            </Typography>
                        </Box>
                        <IconButton onClick={handleMobileMenuClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Divider />

                    {/* User Info */}
                    {isAuthenticated && user && (
                        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="body1" fontWeight="medium">
                                {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user.email}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label={user.role} size="small" color="primary" />
                                <Chip
                                    icon={<FiberManualRecord sx={{ fontSize: 12 }} />}
                                    label={isConnected ? 'Connected' : 'Disconnected'}
                                    size="small"
                                    color={isConnected ? 'success' : 'default'}
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    )}

                    <Divider />

                    {/* Navigation Items */}
                    {isAuthenticated && (
                        <List>
                            {visibleItems.map((item) => (
                                <ListItem key={item.path} disablePadding>
                                    <ListItemButton
                                        onClick={() => handleNavigateAndClose(item.path)}
                                        sx={{
                                            py: 1.5,
                                            '&:hover': {
                                                bgcolor: 'primary.light',
                                                color: 'white',
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 48 }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontWeight: 'medium'
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}

                    <Divider />

                    {/* Logout Button */}
                    {isAuthenticated && (
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={() => {
                                        handleLogout();
                                        handleMobileMenuClose();
                                    }}
                                    sx={{
                                        py: 1.5,
                                        color: 'error.main',
                                        '&:hover': {
                                            bgcolor: 'error.light',
                                            color: 'white',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 48, color: 'inherit' }}>
                                        <AccountCircle />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Logout"
                                        primaryTypographyProps={{
                                            fontWeight: 'medium'
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    )}
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
            </Box>
        </Box>
    );
}
