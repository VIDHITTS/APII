import { useState, useEffect } from "react";
import { api } from "../services/api";

function Dashboard() {
    const [stats, setStats] = useState({ logs: null, queue: null });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const loadStats = async () => {
        try {
            const [logs, queue] = await Promise.all([
                api.logs.getStats(),
                api.queue.getStats(),
            ]);
            setStats({ logs, queue });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const handleSync = async (type) => {
        setSyncing(true);
        try {
            if (type === "pull") {
                await api.sync.pullAll();
            } else {
                await api.sync.pushAll();
            }
            await loadStats();
        } catch (err) {
            alert(err.message);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h2>Dashboard</h2>
                <div className="actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => handleSync("pull")}
                        disabled={syncing}
                    >
                        {syncing ? "Syncing..." : "↓ Pull from HubSpot"}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleSync("push")}
                        disabled={syncing}
                    >
                        {syncing ? "Syncing..." : "↑ Push to HubSpot"}
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="label">Total Syncs</div>
                    <div className="value">{stats.logs?.total || 0}</div>
                </div>
                <div className="stat-card success">
                    <div className="label">Successful</div>
                    <div className="value">{stats.logs?.success || 0}</div>
                </div>
                <div className="stat-card error">
                    <div className="label">Failed</div>
                    <div className="value">{stats.logs?.failed || 0}</div>
                </div>
                <div className="stat-card warning">
                    <div className="label">Queue Failed</div>
                    <div className="value">{stats.queue?.failed || 0}</div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="label">Queue Waiting</div>
                    <div className="value">{stats.queue?.waiting || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="label">Queue Active</div>
                    <div className="value">{stats.queue?.active || 0}</div>
                </div>
                <div className="stat-card success">
                    <div className="label">Queue Completed</div>
                    <div className="value">{stats.queue?.completed || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="label">Inbound Syncs</div>
                    <div className="value">{stats.logs?.inbound || 0}</div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
