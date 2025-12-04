import React from "react";
import ReactDOM from "react-dom/client";
import { inject } from "@vercel/analytics";
import App from "./App.jsx";
import "./index.css";

// Initialize Vercel Web Analytics
inject();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
