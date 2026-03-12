import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  Chip, Stack, Fade,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getServices } from '../api/api';

const categoryIcons = {
  brows: <AutoAwesomeIcon />,
  eyelids: <VisibilityIcon />,
  face: <FaceRetouchingNaturalIcon />,
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const lang = i18n.language?.startsWith('uk') ? 'uk' : 'en';

  useEffect(() => {
    getServices().then((res) => setServices(res.data)).catch(() => {});
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles (updated to match turquoise theme) */}
        <Box sx={{ position: 'absolute', top: '10%', left: '5%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(6,182,212,0.05)', animation: 'float 6s ease-in-out infinite', '@keyframes float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } } }} />
        <Box sx={{ position: 'absolute', bottom: '15%', right: '10%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(6,182,212,0.08)', animation: 'float 8s ease-in-out infinite reverse' }} />
        <Box sx={{ position: 'absolute', top: '40%', right: '25%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(6,182,212,0.04)', animation: 'float 5s ease-in-out infinite' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '4.5rem' },
                  lineHeight: 1.1, mb: 3, color: 'secondary.main',
                  '& span': { color: 'primary.main', display: 'block' },
                }}
              >
                {t('hero.title').split(' ').slice(0, -2).join(' ')}{' '}
                <span>{t('hero.title').split(' ').slice(-2).join(' ')}</span>
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 5, fontWeight: 400, maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
                {t('hero.subtitle')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button variant="contained" size="large" onClick={() => navigate('/booking')} endIcon={<ArrowForwardIcon />}
                  sx={{ px: 5, py: 1.5, fontSize: '1.05rem', borderRadius: 8 }}>
                  {t('hero.cta')}
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, mb: 2 }}>
              {t('services.title')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
              {t('services.subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {services.map((service, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service.id}>
                <Fade in timeout={600 + idx * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex', flexDirection: 'column',
                      cursor: 'pointer', position: 'relative', overflow: 'visible',
                      '&::before': {
                        content: '""', position: 'absolute', top: 0, left: 0, right: 0,
                        height: 4, background: 'linear-gradient(90deg, #101113, #2D3036)',
                        borderRadius: '16px 16px 0 0',
                      },
                    }}
                    onClick={() => navigate('/booking', { state: { serviceId: service.id } })}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{
                          width: 48, height: 48, borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(16,17,19,0.1), rgba(16,17,19,0.05))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'primary.main',
                        }}>
                          {categoryIcons[service.category] || <AutoAwesomeIcon />}
                        </Box>
                        <Chip
                          label={t(`services.categories.${service.category}`)}
                          size="small"
                          sx={{ backgroundColor: 'rgba(16,17,19,0.08)', color: 'primary.main', fontWeight: 600 }}
                        />
                      </Box>
                      <Typography variant="h5" sx={{ mb: 1, fontSize: '1.2rem' }}>
                        {lang === 'uk' ? service.name_uk : service.name_en}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, flexGrow: 1, lineHeight: 1.6 }}>
                        {lang === 'uk' ? service.description_uk : service.description_en}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                          <AccessTimeIcon fontSize="small" />
                          <Typography variant="body2">{t('services.duration', { minutes: service.duration_minutes })}</Typography>
                        </Stack>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                          ₴{Number(service.price).toFixed(0)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
