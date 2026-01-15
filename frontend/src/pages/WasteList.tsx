import { useState, useEffect } from 'react'
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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import axios from 'axios'

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

  useEffect(() => {
    fetchWastes()
  }, [])

  const fetchWastes = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const response = await axios.get(`${apiUrl}/wastes`)
      setWastes(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des déchets:', error)
    } finally {
      setLoading(false)
    }
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
    </Box>
  )
}
