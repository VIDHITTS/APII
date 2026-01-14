import { useState, useEffect } from "react";
import { api } from "../services/api";

function Conflicts() {
    const [conflicts, setConflicts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConflict, setSelectedConflict] = useState(null);
    const [mergeMode, setMergeMode] = useState(false);
    const [mergedData, setMergedData] = useState({});

    const loadConflicts = async () => {
        try {
            const data = await api.conflicts.getAll();
            setConflicts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConflicts();
    }, []);

    const handleResolve = async (conflictId, resolution) => {
        try {
            if (resolution === "local") {
                await api.conflicts.keepLocal(conflictId);
            } else {
                await api.conflicts.keepRemote(conflictId);
            }
            setSelectedConflict(null);
            loadConflicts();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleMerge = async () => {
        try {
            await api.conflicts.merge(selectedConflict._id, mergedData);
            setSelectedConflict(null);
            setMergeMode(false);
            setMergedData({});
            loadConflicts();
        } catch (err) {
            alert(err.message);
        }
    };

    const openMergeMode = (conflict) => {
        setSelectedConflict(conflict);
        setMergeMode(true);
        const initialMerged = {};
        Object.keys(conflict.localSnapshot).forEach((key) => {
            initialMerged[key] = conflict.localSnapshot[key];
        });
        setMergedData(initialMerged);
    };

    const selectField = (field, source) => {
        const value =
            source === "local"
                ? selectedConflict.localSnapshot[field]
                : selectedConflict.remoteSnapshot[field];
        setMergedData({ ...mergedData, [field]: value });
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
                <h2>Conflicts</h2>
            </div>

            {conflicts.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <p>🎉 No conflicts to resolve</p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Entity ID</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {conflicts.map((conflict) => (
                                <tr key={conflict._id}>
                                    <td>{conflict.entityType}</td>
                                    <td>{conflict.localId}</td>
                                    <td>
                                        <span className="badge conflict">{conflict.status}</span>
                                    </td>
                                    <td>{new Date(conflict.detectedAt).toLocaleString()}</td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => setSelectedConflict(conflict)}
                                            >
                                                Quick Resolve
                                            </button>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => openMergeMode(conflict)}
                                            >
                                                Manual Merge
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedConflict && !mergeMode && (
                <div className="modal-overlay" onClick={() => setSelectedConflict(null)}>
                    <div
                        className="modal"
                        style={{ maxWidth: "700px" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Resolve Conflict</h3>
                            <button className="icon-btn" onClick={() => setSelectedConflict(null)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div>
                                    <h4 style={{ marginBottom: "12px", color: "var(--color-primary)" }}>
                                        Local Data
                                    </h4>
                                    <pre
                                        style={{
                                            background: "var(--color-bg)",
                                            padding: "12px",
                                            borderRadius: "var(--radius)",
                                            fontSize: "13px",
                                            overflow: "auto",
                                        }}
                                    >
                                        {JSON.stringify(selectedConflict.localSnapshot, null, 2)}
                                    </pre>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: "12px", color: "var(--color-warning)" }}>
                                        HubSpot Data
                                    </h4>
                                    <pre
                                        style={{
                                            background: "var(--color-bg)",
                                            padding: "12px",
                                            borderRadius: "var(--radius)",
                                            fontSize: "13px",
                                            overflow: "auto",
                                        }}
                                    >
                                        {JSON.stringify(selectedConflict.remoteSnapshot, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setSelectedConflict(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleResolve(selectedConflict._id, "local")}
                            >
                                Keep Local
                            </button>
                            <button
                                className="btn btn-warning"
                                style={{ background: "var(--color-warning)", color: "white" }}
                                onClick={() => handleResolve(selectedConflict._id, "hubspot")}
                            >
                                Keep HubSpot
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedConflict && mergeMode && (
                <div className="modal-overlay" onClick={() => setMergeMode(false)}>
                    <div
                        className="modal"
                        style={{ maxWidth: "800px" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h3>Manual Merge - Pick Fields</h3>
                            <button
                                className="icon-btn"
                                onClick={() => {
                                    setMergeMode(false);
                                    setSelectedConflict(null);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: "16px", color: "var(--color-text-muted)" }}>
                                Select which version to keep for each field
                            </p>
                            <table className="table" style={{ marginBottom: 0 }}>
                                <thead>
                                    <tr>
                                        <th>Field</th>
                                        <th>Local Value</th>
                                        <th>HubSpot Value</th>
                                        <th>Selected</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(selectedConflict.localSnapshot).map((field) => {
                                        const localVal = selectedConflict.localSnapshot[field];
                                        const remoteVal = selectedConflict.remoteSnapshot[field];
                                        const isDifferent = localVal !== remoteVal;

                                        return (
                                            <tr key={field} style={{ background: isDifferent ? "#fef3c7" : "" }}>
                                                <td>
                                                    <strong>{field}</strong>
                                                </td>
                                                <td>
                                                    <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <input
                                                            type="radio"
                                                            name={field}
                                                            checked={mergedData[field] === localVal}
                                                            onChange={() => selectField(field, "local")}
                                                        />
                                                        <span>{String(localVal) || "(empty)"}</span>
                                                    </label>
                                                </td>
                                                <td>
                                                    <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <input
                                                            type="radio"
                                                            name={field}
                                                            checked={mergedData[field] === remoteVal}
                                                            onChange={() => selectField(field, "remote")}
                                                        />
                                                        <span>{String(remoteVal) || "(empty)"}</span>
                                                    </label>
                                                </td>
                                                <td>
                                                    <span className="badge synced">{String(mergedData[field])}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setMergeMode(false);
                                    setSelectedConflict(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleMerge}>
                                Apply Merge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Conflicts;
