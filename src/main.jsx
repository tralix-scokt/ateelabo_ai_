import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from "react-router-dom"
import './styles.css'
import { applyTheme, readTheme, THEME_KEY } from './theme'

applyTheme(readTheme());
window.addEventListener('storage', (event) => {
  if (event.key === THEME_KEY || event.key === null) applyTheme(readTheme());
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <BrowserRouter>
  <App />
</BrowserRouter>
  </React.StrictMode>
)
