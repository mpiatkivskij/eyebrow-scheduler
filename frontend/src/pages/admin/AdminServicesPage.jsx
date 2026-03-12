import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Stack, Switch, FormControlLabel, Chip, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminGetServices, adminCreateService, adminUpdateService, adminDeleteService } from '../../api/api';

const defaultForm = { name_en: '', name_uk: '', description_en: '', description_uk: '', price: '', duration_minutes: '', category: 'brows', active: true };

export default function AdminServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const load = () => adminGetServices().then((r) => setServices(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleOpen = (service = null) => {
    if (service) {
      setEditing(service);
      setForm({ ...service, price: String(service.price), duration_minutes: String(service.duration_minutes) });
    } else {
      setEditing(null);
      setForm(defaultForm);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...form, price: parseFloat(form.price), duration_minutes: parseInt(form.duration_minutes) };
    if (editing) {
      await adminUpdateService(editing.id, payload);
    } else {
      await adminCreateService(payload);
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this service?')) {
      await adminDeleteService(id);
      load();
    }
  };

  const categoryColors = { brows: '#B76E79', eyelids: '#7986CB', face: '#66BB6A' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>{t('admin.services.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          {t('admin.services.add')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase' } }}>
              <TableCell>{t('admin.services.nameEn')}</TableCell>
              <TableCell>{t('admin.services.nameUk')}</TableCell>
              <TableCell>{t('admin.services.price')}</TableCell>
              <TableCell>{t('admin.services.duration')}</TableCell>
              <TableCell>{t('admin.services.category')}</TableCell>
              <TableCell>{t('admin.services.active')}</TableCell>
              <TableCell align="right">{t('admin.appointments.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>{s.name_en}</TableCell>
                <TableCell>{s.name_uk}</TableCell>
                <TableCell>₴{Number(s.price).toFixed(0)}</TableCell>
                <TableCell>{s.duration_minutes} min</TableCell>
                <TableCell>
                  <Chip label={s.category} size="small" sx={{ backgroundColor: `${categoryColors[s.category]}20`, color: categoryColors[s.category], fontWeight: 600 }} />
                </TableCell>
                <TableCell>
                  <Chip label={s.active ? '✓' : '✗'} size="small" color={s.active ? 'success' : 'default'} variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpen(s)} sx={{ color: 'primary.main' }}><EditIcon /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(s.id)} sx={{ color: 'error.main' }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? t('admin.services.edit') : t('admin.services.add')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('admin.services.nameEn')} fullWidth value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
            <TextField label={t('admin.services.nameUk')} fullWidth value={form.name_uk} onChange={(e) => setForm({ ...form, name_uk: e.target.value })} />
            <TextField label={t('admin.services.descEn')} fullWidth multiline rows={2} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
            <TextField label={t('admin.services.descUk')} fullWidth multiline rows={2} value={form.description_uk} onChange={(e) => setForm({ ...form, description_uk: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label={t('admin.services.price')} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} sx={{ flex: 1 }} />
              <TextField label={t('admin.services.duration')} type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} sx={{ flex: 1 }} />
            </Stack>
            <TextField label={t('admin.services.category')} select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <MenuItem value="brows">Brows</MenuItem>
              <MenuItem value="eyelids">Eyelids</MenuItem>
              <MenuItem value="face">Face</MenuItem>
            </TextField>
            <FormControlLabel control={<Switch checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} color="primary" />} label={t('admin.services.active')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>{t('admin.services.cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>{t('admin.services.save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
