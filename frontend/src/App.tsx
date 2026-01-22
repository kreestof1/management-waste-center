import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ContainerList from './pages/ContainerList';
import ContainerHistory from './pages/ContainerHistory';
import ManagerDashboard from './pages/ManagerDashboard';
import ManageTypes from './pages/ManageTypes';
import ManageContainers from './pages/ManageContainers';
import ManageCenters from './pages/ManageCenters';
import NotFound from './pages/NotFound';
import { useAuth } from './context/AuthContext';

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Public routes */}
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
            />

            {/* Protected routes */}
            <Route
                path="/*"
                element={
                    <Layout>
                        <Container maxWidth="lg">
                            <Box sx={{ mt: 4, mb: 4 }}>
                                <Routes>
                                    <Route
                                        path="/"
                                        element={
                                            <PrivateRoute>
                                                <Dashboard />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/containers"
                                        element={
                                            <PrivateRoute>
                                                <ContainerList />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/containers/:id/history"
                                        element={
                                            <PrivateRoute>
                                                <ContainerHistory />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/manager"
                                        element={
                                            <PrivateRoute>
                                                <ManagerDashboard />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/manage-types"
                                        element={
                                            <PrivateRoute>
                                                <ManageTypes />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/manage-containers"
                                        element={
                                            <PrivateRoute>
                                                <ManageContainers />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/manage-centers"
                                        element={
                                            <PrivateRoute>
                                                <ManageCenters />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </Box>
                        </Container>
                    </Layout>
                }
            />
        </Routes>
    );
}

export default App;
