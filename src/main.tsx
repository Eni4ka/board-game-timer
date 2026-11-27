import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initBanner } from './utils/ads'
import { t, lang } from './i18n'

initBanner()
document.documentElement.lang = lang.startsWith('ru') ? 'ru' : 'en'
document.title = t('appTitle')



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
