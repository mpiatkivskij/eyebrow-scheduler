import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, Paper, Stack, Alert, Fade,
} from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import { adminLogin } from '../../api/api';

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adminLogin(email, password);
      localStorage.setItem('admin_token', res.data.token);
      navigate('/admin/dashboard');
    } catch {
      setError(t('admin.login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #FAF0E6 0%, #F7E7CE 50%, #F5E6D3 100%)',
    }}>
      <Fade in timeout={800}>
        <Container maxWidth="xs">
          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.9)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #B76E79, #D4A0A7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SpaIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ mb: 1 }}>{t('admin.login.title')}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>Beauté Studio</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField label={t('admin.login.email')} fullWidth type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <TextField label={t('admin.login.password')} fullWidth type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button variant="contained" size="large" type="submit" disabled={loading} fullWidth sx={{ py: 1.3 }}>
                  {t('admin.login.submit')}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
}
