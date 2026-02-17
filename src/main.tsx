import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Prevent unhandled promise rejections from causing blank screens
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason);
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
