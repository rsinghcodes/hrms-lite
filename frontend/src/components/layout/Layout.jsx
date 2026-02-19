import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

const routeMeta = {
    '/': { title: 'Employees', sub: 'Manage your workforce' },
    '/attendance': { title: 'Attendance', sub: 'Track daily attendance' },
};

export default function Layout({ children, path }) {
    const meta = routeMeta[path] || { title: 'HRMS Lite', sub: '' };
    return (
        <div className="app-shell">
            <Sidebar />
            <div className="main-content">
                <header className="topbar">
                    <div>
                        <div className="topbar-title">{meta.title}</div>
                        <div className="topbar-sub">{meta.sub}</div>
                    </div>
                    <div className="topbar-right">
                        <div className="avatar">A</div>
                    </div>
                </header>
                <main className="page-content">
                    {children}
                </main>
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3500,
                    style: {
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    },
                }}
            />
        </div>
    );
}
