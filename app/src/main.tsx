import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from '@heroui/react';
import App from './App';

import "./styles/globals.css";
import ModpackConfigProvider from './components/ModpackConfigProvider';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ModpackConfigProvider>
        <App />
      </ModpackConfigProvider>
    </HeroUIProvider>
  </React.StrictMode>,
);
