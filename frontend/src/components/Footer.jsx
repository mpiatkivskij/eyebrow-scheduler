import { useTranslation } from 'react-i18next';
import { Box, Container, Typography, IconButton, Stack } from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import PhoneIcon from '@mui/icons-material/Phone';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)',
        color: 'rgba(255,255,255,0.8)',
        pt: 6, pb: 3, mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={3} sx={{ mb: 4 }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' }, mb: 1 }}>
              <SpaIcon sx={{ color: '#B76E79' }} />
              <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', color: '#fff' }}>
                Beauté
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }}>
              {t('footer.tagline')}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              📍 {t('footer.address')}
            </Typography>
            <Typography variant="body2">
              📞 +380 (50) 123-45-67
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <IconButton sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#B76E79' } }}>
              <InstagramIcon />
            </IconButton>
            <IconButton sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#B76E79' } }}>
              <TelegramIcon />
            </IconButton>
            <IconButton sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#B76E79' } }}>
              <PhoneIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            © {year} Beauté Studio. {t('footer.rights')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
