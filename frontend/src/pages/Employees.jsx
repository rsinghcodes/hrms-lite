import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getEmployees, createEmployee, deleteEmployee } from '../services/api';

// ─── Add Employee Modal ───────────────────────────────────────
function AddEmployeeModal({ onClose, onAdded }) {
    const [form, setForm] = useState({ employee_id: '', full_name: '', email: '', department: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.employee_id.trim()) e.employee_id = 'Employee ID is required.';
        if (!form.full_name.trim()) e.full_name = 'Full name is required.';
        if (!form.email.trim()) e.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
        if (!form.department.trim()) e.department = 'Department is required.';
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v = validate();
        if (Object.keys(v).length) { setErrors(v); return; }
        setLoading(true);
        try {
            await createEmployee(form);
            toast.success('Employee added successfully!');
            onAdded();
            onClose();
        } catch (err) {
            const serverErrors = err.response?.data?.errors || {};
            if (Object.keys(serverErrors).length) {
                const mapped = {};
                Object.entries(serverErrors).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? v.join(' ') : v;
                });
                setErrors(mapped);
            } else {
                toast.error(err.response?.data?.message || 'Failed to add employee.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { name: 'employee_id', label: 'Employee ID', placeholder: 'e.g. EMP-001', type: 'text' },
        { name: 'full_name', label: 'Full Name', placeholder: 'e.g. Jane Smith', type: 'text' },
        { name: 'email', label: 'Email Address', placeholder: 'e.g. jane@company.com', type: 'email' },
        { name: 'department', label: 'Department', placeholder: 'e.g. Engineering', type: 'text' },
    ];

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3>➕ Add New Employee</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {fields.map(f => (
                            <div className="form-group" key={f.name}>
                                <label className="form-label">
                                    {f.label} <span className="required">*</span>
                                </label>
                                <input
                                    className={`form-input${errors[f.name] ? ' error' : ''}`}
                                    name={f.name}
                                    type={f.type}
                                    placeholder={f.placeholder}
                                    value={form[f.name]}
                                    onChange={handleChange}
                                    autoComplete="off"
                                />
                                {errors[f.name] && (
                                    <p className="form-error">⚠ {errors[f.name]}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : '+ Add Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ─────────────────────────────────────
function ConfirmDeleteModal({ employee, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteEmployee(employee.id);
            toast.success(`${employee.full_name} removed.`);
            onDeleted();
            onClose();
        } catch {
            toast.error('Failed to delete employee.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3>Remove Employee</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="confirm-icon">🗑️</div>
                    <p className="confirm-text">
                        Are you sure you want to remove{' '}
                        <span className="confirm-name">{employee.full_name}</span>
                        ? This will also delete all their attendance records. This action cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                        {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Deleting…</> : '🗑 Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Employees Page ───────────────────────────────────────────
export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [toDelete, setToDelete] = useState(null);

    const fetchEmployees = async () => {
        setLoading(true); setError(null);
        try {
            const res = await getEmployees(search ? { search } : {});
            setEmployees(res.data.data);
        } catch {
            setError('Failed to load employees. Make sure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEmployees();
    };

    const departments = [...new Set(employees.map(e => e.department))].sort();

    return (
        <>
            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-card-icon">👥</div>
                    <div className="stat-card-value">{employees.length}</div>
                    <div className="stat-card-label">Total Employees</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">🏢</div>
                    <div className="stat-card-value">{departments.length}</div>
                    <div className="stat-card-label">Departments</div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="error-banner">
                    <p>⚠ {error}</p>
                    <button onClick={fetchEmployees}>Retry</button>
                </div>
            )}

            {/* Main Card */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Employee Directory</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
                            <div className="search-input-wrap">
                                <span className="search-icon">🔍</span>
                                <input
                                    className="search-input"
                                    placeholder="Search name, ID, email…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-ghost btn-sm">Search</button>
                            {search && (
                                <button type="button" className="btn btn-ghost btn-sm"
                                    onClick={() => { setSearch(''); fetchEmployees(); }}>Clear</button>
                            )}
                        </form>
                        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Employee</button>
                    </div>
                </div>

                <div className="card-body table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr className="loading-row">
                                    <td colSpan={6}>
                                        <div className="loading-center">
                                            <span className="spinner spinner-lg" />
                                            Loading employees…
                                        </div>
                                    </td>
                                </tr>
                            ) : employees.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">👤</div>
                                            <h3>{search ? 'No results found' : 'No employees yet'}</h3>
                                            <p>{search
                                                ? `No employees match "${search}". Try a different search term.`
                                                : 'Add your first employee to get started.'}</p>
                                            {!search && (
                                                <button className="btn btn-primary" style={{ marginTop: 8 }}
                                                    onClick={() => setShowAdd(true)}>+ Add Employee</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td className="td-id">{emp.employee_id}</td>
                                        <td className="td-name">{emp.full_name}</td>
                                        <td className="td-email">{emp.email}</td>
                                        <td>
                                            <span className="badge badge-neutral">{emp.department}</span>
                                        </td>
                                        <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                                            {new Date(emp.created_at).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <div className="td-actions">
                                                <button
                                                    className="btn-icon danger"
                                                    title="Delete employee"
                                                    onClick={() => setToDelete(emp)}
                                                >🗑</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAdd && (
                <AddEmployeeModal onClose={() => setShowAdd(false)} onAdded={fetchEmployees} />
            )}
            {toDelete && (
                <ConfirmDeleteModal
                    employee={toDelete}
                    onClose={() => setToDelete(null)}
                    onDeleted={fetchEmployees}
                />
            )}
        </>
    );
}
