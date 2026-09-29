/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// CAMBIO 1: Añadi useEffect a las importaciones
import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { LoyaltySection } from './components/LoyaltySection';
import { FavoritesView } from './components/FavoritesView';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { NotificationToast } from './components/NotificationToast';
import { Footer } from './components/Footer';

// CAMBIO 2: Declara el SDK global para que TypeScript no marque error
declare global {
  interface Window {
    SalesforceInteractions: any;
  }
}

const MainLayout: React.FC = () => {
  const { activeTab } = useStore();

  // CAMBIO 3: Inicialización del SDK, justo aquí, antes del return
  useEffect(() => {
    // Verifique que el SDK se haya cargado desde el CDN en el index.html
    if (window.SalesforceInteractions) {
      
      window.SalesforceInteractions.init({
        cookieDomain: 'tienda.pamelamilian.com', 
      })
      .then(() => {
        console.log('Data Cloud Web SDK inicializado correctamente.');
        // Opcional: activa los logs para ver los eventos en la consola del navegador
        // window.SalesforceInteractions.setLoggingLevel(4);
      })
      .catch((error: any) => {
        console.error(' Error al inicializar el Data Cloud Web SDK:', error);
      });

    } else {
      console.warn('El script del Data Cloud Web SDK no se ha cargado. Revisa tu index.html');
    }
  }, []); // El array vacío asegura que solo se ejecute una vez

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F7] text-stone-900 font-sans selection:bg-[#006241] selection:text-white">
      {/* Primary Sticky Navigation with Live Branch / Delivery Selector & Role Switch */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'menu' && (
          <>
            <HeroBanner />
            <ProductCatalog />
          </>
        )}

        {activeTab === 'rewards' && <LoyaltySection />}

        {activeTab === 'favorites' && <FavoritesView />}

        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Dialogs, Drawers & Portals */}
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackerModal />
      <AuthModal />
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}