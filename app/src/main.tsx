import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.tsx';
import "./styles/globals.css";
import "./styles/fonts.css"; // Import our custom Minecraft fonts
import ModpackConfigProvider from './components/ModpackConfigProvider.tsx';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ModpackConfigProvider>
      <App />
    </ModpackConfigProvider>
  </React.StrictMode>,
);
