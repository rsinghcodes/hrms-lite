import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getEmployees } from '../services/api';
import { getAttendance, markAttendance, updateAttendance } from '../services/api';

const TODAY = new Date().toISOString().split('T')[0];

// ─── Mark Attendance Modal ─────────────────────────────────────
function MarkAttendanceModal({ employees, onClose, onSaved }) {
    const [form, setForm] = useState({ employee: '', date: TODAY, status: 'Present' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.employee) e.employee = 'Please select an employee.';
        if (!form.date) e.date = 'Date is required.';
        if (!form.status) e.status = 'Status is required.';
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
            await markAttendance({ employee: Number(form.employee), date: form.date, status: form.status });
            toast.success('Attendance marked successfully!');
            onSaved();
            onClose();
        } catch (err) {
            const serverErrors = err.response?.data?.errors || {};
            const detail = serverErrors?.detail;
            if (detail) {
                toast.error(Array.isArray(detail) ? detail.join(' ') : detail);
            } else if (Object.keys(serverErrors).length) {
                const mapped = {};
                Object.entries(serverErrors).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? v.join(' ') : v;
                });
                setErrors(mapped);
            } else {
                toast.error('Failed to mark attendance.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3>📅 Mark Attendance</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Employee <span className="required">*</span></label>
                            <select
                                className={`form-select${errors.employee ? ' error' : ''}`}
                                name="employee"
                                value={form.employee}
                                onChange={handleChange}
                            >
                                <option value="">-- Select Employee --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.full_name} ({emp.employee_id})
                                    </option>
                                ))}
                            </select>
                            {errors.employee && <p className="form-error">⚠ {errors.employee}</p>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Date <span className="required">*</span></label>
                                <input
                                    className={`form-input${errors.date ? ' error' : ''}`}
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    max={TODAY}
                                />
                                {errors.date && <p className="form-error">⚠ {errors.date}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status <span className="required">*</span></label>
                                <select
                                    className={`form-select${errors.status ? ' error' : ''}`}
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="Present">✅ Present</option>
                                    <option value="Absent">❌ Absent</option>
                                </select>
                                {errors.status && <p className="form-error">⚠ {errors.status}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : '✔ Mark Attendance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Edit Status Modal ─────────────────────────────────────────
function EditStatusModal({ record, onClose, onSaved }) {
    const [status, setStatus] = useState(record.status);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateAttendance(record.id, { status });
            toast.success('Attendance updated!');
            onSaved();
            onClose();
        } catch {
            toast.error('Failed to update attendance.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3>✏️ Edit Attendance</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <p style={{ marginBottom: 12, fontSize: 14, color: 'var(--color-text-muted)' }}>
                        Editing attendance for <strong>{record.employee_name}</strong> on{' '}
                        <strong>{record.date}</strong>
                    </p>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="Present">✅ Present</option>
                            <option value="Absent">❌ Absent</option>
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                        {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Attendance Page ──────────────────────────────────────────
export default function Attendance() {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [showMark, setShowMark] = useState(false);
    const [editRecord, setEditRecord] = useState(null);

    const fetchAll = async () => {
        setLoading(true); setError(null);
        try {
            const [empRes, attRes] = await Promise.all([
                getEmployees(),
                getAttendance(buildParams()),
            ]);
            setEmployees(empRes.data.data);
            setAttendance(attRes.data.data);
        } catch {
            setError('Failed to load data. Make sure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const buildParams = () => {
        const p = {};
        if (filterEmployee) p.employee = filterEmployee;
        if (filterDate) p.date = filterDate;
        return p;
    };

    useEffect(() => { fetchAll(); }, []);

    const handleFilter = () => {
        (async () => {
            setLoading(true); setError(null);
            try {
                const res = await getAttendance(buildParams());
                setAttendance(res.data.data);
            } catch {
                setError('Failed to apply filters.');
            } finally {
                setLoading(false);
            }
        })();
    };

    const clearFilters = () => {
        setFilterEmployee('');
        setFilterDate('');
        (async () => {
            setLoading(true);
            try {
                const res = await getAttendance({});
                setAttendance(res.data.data);
            } finally { setLoading(false); }
        })();
    };

    const presentCount = attendance.filter(r => r.status === 'Present').length;
    const absentCount = attendance.filter(r => r.status === 'Absent').length;

    return (
        <>
            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-card-icon">📄</div>
                    <div className="stat-card-value">{attendance.length}</div>
                    <div className="stat-card-label">Total Records</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">✅</div>
                    <div className="stat-card-value" style={{ color: '#15803d' }}>{presentCount}</div>
                    <div className="stat-card-label">Present</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon">❌</div>
                    <div className="stat-card-value" style={{ color: '#b91c1c' }}>{absentCount}</div>
                    <div className="stat-card-label">Absent</div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="error-banner">
                    <p>⚠ {error}</p>
                    <button onClick={fetchAll}>Retry</button>
                </div>
            )}

            {/* Main Card */}
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Attendance Records</div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Employee filter */}
                        <select
                            className="filter-select"
                            value={filterEmployee}
                            onChange={e => setFilterEmployee(e.target.value)}
                        >
                            <option value="">All Employees</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>
                                    {e.full_name}
                                </option>
                            ))}
                        </select>

                        {/* Date filter */}
                        <input
                            type="date"
                            className="filter-select"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                            max={TODAY}
                        />

                        <button className="btn btn-ghost btn-sm" onClick={handleFilter}>Filter</button>
                        {(filterEmployee || filterDate) && (
                            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear</button>
                        )}
                        <button className="btn btn-primary" onClick={() => setShowMark(true)}>
                            + Mark Attendance
                        </button>
                    </div>
                </div>

                <div className="card-body table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr className="loading-row">
                                    <td colSpan={6}>
                                        <div className="loading-center">
                                            <span className="spinner spinner-lg" />
                                            Loading attendance…
                                        </div>
                                    </td>
                                </tr>
                            ) : attendance.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">📅</div>
                                            <h3>No attendance records</h3>
                                            <p>
                                                {filterEmployee || filterDate
                                                    ? 'No records match the selected filters.'
                                                    : 'Start by marking attendance for an employee.'}
                                            </p>
                                            {!filterEmployee && !filterDate && (
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ marginTop: 8 }}
                                                    onClick={() => setShowMark(true)}
                                                >+ Mark Attendance</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                attendance.map(record => (
                                    <tr key={record.id}>
                                        <td className="td-id">{record.employee_id_display}</td>
                                        <td className="td-name">{record.employee_name}</td>
                                        <td><span className="badge badge-neutral">{record.department}</span></td>
                                        <td style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                                            {new Date(record.date + 'T00:00:00').toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${record.status.toLowerCase()}`}>
                                                <span className="badge-dot" />
                                                {record.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="td-actions">
                                                <button
                                                    className="btn-icon"
                                                    title="Edit status"
                                                    onClick={() => setEditRecord(record)}
                                                >✏️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showMark && (
                <MarkAttendanceModal
                    employees={employees}
                    onClose={() => setShowMark(false)}
                    onSaved={fetchAll}
                />
            )}
            {editRecord && (
                <EditStatusModal
                    record={editRecord}
                    onClose={() => setEditRecord(null)}
                    onSaved={fetchAll}
                />
            )}
        </>
    );
}
