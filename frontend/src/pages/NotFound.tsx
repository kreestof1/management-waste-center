import React from 'react';
import { Box, Typography, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFound() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="400px"
    >
      <Typography variant="h1" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page non trouvée
      </Typography>
      <Button variant="contained" component={RouterLink} to="/" sx={{ mt: 2 }}>
        Retour à l'accueil
      </Button>
    </Box>
  )
}
