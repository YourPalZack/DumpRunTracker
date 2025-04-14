import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set title for the application
document.title = "DumpRun - Community-Powered Junk Removal";

createRoot(document.getElementById("root")!).render(<App />);
