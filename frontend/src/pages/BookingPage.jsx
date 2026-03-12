import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, TextField, Stack, CircularProgress, Alert, Fade, IconButton, Radio,
  Divider, Paper, Avatar
} from '@mui/material';
import dayjs from 'dayjs';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { getServices, getAvailableSlots, createAppointment } from '../api/api';

export default function BookingPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const lang = i18n.language?.startsWith('uk') ? 'uk' : 'en';

  // Navigation state (0: Service, 1: Date/Time, 2: Details, 3: Success)
  const [step, setStep] = useState(0);

  // Data state
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  
  // Dates
  const [datesList, setDatesList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  
  // Slots
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slotsMessage, setSlotsMessage] = useState('');
  
  // Form
  const [formData, setFormData] = useState({ client_name: '', client_phone: '', client_email: '', notes: '' });
  const [booked, setBooked] = useState(null);

  // Generate next 30 days
  useEffect(() => {
    const dates = [];
    for(let i = 0; i < 30; i++) {
      dates.push(dayjs().add(i, 'day'));
    }
    setDatesList(dates);
  }, []);

  useEffect(() => {
    getServices().then((res) => {
      setServices(res.data);
      if (location.state?.serviceId) {
        const s = res.data.find((sv) => sv.id === location.state.serviceId);
        if (s) { 
          setSelectedService(s); 
          setStep(1); 
        }
      }
    }).catch(() => {});
  }, [location.state?.serviceId]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      setLoading(true);
      setSlotsMessage('');
      getAvailableSlots(selectedService.id, selectedDate.format('YYYY-MM-DD'))
        .then((res) => {
          setSlots(res.data.slots || []);
          setSelectedSlot(null); // Reset slot on date change
          if (res.data.message) setSlotsMessage(res.data.message);
        })
        .catch(() => setSlots([]))
        .finally(() => setLoading(false));
    }
  }, [selectedService, selectedDate]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createAppointment({
        service_id: selectedService.id,
        appointment: { ...formData, start_time: selectedSlot.start_time, language_used: lang },
      });
      setBooked(res.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.errors?.join(', ') || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Helper to group slots
  const groupedSlots = slots.reduce((acc, slot) => {
    const hour = dayjs(slot.start_time).hour();
    if (hour < 12) acc.morning.push(slot);
    else if (hour < 17) acc.afternoon.push(slot);
    else acc.evening.push(slot);
    return acc;
  }, { morning: [], afternoon: [], evening: [] });

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const StickyFooter = ({ children }) => (
    <Box sx={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid #eaeaea',
      p: 2, zIndex: 1000, boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
    }}>
      <Container maxWidth="sm">
        {children}
      </Container>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: '#FAFAFA', pb: 12 }}>
      {/* Header */}
      <Box sx={{ background: '#fff', borderBottom: '1px solid #eaeaea', py: 2, position: 'sticky', top: 0, zIndex: 10 }}>
        <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center' }}>
          {step > 0 && step < 3 && (
            <IconButton onClick={goBack} sx={{ mr: 1, ml: -1.5 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, textAlign: step > 0 && step < 3 ? 'left' : 'center' }}>
            {step === 0 && t('booking.steps.service')}
            {step === 1 && t('booking.steps.datetime')}
            {step === 2 && t('booking.steps.details')}
            {step === 3 && t('booking.confirmation')}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Step 0: Services */}
        {step === 0 && (
          <Fade in>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                {t('booking.selectService', 'Select a service')}
              </Typography>
              <Stack spacing={2}>
                {services.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <Paper
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      variant="outlined"
                      sx={{
                        p: 2.5, borderRadius: 3, cursor: 'pointer',
                        borderColor: isSelected ? 'primary.main' : '#eaeaea',
                        background: isSelected ? 'rgba(183,110,121,0.02)' : '#fff',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.light' }
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1} pr={2}>
                          <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 0.5, fontWeight: 600 }}>
                            {lang === 'uk' ? service.name_uk : service.name_en}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {lang === 'uk' ? service.description_uk : service.description_en}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                            {t('services.duration', { minutes: service.duration_minutes })}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%' }}>
                          <Radio
                            checked={isSelected}
                            icon={<RadioButtonUncheckedIcon />}
                            checkedIcon={<CheckCircleIcon color="primary" />}
                            sx={{ p: 0, mb: 2 }}
                          />
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            ₴{Number(service.price).toFixed(0)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          </Fade>
        )}

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <Fade in>
            <Box>
              {/* Date Scroll */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {selectedDate.format('MMMM YYYY')}
              </Typography>
              <Box sx={{ 
                display: 'flex', overflowX: 'auto', pb: 2, mb: 3, mx: -2, px: 2,
                scrollBehavior: 'smooth', '&::-webkit-scrollbar': { display: 'none' } 
              }}>
                {datesList.map((d, i) => {
                  const isCur = d.isSame(selectedDate, 'day');
                  return (
                    <Box
                      key={i}
                      onClick={() => setSelectedDate(d)}
                      sx={{
                        minWidth: 60, height: 75, mr: 1.5, borderRadius: 3,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', border: '1px solid',
                        borderColor: isCur ? 'primary.main' : '#eaeaea',
                        background: isCur ? 'primary.main' : '#fff',
                        color: isCur ? '#fff' : 'text.primary',
                        transition: '0.2s'
                      }}
                    >
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, opacity: 0.8 }}>
                        {d.format('ddd')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, mt: -0.5 }}>
                        {d.format('DD')}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Time Slots */}
              {loading ? (
                <Box textAlign="center" py={5}><CircularProgress /></Box>
              ) : (
                <>
                  {slotsMessage && <Alert severity="info" sx={{ mb: 3 }}>{t('booking.closedDay')}</Alert>}
                  {!slotsMessage && slots.length === 0 && <Alert severity="warning" sx={{ mb: 3 }}>{t('booking.noSlots')}</Alert>}
                  
                  {slots.length > 0 && (
                    <Box>
                      {['morning', 'afternoon', 'evening'].map((period) => {
                        const periodSlots = groupedSlots[period];
                        if (periodSlots.length === 0) return null;
                        return (
                          <Box key={period} sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, textTransform: 'capitalize' }}>
                              {t(`booking.periods.${period}`, period)}
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 1.5 }}>
                              {periodSlots.map(slot => {
                                const isSel = selectedSlot?.start_time === slot.start_time;
                                return (
                                  <Button
                                    key={slot.start_time}
                                    variant={isSel ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedSlot(slot)}
                                    color="primary"
                                    sx={{ 
                                      borderRadius: 2, 
                                      py: 1, 
                                      fontWeight: 600,
                                      borderColor: isSel ? 'primary.main' : '#ccc',
                                      color: isSel ? '#fff' : 'text.primary',
                                    }}
                                  >
                                    {dayjs(slot.start_time).format('HH:mm')}
                                  </Button>
                                );
                              })}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Fade>
        )}

        {/* Step 2: Contact Details */}
        {step === 2 && (
          <Fade in>
            <Box>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 4, background: '#fff' }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                  {t('booking.summaryTitle', 'Booking Summary')}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {lang === 'uk' ? selectedService?.name_uk : selectedService?.name_en}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {selectedDate?.format('dddd, D MMMM YYYY')} at {dayjs(selectedSlot?.start_time).format('HH:mm')}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total To Pay</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>₴{Number(selectedService?.price).toFixed(0)}</Typography>
                </Box>
              </Paper>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {t('booking.clientDetails', 'Client Details')}
              </Typography>
              <Stack spacing={2.5}>
                <TextField label={t('booking.name')} fullWidth required
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField label={t('booking.phone')} fullWidth required
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField label={t('booking.email')} fullWidth type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
                <TextField label={t('booking.notes')} fullWidth multiline rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Stack>
            </Box>
          </Fade>
        )}

        {/* Step 3: Success */}
        {step === 3 && booked && (
          <Fade in>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: 'primary.main' }}>
                <CheckCircleIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                {t('booking.success.title', 'Booking Confirmed!')}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, px: 2 }}>
                {t('booking.success.message', { name: booked.client_name })}
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 4, textAlign: 'left', background: '#fff' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Service</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>{lang === 'uk' ? selectedService?.name_uk : selectedService?.name_en}</Typography>
                
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Date & Time</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  {dayjs(booked.start_time).format('DD.MM.YYYY')} at {dayjs(booked.start_time).format('HH:mm')}
                </Typography>
              </Paper>

              <Button variant="contained" size="large" onClick={() => navigate('/')} sx={{ borderRadius: 8, px: 4, py: 1.5 }}>
                {t('booking.success.home', 'Back to Home')}
              </Button>
            </Box>
          </Fade>
        )}
      </Container>

      {/* Sticky Bottom Bars for Steps 0, 1, 2 */}
      {step === 0 && selectedService && (
        <StickyFooter>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{lang === 'uk' ? selectedService.name_uk : selectedService.name_en}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>₴{Number(selectedService.price).toFixed(0)}</Typography>
            </Box>
            <Button variant="contained" onClick={() => setStep(1)} sx={{ borderRadius: 8, px: 3, py: 1.2 }}>
              {t('booking.continue', 'Continue')}
            </Button>
          </Box>
        </StickyFooter>
      )}

      {step === 1 && selectedSlot && (
        <StickyFooter>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{selectedDate.format('DD MMM')} • {dayjs(selectedSlot.start_time).format('HH:mm')}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{lang === 'uk' ? selectedService?.name_uk : selectedService?.name_en}</Typography>
            </Box>
            <Button variant="contained" onClick={() => setStep(2)} sx={{ borderRadius: 8, px: 3, py: 1.2 }}>
              {t('booking.continue', 'Continue')}
            </Button>
          </Box>
        </StickyFooter>
      )}

      {step === 2 && (
        <StickyFooter>
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
            <Box flex={1}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>₴{Number(selectedService?.price).toFixed(0)}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: -0.5 }}>Pay at venue</Typography>
            </Box>
            <Button 
              variant="contained" 
              fullWidth
              disabled={!formData.client_name || !formData.client_phone || loading} 
              onClick={handleSubmit} 
              sx={{ borderRadius: 8, py: 1.5, flex: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t('booking.confirm', 'Confirm Booking')}
            </Button>
          </Box>
        </StickyFooter>
      )}
    </Box>
  );
}
