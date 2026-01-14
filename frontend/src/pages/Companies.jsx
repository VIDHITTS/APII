import { useState, useEffect } from "react";
import { api } from "../services/api";

function Companies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [form, setForm] = useState({
        name: "",
        domain: "",
        industry: "",
        phone: "",
        address: "",
    });

    const loadCompanies = async () => {
        try {
            const data = await api.companies.getAll();
            setCompanies(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    const openModal = (company = null) => {
        if (company) {
            setEditingCompany(company);
            setForm({
                name: company.name || "",
                domain: company.domain || "",
                industry: company.industry || "",
                phone: company.phone || "",
                address: company.address || "",
            });
        } else {
            setEditingCompany(null);
            setForm({ name: "", domain: "", industry: "", phone: "", address: "" });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCompany) {
                await api.companies.update(editingCompany._id, form);
            } else {
                await api.companies.create(form);
            }
            setShowModal(false);
            loadCompanies();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this company?")) {
            await api.companies.delete(id);
            loadCompanies();
        }
    };

    const handleSync = async (id) => {
        try {
            await api.sync.syncCompany(id);
            loadCompanies();
        } catch (err) {
            alert(err.message);
        }
    };

    const getStatusBadge = (status) => {
        const s = (status || "new").toLowerCase();
        return <span className={`badge ${s}`}>{status || "NEW"}</span>;
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
                <h2>Companies</h2>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Add Company
                </button>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Domain</th>
                            <th>Industry</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="empty-state">
                                    No companies found
                                </td>
                            </tr>
                        ) : (
                            companies.map((company) => (
                                <tr key={company._id}>
                                    <td>{company.name}</td>
                                    <td>{company.domain || "-"}</td>
                                    <td>{company.industry || "-"}</td>
                                    <td>{getStatusBadge(company.syncStatus)}</td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleSync(company._id)}
                                            >
                                                Sync
                                            </button>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => openModal(company)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(company._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingCompany ? "Edit Company" : "Add Company"}</h3>
                            <button className="icon-btn" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Domain</label>
                                    <input
                                        type="text"
                                        value={form.domain}
                                        onChange={(e) => setForm({ ...form, domain: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Industry</label>
                                    <input
                                        type="text"
                                        value={form.industry}
                                        onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCompany ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Companies;
