import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Grid, Paper, Stack, Chip, Divider, CircularProgress,
} from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PendingIcon from '@mui/icons-material/Pending';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import dayjs from 'dayjs';
import { adminGetDashboard } from '../../api/api';

const StatCard = ({ icon, label, value, color = '#B76E79' }) => (
  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ width: 52, height: 52, borderRadius: 3, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main', lineHeight: 1 }}>{value}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{label}</Typography>
    </Box>
  </Paper>
);

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const lang = i18n.language?.startsWith('uk') ? 'uk' : 'en';

  useEffect(() => {
    adminGetDashboard().then((res) => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!data) return <Typography>Error loading dashboard</Typography>;

  const statusColors = { pending: '#FFA726', confirmed: '#66BB6A', cancelled: '#EF5350', completed: '#42A5F5' };

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 4, fontSize: { xs: '1.5rem', md: '2rem' } }}>
        {t('admin.dashboard.title')}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<TodayIcon />} label={t('admin.dashboard.todayAppointments')} value={data.today_count} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<DateRangeIcon />} label={t('admin.dashboard.weekAppointments')} value={data.week_count} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<CalendarMonthIcon />} label={t('admin.dashboard.monthAppointments')} value={data.month_count} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<AttachMoneyIcon />} label={t('admin.dashboard.weekRevenue')} value={`₴${Number(data.week_revenue || 0).toFixed(0)}`} color="#66BB6A" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<AttachMoneyIcon />} label={t('admin.dashboard.monthRevenue')} value={`₴${Number(data.month_revenue || 0).toFixed(0)}`} color="#66BB6A" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<PendingIcon />} label={t('admin.dashboard.pending')} value={data.pending_count} color="#FFA726" />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontSize: '1.2rem' }}>{t('admin.dashboard.upcoming')}</Typography>
        {data.upcoming_appointments?.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>No upcoming appointments</Typography>
        ) : (
          <Stack divider={<Divider />} spacing={0}>
            {data.upcoming_appointments?.map((apt) => (
              <Box key={apt.id} sx={{ py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="subtitle2">{apt.client_name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {lang === 'uk' ? apt.service?.name_uk : apt.service?.name_en} • {apt.client_phone}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dayjs(apt.start_time).format('DD.MM • HH:mm')}
                  </Typography>
                  <Chip
                    label={t(`admin.appointments.statuses.${apt.status}`)}
                    size="small"
                    sx={{ backgroundColor: `${statusColors[apt.status]}20`, color: statusColors[apt.status], fontWeight: 600 }}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
