import { createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
  palette: {
    type: localStorage.theme,
    primary: { main: '#6a1b9a' },
    secondary: { main: '#3f51b5' }
  }
});
