import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }

  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides {
    accent: true;
  }
}
