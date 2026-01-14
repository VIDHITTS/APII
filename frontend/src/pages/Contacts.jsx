import { useState, useEffect } from "react";
import { api } from "../services/api";

function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [form, setForm] = useState({
        email: "",
        firstname: "",
        lastname: "",
        phone: "",
        company: "",
    });

    const loadContacts = async () => {
        try {
            const data = await api.contacts.getAll();
            setContacts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, []);

    const openModal = (contact = null) => {
        if (contact) {
            setEditingContact(contact);
            setForm({
                email: contact.email || "",
                firstname: contact.firstname || "",
                lastname: contact.lastname || "",
                phone: contact.phone || "",
                company: contact.company || "",
            });
        } else {
            setEditingContact(null);
            setForm({ email: "", firstname: "", lastname: "", phone: "", company: "" });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingContact) {
                await api.contacts.update(editingContact._id, form);
            } else {
                await api.contacts.create(form);
            }
            setShowModal(false);
            loadContacts();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this contact?")) {
            await api.contacts.delete(id);
            loadContacts();
        }
    };

    const handleSync = async (id) => {
        try {
            await api.sync.syncContact(id);
            loadContacts();
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
                <h2>Contacts</h2>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    + Add Contact
                </button>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Company</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="empty-state">
                                    No contacts found
                                </td>
                            </tr>
                        ) : (
                            contacts.map((contact) => (
                                <tr key={contact._id}>
                                    <td>
                                        {contact.firstname} {contact.lastname}
                                    </td>
                                    <td>{contact.email}</td>
                                    <td>{contact.company || "-"}</td>
                                    <td>{getStatusBadge(contact.syncStatus)}</td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleSync(contact._id)}
                                            >
                                                Sync
                                            </button>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => openModal(contact)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(contact._id)}
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
                            <h3>{editingContact ? "Edit Contact" : "Add Contact"}</h3>
                            <button className="icon-btn" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={form.firstname}
                                        onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={form.lastname}
                                        onChange={(e) => setForm({ ...form, lastname: e.target.value })}
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
                                    <label>Company</label>
                                    <input
                                        type="text"
                                        value={form.company}
                                        onChange={(e) => setForm({ ...form, company: e.target.value })}
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
                                    {editingContact ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Contacts;
