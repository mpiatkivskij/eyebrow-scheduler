import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box,
  Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme,
  ToggleButtonGroup, ToggleButton, Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SpaIcon from '@mui/icons-material/Spa';

export default function Header() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.portfolio'), path: '/portfolio' },
    { label: t('nav.booking'), path: '/booking' },
  ];

  const handleLanguageChange = (_, newLang) => {
    if (newLang) i18n.changeLanguage(newLang);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar position="sticky" color="transparent" sx={{ zIndex: 1100 }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', py: 0.5 }}>
            <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 1 }}>
              <SpaIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif', color: 'secondary.main', fontWeight: 700 }}>
                Beauté
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: isActive(item.path) ? 'primary.main' : 'text.primary',
                      fontWeight: isActive(item.path) ? 700 : 500,
                      position: 'relative',
                      '&::after': isActive(item.path) ? {
                        content: '""', position: 'absolute', bottom: 4, left: '20%', right: '20%',
                        height: 2, background: 'linear-gradient(90deg, #B76E79, #D4A0A7)', borderRadius: 1,
                      } : {},
                      '&:hover': { transform: 'none', boxShadow: 'none', backgroundColor: 'rgba(183,110,121,0.04)' },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ToggleButtonGroup
                value={i18n.language?.startsWith('uk') ? 'uk' : 'en'}
                exclusive
                onChange={handleLanguageChange}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: '20px !important', px: 1.5, py: 0.3, fontSize: '0.75rem',
                    border: '1px solid rgba(183,110,121,0.3)',
                    '&.Mui-selected': { backgroundColor: 'primary.main', color: '#fff', '&:hover': { backgroundColor: 'primary.dark' } },
                  },
                }}
              >
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="uk">UA</ToggleButton>
              </ToggleButtonGroup>

              {isMobile && (
                <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'secondary.main' }}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 3 }}>
          <Box sx={{ px: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpaIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif' }}>Beauté</Typography>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItem
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  color: isActive(item.path) ? 'primary.main' : 'text.primary',
                  borderLeft: isActive(item.path) ? '3px solid' : '3px solid transparent',
                  borderColor: isActive(item.path) ? 'primary.main' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(183,110,121,0.04)' },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
