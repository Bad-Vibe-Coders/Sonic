import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './theme/ThemeContext.jsx'
import { setTokens } from './lib/api'
import { consumeHandoffTokens } from './lib/tenantRedirect'
import './index.css'

// A login on another subdomain hands its tokens to this origin via a one-time
// URL fragment (see lib/tenantRedirect.js) since localStorage can't cross
// origins. Store them before anything reads auth state.
const handoff = consumeHandoffTokens()
if (handoff) setTokens(handoff)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
