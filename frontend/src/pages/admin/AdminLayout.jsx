import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  AppBar, Toolbar, Typography, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CollectionsIcon from '@mui/icons-material/Collections';
import LogoutIcon from '@mui/icons-material/Logout';
import SpaIcon from '@mui/icons-material/Spa';

const DRAWER_WIDTH = 260;

export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { label: t('admin.nav.dashboard'), path: '/admin/dashboard', icon: <DashboardIcon /> },
    { label: t('admin.nav.services'), path: '/admin/services', icon: <ContentCutIcon /> },
    { label: t('admin.nav.appointments'), path: '/admin/appointments', icon: <CalendarMonthIcon /> },
    { label: t('admin.nav.schedule'), path: '/admin/schedule', icon: <ScheduleIcon /> },
    { label: t('admin.nav.gallery'), path: '/admin/gallery', icon: <CollectionsIcon /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <SpaIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>
          Beauté
        </Typography>
      </Box>
      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link} to={item.path}
              selected={location.pathname === item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                mx: 1.5, borderRadius: 2, mb: 0.5,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(183,110,121,0.1), rgba(183,110,121,0.05))',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
                '&:hover': { background: 'rgba(183,110,121,0.04)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ mx: 1.5, borderRadius: 2, my: 1, color: 'text.secondary' }}>
            <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary={t('admin.nav.logout')} />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#F8F8F8' }}>
      {isMobile ? (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none', boxShadow: '2px 0 12px rgba(0,0,0,0.04)' } }}>
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isMobile && (
          <AppBar position="sticky" sx={{ background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
            <Toolbar>
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}><MenuIcon /></IconButton>
              <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", serif', color: 'secondary.main' }}>Beauté Admin</Typography>
            </Toolbar>
          </AppBar>
        )}
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
