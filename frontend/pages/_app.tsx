import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { DemoProvider } from "@/lib/demo";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DemoProvider>
          <Component {...pageProps} />
        </DemoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
