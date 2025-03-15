// This is a server component - no 'use client' directive
import React from 'react';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';
import { AnalysisProvider } from '@/contexts/AnalysisContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Network Anomaly Detector',
  description: 'AI-powered network traffic anomaly detection system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AnalysisProvider>
            <ClientLayout>{children}</ClientLayout>
          </AnalysisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
