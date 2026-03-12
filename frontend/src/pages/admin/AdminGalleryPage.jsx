import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Button, Grid, Card, CardMedia, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, IconButton, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getGalleryItems, adminCreateGalleryItem, adminUpdateGalleryItem, adminDeleteGalleryItem } from '../../api/api';

const defaultForm = { image_url: '', description_en: '', description_uk: '', category: 'brows', sort_order: 0 };

export default function AdminGalleryPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const load = () => getGalleryItems().then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleOpen = (item = null) => {
    if (item) {
      setEditing(item);
      setForm({ ...item, sort_order: String(item.sort_order || 0) });
    } else {
      setEditing(null);
      setForm(defaultForm);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 };
    if (editing) {
      await adminUpdateGalleryItem(editing.id, payload);
    } else {
      await adminCreateGalleryItem(payload);
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this image?')) {
      await adminDeleteGalleryItem(id);
      load();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>{t('admin.gallery.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          {t('admin.gallery.add')}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
            <Card sx={{ '&:hover': { transform: 'none' } }}>
              <CardMedia component="img" height="200" image={item.image_url} alt="" sx={{ objectFit: 'cover' }} />
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" noWrap>{item.description_en || 'No description'}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Order: {item.sort_order}</Typography>
              </CardContent>
              <CardActions sx={{ pt: 0 }}>
                <IconButton size="small" onClick={() => handleOpen(item)} sx={{ color: 'primary.main' }}><EditIcon /></IconButton>
                <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: 'error.main' }}><DeleteIcon /></IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Image' : t('admin.gallery.add')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('admin.gallery.imageUrl')} fullWidth value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            {form.image_url && (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', maxHeight: 200 }}>
                <img src={form.image_url} alt="Preview" style={{ width: '100%', objectFit: 'cover' }} />
              </Box>
            )}
            <TextField label={t('admin.gallery.descEn')} fullWidth value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
            <TextField label={t('admin.gallery.descUk')} fullWidth value={form.description_uk} onChange={(e) => setForm({ ...form, description_uk: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <TextField label={t('admin.gallery.category')} select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} sx={{ flex: 1 }}>
                <MenuItem value="brows">Brows</MenuItem>
                <MenuItem value="eyelids">Eyelids</MenuItem>
                <MenuItem value="face">Face</MenuItem>
              </TextField>
              <TextField label={t('admin.gallery.sortOrder')} type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} sx={{ flex: 1 }} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{t('admin.gallery.save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
