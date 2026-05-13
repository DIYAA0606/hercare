import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="689723317236-9931dgcn1efqabomct36e3amn3288cgu.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
)