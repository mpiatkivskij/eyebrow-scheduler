import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#101113', // Fresha black
      light: '#2D3036',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2C2C2C', // Charcoal
      light: '#555555',
      dark: '#1A1A1A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F6F8', // Fresha background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#101113', // Fresha text
      secondary: '#6B7280', // Fresha secondary text
    },
    nude: {
      main: '#F5E6D3',
      light: '#FAF0E6',
      dark: '#E8D5C0',
    },
    champagne: {
      main: '#F7E7CE',
      light: '#FFF5E6',
      dark: '#E8D3B0',
    },
    freshaBlack: {
      main: '#101113',
      light: '#2D3036',
      dark: '#000000',
    },
    divider: 'rgba(17, 24, 28, 0.08)', // subtle divider
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none', // NextUI never uses uppercase buttons
      letterSpacing: 'normal',
    },
  },
  shape: {
    borderRadius: 14, // NextUI "md" / "lg" default
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // slightly smaller than cards
          padding: '8px 16px',
          fontSize: '0.875rem',
          minWidth: 'auto',
          boxShadow: 'none', // NextUI default flat buttons
          transition: 'transform 0.15s ease, opacity 0.25s ease, background-color 0.25s ease',
          '&:hover': {
            boxShadow: 'none',
            opacity: 0.85, // NextUI hover effect (opacity drop)
          },
          '&:active': {
            transform: 'scale(0.97)', // NextUI active scale
          },
        },
        contained: {
          background: '#101113',
          color: '#FFFFFF',
          transition: 'all 0.25s',
          '&:hover': {
            background: '#000000', // Solid black on hover
          },
        },
        outlined: {
          borderWidth: '2px', // NextUI outlined are slightly thicker
          borderColor: '#E4E4E7', // default-200
          color: '#11181C',
          '&:hover': {
            borderWidth: '2px', // avoid border width flicker
            backgroundColor: '#F4F4F5', // default-100
            borderColor: '#E4E4E7',
          },
        },
        text: {
          color: '#11181C',
          '&:hover': {
            backgroundColor: '#F4F4F5',
          },
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '1rem',
          borderRadius: 14,
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.75rem',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.03), 0px 2px 30px 0px rgba(0,0,0,0.08)', // NextUI style diffuse shadow
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          backgroundImage: 'none', // Remove MUI surface elevation overlay
          border: '1px solid transparent',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 0px 15px 0px rgba(0,0,0,0.03), 0px 2px 30px 0px rgba(0,0,0,0.08)',
        },
        outlined: {
          borderColor: '#E4E4E7', // default-200
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'saturate(180%) blur(20px)', // NextUI specific blur style
          borderBottom: '1px solid rgba(17, 24, 28, 0.08)',
          boxShadow: 'none',
          color: '#11181C',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // we will style outlined to look like NextUI filled
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#F4F4F5', // NextUI default-100
            transition: 'background-color 0.25s',
            '& fieldset': {
              borderColor: 'transparent', // Hide border by default
              borderWidth: '2px', // Prepare 2px border for focus
              transition: 'border-color 0.25s',
            },
            '&:hover': {
              backgroundColor: '#E4E4E7', // default-200
            },
            '&:hover fieldset': {
              borderColor: 'transparent',
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              '& fieldset': {
                borderColor: '#101113', // Primary color border
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: '#687076',
            '&.Mui-focused': {
              color: '#101113',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // NextUI uses smaller radii for chips
          fontWeight: 500,
          border: 'none',
        },
        outlined: {
          border: '1px solid #E4E4E7',
        },
        filled: {
          backgroundColor: '#F4F4F5',
          color: '#11181C',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          boxShadow: '0px 10px 40px -10px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepIcon-root.Mui-active': {
            color: '#101113',
          },
          '& .MuiStepIcon-root.Mui-completed': {
            color: '#101113',
          },
        },
      },
    },
  },
});

export default theme;
