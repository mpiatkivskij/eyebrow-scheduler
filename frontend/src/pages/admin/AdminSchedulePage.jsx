import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Grid, Switch, FormControlLabel, TextField, Button,
  IconButton, Stack, Alert, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { adminGetSchedules, adminBulkUpdateSchedules } from '../../api/api';

export default function AdminSchedulePage() {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminGetSchedules().then((r) => {
      // Ensure all 7 days exist
      const data = [];
      for (let i = 0; i < 7; i++) {
        const existing = r.data.find((s) => s.day_of_week === i);
        data.push(existing || { day_of_week: i, start_time: '09:00', end_time: '18:00', is_day_off: i === 0, schedule_breaks: [] });
      }
      setSchedules(data);
    }).catch(() => {});
  }, []);

  const updateDay = (idx, field, value) => {
    const updated = [...schedules];
    updated[idx] = { ...updated[idx], [field]: value };
    setSchedules(updated);
  };

  const addBreak = (idx) => {
    const updated = [...schedules];
    updated[idx] = {
      ...updated[idx],
      schedule_breaks: [...(updated[idx].schedule_breaks || []), { start_time: '13:00', end_time: '14:00' }],
    };
    setSchedules(updated);
  };

  const updateBreak = (dayIdx, breakIdx, field, value) => {
    const updated = [...schedules];
    const breaks = [...updated[dayIdx].schedule_breaks];
    breaks[breakIdx] = { ...breaks[breakIdx], [field]: value };
    updated[dayIdx] = { ...updated[dayIdx], schedule_breaks: breaks };
    setSchedules(updated);
  };

  const removeBreak = (dayIdx, breakIdx) => {
    const updated = [...schedules];
    const breaks = [...updated[dayIdx].schedule_breaks];
    const br = breaks[breakIdx];
    if (br.id) {
      breaks[breakIdx] = { ...br, _destroy: true };
    } else {
      breaks.splice(breakIdx, 1);
    }
    updated[dayIdx] = { ...updated[dayIdx], schedule_breaks: breaks };
    setSchedules(updated);
  };

  const handleSave = async () => {
    const payload = schedules.map((s) => ({
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      is_day_off: s.is_day_off,
      schedule_breaks_attributes: (s.schedule_breaks || []).map((b) => ({
        id: b.id || undefined,
        start_time: b.start_time,
        end_time: b.end_time,
        _destroy: b._destroy || false,
      })),
    }));
    await adminBulkUpdateSchedules(payload);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Helper to format time strings for display in inputs
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // Handle "2000-01-01T13:00:00.000Z" or "13:00" format
    if (timeStr.includes('T')) {
      const d = new Date(timeStr);
      return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    }
    return timeStr.slice(0, 5);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>{t('admin.schedule.title')}</Typography>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
          {t('admin.schedule.save')}
        </Button>
      </Box>

      {saved && <Alert severity="success" sx={{ mb: 2 }}>Schedule saved successfully!</Alert>}

      <Grid container spacing={2}>
        {schedules.map((day, idx) => (
          <Grid size={{ xs: 12, md: 6 }} key={day.day_of_week}>
            <Paper sx={{ p: 2.5, opacity: day.is_day_off ? 0.6 : 1, transition: 'opacity 0.3s' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
                  {t(`admin.schedule.days.${day.day_of_week}`)}
                </Typography>
                <FormControlLabel
                  control={<Switch checked={day.is_day_off} onChange={(e) => updateDay(idx, 'is_day_off', e.target.checked)} color="primary" size="small" />}
                  label={t('admin.schedule.dayOff')}
                  labelPlacement="start"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                />
              </Box>

              {!day.is_day_off && (
                <>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField label={t('admin.schedule.startTime')} type="time" size="small" value={formatTime(day.start_time)} onChange={(e) => updateDay(idx, 'start_time', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                    <TextField label={t('admin.schedule.endTime')} type="time" size="small" value={formatTime(day.end_time)} onChange={(e) => updateDay(idx, 'end_time', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                      {t('admin.schedule.breaks')}
                    </Typography>
                    <IconButton size="small" onClick={() => addBreak(idx)} sx={{ color: 'primary.main' }}><AddIcon fontSize="small" /></IconButton>
                  </Box>
                  {(day.schedule_breaks || []).filter((b) => !b._destroy).map((br, bIdx) => (
                    <Stack direction="row" spacing={1} key={bIdx} sx={{ mb: 1 }} alignItems="center">
                      <TextField type="time" size="small" value={formatTime(br.start_time)} onChange={(e) => updateBreak(idx, bIdx, 'start_time', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                      <Typography variant="body2">—</Typography>
                      <TextField type="time" size="small" value={formatTime(br.end_time)} onChange={(e) => updateBreak(idx, bIdx, 'end_time', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                      <IconButton size="small" onClick={() => removeBreak(idx, bIdx)} sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  ))}
                </>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
