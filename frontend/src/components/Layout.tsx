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
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Recycling, AccountCircle, FiberManualRecord } from '@mui/icons-material';
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
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
                            <Button color="inherit" component={RouterLink} to="/">
                                Dashboard
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/containers">
                                Containers
                            </Button>
                            {(user?.role === 'manager' || user?.role === 'superadmin') && (
                                <Button color="inherit" component={RouterLink} to="/manager">
                                    Manager
                                </Button>
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
            <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
            </Box>
        </Box>
    );
}
