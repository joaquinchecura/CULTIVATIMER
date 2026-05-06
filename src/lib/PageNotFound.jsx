import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
            <div className="max-w-md w-full text-center space-y-6">
                <h1 className="text-7xl font-light text-slate-300">404</h1>
                <h2 className="text-2xl font-medium text-slate-800">Page Not Found</h2>
                <p className="text-slate-600">
                    The page <span className="font-medium">"{pageName}"</span> could not be found.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
}
