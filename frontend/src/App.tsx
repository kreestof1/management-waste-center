import { Routes, Route } from 'react-router-dom'
import { Container, Box } from '@mui/material'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import WasteList from './pages/WasteList'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/wastes" element={<WasteList />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </Container>
    </Layout>
  )
}

export default App
