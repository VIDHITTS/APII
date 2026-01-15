import { useState, useEffect } from "react";
import { api } from "../services/api";
import { ScrollText, ArrowRight, ArrowLeft, Filter } from "lucide-react";

function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("recent"); // "recent" or "all"

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const limit = filter === "recent" ? 50 : 1000;
                const data = await api.logs.getAll(limit);
                setLogs(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, [filter]);

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    return (
        <div>
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <ScrollText color="var(--color-primary)" />
                        System Logs
                    </h2>
                    <p style={{ color: "var(--color-text-muted)" }}>Recent synchronization events</p>
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-main)",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        outline: "none",
                        width: "auto"
                    }}
                >
                    <option value="recent">Recent 50</option>
                    <option value="all">All Logs</option>
                </select>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Direction</th>
                            <th>Entity</th>
                            <th>Action</th>
                            <th>Status</th>
                            <th>Duration</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: "13px" }}>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                                    No logs found
                                </td>
                            </tr>
                        ) : logs.map((log) => (
                            <tr key={log._id}>
                                <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        {log.direction === "INBOUND" ? (
                                            <ArrowRight size={14} color="var(--color-warning)" />
                                        ) : (
                                            <ArrowLeft size={14} color="var(--color-primary)" />
                                        )}
                                        <span style={{ fontWeight: "600", fontSize: "11px", color: "var(--color-text-muted)" }}>
                                            {log.direction}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ textTransform: "capitalize" }}>{log.entityType}</td>
                                <td>{log.action}</td>
                                <td>
                                    {(() => {
                                        const statusColors = {
                                            SUCCESS: "var(--accent)",
                                            FAILED: "var(--danger)",
                                            PENDING: "var(--warning)"
                                        };
                                        const color = statusColors[log.status] || "var(--text-secondary)";
                                        return (
                                            <span style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                fontWeight: "500",
                                                color: "var(--text-main)",
                                                fontSize: "13px"
                                            }}>
                                                <span style={{
                                                    width: "8px",
                                                    height: "8px",
                                                    borderRadius: "50%",
                                                    backgroundColor: color,
                                                    boxShadow: `0 0 8px ${color}`
                                                }}></span>
                                                {log.status === "SUCCESS" ? "Success" :
                                                    log.status === "FAILED" ? "Failed" :
                                                        log.status === "PENDING" ? "Pending" : log.status}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td style={{ fontFamily: "monospace", color: "var(--color-text-muted)" }}>
                                    {log.duration}ms
                                </td>
                                <td style={{ color: "var(--color-text-muted)" }}>
                                    {new Date(log.createdAt).toLocaleTimeString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Logs;

