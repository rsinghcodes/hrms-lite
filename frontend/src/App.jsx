import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';

function AppRoutes() {
    const location = useLocation();
    return (
        <Layout path={location.pathname}>
            <Routes>
                <Route path="/" element={<Employees />} />
                <Route path="/attendance" element={<Attendance />} />
            </Routes>
        </Layout>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}
