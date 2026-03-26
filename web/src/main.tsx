import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
// import { basePath } from './lib/basePath';
import './index.css';



// 从全局变量读取 basename，Nginx 注入时会设置这个值
const basename = (window as any).__CLAW_BASE__ || '/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* basePath is injected by the Rust gateway at serve time for reverse-proxy prefix support. */}
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
