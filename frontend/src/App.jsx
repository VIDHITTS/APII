import { useState, useEffect } from "react";
import "./index.css";
import { api } from "./services/api";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Conflicts from "./pages/Conflicts";
import Logs from "./pages/Logs";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "contacts", label: "Contacts", icon: "👤" },
  { id: "companies", label: "Companies", icon: "🏢" },
  { id: "conflicts", label: "Conflicts", icon: "⚠️" },
  { id: "logs", label: "Sync Logs", icon: "📋" },
];

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.health().then(setHealth).catch(console.error);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "contacts":
        return <Contacts />;
      case "companies":
        return <Companies />;
      case "conflicts":
        return <Conflicts />;
      case "logs":
        return <Logs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>HubSpot Sync</h1>
          <span>
            {health?.mongodb === "connected" ? "🟢 Connected" : "🔴 Disconnected"}
          </span>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
      </aside>
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;
