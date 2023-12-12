import "@/styles/globals.css";
import { ThemeProvider } from "@material-tailwind/react";
import type { AppProps } from "next/app";
import { CookiesProvider } from 'react-cookie';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <CookiesProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </CookiesProvider>
  );
}
