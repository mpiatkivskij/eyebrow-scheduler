import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Container, Typography, ImageList, ImageListItem, ImageListItemBar,
  Dialog, IconButton, Fade, useMediaQuery, useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getGalleryItems } from '../api/api';

export default function PortfolioPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const lang = i18n.language?.startsWith('uk') ? 'uk' : 'en';

  useEffect(() => {
    getGalleryItems().then((res) => setItems(res.data)).catch(() => {});
  }, []);

  const cols = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <Box sx={{ py: 8, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, mb: 2 }}>
              {t('portfolio.title')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
              {t('portfolio.subtitle')}
            </Typography>
            <Box sx={{ width: 60, height: 3, background: 'linear-gradient(90deg, #B76E79, #D4A0A7)', borderRadius: 2, mx: 'auto', mt: 3 }} />
          </Box>
        </Fade>

        <ImageList variant="masonry" cols={cols} gap={16}>
          {items.map((item, idx) => (
            <Fade in timeout={600 + idx * 150} key={item.id}>
              <ImageListItem
                sx={{
                  borderRadius: 3, overflow: 'hidden', cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  '&:hover': { transform: 'scale(1.02)', '& .MuiImageListItemBar-root': { opacity: 1 } },
                }}
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.image_url}
                  alt={lang === 'uk' ? item.description_uk : item.description_en}
                  loading="lazy"
                  style={{ borderRadius: 12 }}
                />
                <ImageListItemBar
                  title={lang === 'uk' ? item.description_uk : item.description_en}
                  sx={{
                    opacity: 0, transition: 'opacity 0.3s ease',
                    background: 'linear-gradient(transparent, rgba(44,44,44,0.8))',
                    borderRadius: '0 0 12px 12px',
                    '& .MuiImageListItemBar-title': { fontWeight: 500, fontSize: '0.9rem' },
                  }}
                />
              </ImageListItem>
            </Fade>
          ))}
        </ImageList>
      </Container>

      {/* Lightbox */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', overflow: 'visible' } }}
      >
        {selectedImage && (
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => setSelectedImage(null)}
              sx={{ position: 'absolute', top: -40, right: 0, color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}
            >
              <CloseIcon />
            </IconButton>
            <img
              src={selectedImage.image_url}
              alt=""
              style={{ width: '100%', borderRadius: 16, display: 'block' }}
            />
            <Typography sx={{ color: '#fff', textAlign: 'center', mt: 2 }}>
              {lang === 'uk' ? selectedImage.description_uk : selectedImage.description_en}
            </Typography>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
