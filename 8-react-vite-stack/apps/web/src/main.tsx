import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { clerkPublishableKey, isClerkConfigured } from '@/lib/clerk-config.js';
import { ClerkAuthBridge, DevAuthRoot } from '@/auth/app-auth-context.js';
import { DevModeBanner } from '@/components/DevModeBanner.js';
import App from './App.js';
import './index.css';

const key = clerkPublishableKey();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      {isClerkConfigured() && key ? (
        <ClerkProvider publishableKey={key}>
          <ClerkAuthBridge>
            <BrowserRouter>
              <DevModeBanner />
              <App />
            </BrowserRouter>
          </ClerkAuthBridge>
        </ClerkProvider>
      ) : (
        <DevAuthRoot>
          <BrowserRouter>
            <DevModeBanner />
            <App />
          </BrowserRouter>
        </DevAuthRoot>
      )}
    </HelmetProvider>
  </StrictMode>
);
