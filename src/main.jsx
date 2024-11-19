import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';  // Bu qatorni qayta faollashtiramiz
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import store from './redux/store';
import './index.css';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>  {/* Redux store'ni ilova bo'ylab ulash uchun */}
    <Router>
      <App />
    </Router>
  </Provider>
);
