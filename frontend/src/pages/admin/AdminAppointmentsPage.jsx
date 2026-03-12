import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, TextField, Stack, MenuItem,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ListIcon from '@mui/icons-material/List';
import { adminGetAppointments, adminUpdateAppointment } from '../../api/api';

export default function AdminAppointmentsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('uk') ? 'uk' : 'en';
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState('list');
  const [filterDate, setFilterDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    const params = {};
    if (filterDate) params.date = filterDate.format('YYYY-MM-DD');
    if (filterStatus) params.status = filterStatus;
    adminGetAppointments(params).then((r) => setAppointments(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [filterDate, filterStatus]);

  const handleStatus = async (id, status) => {
    await adminUpdateAppointment(id, { status });
    load();
  };

  const statusColors = { pending: '#FFA726', confirmed: '#66BB6A', cancelled: '#EF5350', completed: '#42A5F5' };

  // Group appointments by date for calendar view
  const groupedByDate = appointments.reduce((acc, apt) => {
    const date = dayjs(apt.start_time).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>{t('admin.appointments.title')}</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={t('admin.appointments.date')}
              value={filterDate}
              onChange={setFilterDate}
              slotProps={{ textField: { size: 'small', sx: { width: 160 } }, field: { clearable: true } }}
            />
          </LocalizationProvider>
          <TextField
            select size="small" value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label={t('admin.appointments.status')} sx={{ width: 140 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">{t('admin.appointments.statuses.pending')}</MenuItem>
            <MenuItem value="confirmed">{t('admin.appointments.statuses.confirmed')}</MenuItem>
            <MenuItem value="cancelled">{t('admin.appointments.statuses.cancelled')}</MenuItem>
            <MenuItem value="completed">{t('admin.appointments.statuses.completed')}</MenuItem>
          </TextField>
          <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && setView(v)} size="small">
            <ToggleButton value="list"><ListIcon /></ToggleButton>
            <ToggleButton value="calendar"><CalendarMonthIcon /></ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>

      {view === 'list' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase' } }}>
                <TableCell>{t('admin.appointments.client')}</TableCell>
                <TableCell>{t('admin.appointments.phone')}</TableCell>
                <TableCell>{t('admin.appointments.service')}</TableCell>
                <TableCell>{t('admin.appointments.date')}</TableCell>
                <TableCell>{t('admin.appointments.time')}</TableCell>
                <TableCell>{t('admin.appointments.status')}</TableCell>
                <TableCell align="right">{t('admin.appointments.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((apt) => (
                <TableRow key={apt.id} hover>
                  <TableCell>{apt.client_name}</TableCell>
                  <TableCell>{apt.client_phone}</TableCell>
                  <TableCell>{lang === 'uk' ? apt.service?.name_uk : apt.service?.name_en}</TableCell>
                  <TableCell>{dayjs(apt.start_time).format('DD.MM.YYYY')}</TableCell>
                  <TableCell>{dayjs(apt.start_time).format('HH:mm')} - {dayjs(apt.end_time).format('HH:mm')}</TableCell>
                  <TableCell>
                    <Chip label={t(`admin.appointments.statuses.${apt.status}`)} size="small" sx={{ backgroundColor: `${statusColors[apt.status]}20`, color: statusColors[apt.status], fontWeight: 600 }} />
                  </TableCell>
                  <TableCell align="right">
                    {apt.status === 'pending' && (
                      <>
                        <IconButton size="small" onClick={() => handleStatus(apt.id, 'confirmed')} sx={{ color: '#66BB6A' }} title="Confirm"><CheckIcon /></IconButton>
                        <IconButton size="small" onClick={() => handleStatus(apt.id, 'cancelled')} sx={{ color: '#EF5350' }} title="Cancel"><CloseIcon /></IconButton>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                      <IconButton size="small" onClick={() => handleStatus(apt.id, 'completed')} sx={{ color: '#42A5F5' }} title="Complete"><DoneAllIcon /></IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {appointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>No appointments found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box>
          {Object.entries(groupedByDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, apts]) => (
            <Paper key={date} sx={{ mb: 2, p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'primary.main' }}>
                {dayjs(date).format('dddd, DD MMMM YYYY')}
              </Typography>
              <Stack spacing={1}>
                {apts.map((apt) => (
                  <Box key={apt.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, px: 2, borderRadius: 2, background: 'rgba(0,0,0,0.02)' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {dayjs(apt.start_time).format('HH:mm')} - {dayjs(apt.end_time).format('HH:mm')}
                      </Typography>
                      <Typography variant="caption">{apt.client_name} • {lang === 'uk' ? apt.service?.name_uk : apt.service?.name_en}</Typography>
                    </Box>
                    <Chip label={t(`admin.appointments.statuses.${apt.status}`)} size="small" sx={{ backgroundColor: `${statusColors[apt.status]}20`, color: statusColors[apt.status], fontWeight: 600 }} />
                  </Box>
                ))}
              </Stack>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
