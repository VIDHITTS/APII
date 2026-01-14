import { useState, useEffect } from "react";
import { api } from "../services/api";

function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadLogs = async () => {
        try {
            const data = await api.logs.getAll();
            setLogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const getStatusBadge = (status) => {
        const s = status === "SUCCESS" ? "synced" : "failed";
        return <span className={`badge ${s}`}>{status}</span>;
    };

    const getDirectionIcon = (direction) => {
        return direction === "INBOUND" ? "↓" : "↑";
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
                <h2>Sync Logs</h2>
                <button className="btn btn-secondary" onClick={loadLogs}>
                    Refresh
                </button>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Direction</th>
                            <th>Type</th>
                            <th>Action</th>
                            <th>Status</th>
                            <th>Duration</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-state">
                                    No sync logs yet
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id}>
                                    <td>
                                        <span style={{ fontSize: "18px" }}>
                                            {getDirectionIcon(log.direction)}
                                        </span>{" "}
                                        {log.direction}
                                    </td>
                                    <td>{log.entityType}</td>
                                    <td>{log.action}</td>
                                    <td>{getStatusBadge(log.status)}</td>
                                    <td>{log.duration ? `${log.duration}ms` : "-"}</td>
                                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Logs;
