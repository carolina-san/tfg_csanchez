import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Header from "./components/ui/header/Header";
import LoadingSpinner from "./components/ui/spinner/LoadingSpinner";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import './App.css';

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Datos = lazy(() => import("./pages/Datos"));

function AppContent() {
  return (
    <div className="flex flex-col h-full w-full">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-acento-azul focus:font-semibold">
        Saltar al contenido principal
      </a>
      <Header />
      <main id="main-content" className="flex-1 min-h-0 w-full relative" aria-label="Contenido principal">
        <ErrorBoundary
          fallbackTitle="Error al cargar la página"
          fallbackMessage="Se ha producido un error inesperado al cargar el contenido. Puedes intentar recargar la página."
        >
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/datos" element={<Datos />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary
      fallbackTitle="Error crítico de la aplicación"
      fallbackMessage="La aplicación ha encontrado un problema grave. Prueba a recargar la página."
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}