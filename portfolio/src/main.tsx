import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/chrome.css';
import './styles/home.css';
import './styles/pages.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<BrowserRouter><App /></BrowserRouter>);
