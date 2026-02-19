import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
    {
        label: 'Main Menu',
        items: [
            { to: '/', icon: '👥', label: 'Employees' },
            { to: '/attendance', icon: '📅', label: 'Attendance' },
        ],
    },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">🏢</div>
                <div className="sidebar-brand-text">
                    <h1>HRMS Lite</h1>
                    <span>HR Management System</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div key={section.label}>
                        <p className="nav-label">{section.label}</p>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <p>Admin Panel · v1.0.0</p>
            </div>
        </aside>
    );
}
