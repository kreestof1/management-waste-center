import { Box, Typography, Grid, Paper } from '@mui/material'
import RecyclingIcon from '@mui/icons-material/Recycling'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de Bord
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <RecyclingIcon color="primary" sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h5">1,234</Typography>
              <Typography color="text.secondary">Déchets Traités</Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUpIcon color="secondary" sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h5">+15%</Typography>
              <Typography color="text.secondary">Évolution Mensuelle</Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalShippingIcon color="success" sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h5">42</Typography>
              <Typography color="text.secondary">Collectes du Jour</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
