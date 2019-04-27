import { createMuiTheme } from '@material-ui/core/styles';

export const theme =
  localStorage.theme == 'dark'
    ? createMuiTheme({
        palette: {
          type: 'dark',
          primary: { main: '#af27ff' },
          secondary: { main: '#5972ff' }
        }
      })
    : createMuiTheme({
        palette: {
          type: 'light',
          primary: { main: '#6a1b9a' },
          secondary: { main: '#3f51b5' }
        }
      });
