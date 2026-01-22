import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import api from '../services/api'

interface Waste {
  _id: string
  type: string
  weight: number
  collectionDate: string
  status: string
}

export default function WasteList() {
  const [wastes, setWastes] = useState<Waste[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  useEffect(() => {
    fetchWastes()
  }, [])

  const fetchWastes = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/wastes')
      setWastes(response.data)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors du chargement des déchets'
      setError(message)
      setSnackbar({ open: true, message, severity: 'error' })
      console.error('Erreur lors du chargement des déchets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Gestion des Déchets
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nouveau Déchet
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell align="right">Poids (kg)</TableCell>
              <TableCell>Date de Collecte</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {wastes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucun déchet enregistré
                </TableCell>
              </TableRow>
            ) : (
              wastes.map((waste) => (
                <TableRow key={waste._id}>
                  <TableCell>{waste.type}</TableCell>
                  <TableCell align="right">{waste.weight}</TableCell>
                  <TableCell>
                    {new Date(waste.collectionDate).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{waste.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
