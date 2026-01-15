const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "API request failed");
    }
    return response.json();
};

export const api = {
    contacts: {
        getAll: () => fetch(`${API_URL}/contacts`).then(handleResponse),
        getById: (id) => fetch(`${API_URL}/contacts/${id}`).then(handleResponse),
        create: (data) =>
            fetch(`${API_URL}/contacts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then(handleResponse),
        update: (id, data) =>
            fetch(`${API_URL}/contacts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then(handleResponse),
        delete: (id) =>
            fetch(`${API_URL}/contacts/${id}`, { method: "DELETE" }).then(handleResponse),
    },

    companies: {
        getAll: () => fetch(`${API_URL}/companies`).then(handleResponse),
        getById: (id) => fetch(`${API_URL}/companies/${id}`).then(handleResponse),
        create: (data) =>
            fetch(`${API_URL}/companies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then(handleResponse),
        update: (id, data) =>
            fetch(`${API_URL}/companies/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then(handleResponse),
        delete: (id) =>
            fetch(`${API_URL}/companies/${id}`, { method: "DELETE" }).then(handleResponse),
    },

    sync: {
        pullAll: () => fetch(`${API_URL}/sync/pull-all`, { method: "POST" }).then(handleResponse),
        pushAll: () => fetch(`${API_URL}/sync/push-all`, { method: "POST" }).then(handleResponse),
        syncContact: (id) =>
            fetch(`${API_URL}/sync/contacts/${id}/to-hubspot`, { method: "POST" }).then(handleResponse),
        syncCompany: (id) =>
            fetch(`${API_URL}/sync/companies/${id}/to-hubspot`, { method: "POST" }).then(handleResponse),
    },

    conflicts: {
        getAll: () => fetch(`${API_URL}/conflicts`).then(handleResponse),
        resolve: (id, data) =>
            fetch(`${API_URL}/conflicts/${id}/resolve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then(handleResponse),
        keepLocal: (id) =>
            fetch(`${API_URL}/conflicts/${id}/keep-local`, { method: "POST" }).then(handleResponse),
        keepRemote: (id) =>
            fetch(`${API_URL}/conflicts/${id}/keep-remote`, { method: "POST" }).then(handleResponse),
        merge: (id, mergedData) =>
            fetch(`${API_URL}/conflicts/${id}/merge`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mergedData }),
            }).then(handleResponse),
    },

    logs: {
        getAll: (limit = 100) => fetch(`${API_URL}/logs?limit=${limit}`).then(handleResponse),
        getStats: () => fetch(`${API_URL}/logs/stats`).then(handleResponse),
    },

    queue: {
        getStats: () => fetch(`${API_URL}/queue/stats`).then(handleResponse),
        getFailed: () => fetch(`${API_URL}/queue/failed`).then(handleResponse),
        clearFailed: () => fetch(`${API_URL}/queue/failed`, { method: "DELETE" }).then(handleResponse),
    },

    health: () => fetch(`${API_URL.replace('/api', '')}/health`).then(handleResponse),
};
