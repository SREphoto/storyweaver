import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill Buffer for browser if strictly needed, but try without first
// import { Buffer } from 'buffer';
// if (typeof window !== 'undefined') {
//   if (!window.Buffer) window.Buffer = Buffer;
//   if (!window.process) window.process = { env: {} } as any;
// }

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);