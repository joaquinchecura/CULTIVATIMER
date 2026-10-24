import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Outlet } from 'react-router-dom';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const DefaultUnauthenticated = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
    <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg border border-slate-100 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Inicia sesión para continuar</h1>
      <p className="text-slate-600 mb-6">Necesitás una cuenta para usar Cultiva Timer.</p>
      <SignInButton mode="modal">
        <button className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors">
          Iniciar sesión
        </button>
      </SignInButton>
    </div>
  </div>
);

export default function ProtectedRoute({
  fallback = <DefaultFallback />,
  unauthenticatedElement = <DefaultUnauthenticated />,
}) {
  return (
    <>
      <SignedIn>
        <Outlet />
      </SignedIn>
      <SignedOut>
        {unauthenticatedElement}
      </SignedOut>
    </>
  );
}
