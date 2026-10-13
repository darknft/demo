/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
import { ProjectDownloadModal } from './components/ProjectDownloadModal';
import { Footer } from './components/Footer';

// SDK web de Salesforce Data Cloud (el script se carga en index.html)
declare global {
  interface Window {
    SalesforceInteractions: any;
  }
}

const MainLayout: React.FC = () => {
  const { activeTab, user } = useStore();

  // Inicializa el SDK web de Data Cloud una sola vez
  useEffect(() => {
    if (window.SalesforceInteractions) {
      window.SalesforceInteractions.init({
        cookieDomain: 'tienda.pamelamilian.com',
      })
        .then(() => {
          console.log('Data Cloud Web SDK inicializado correctamente.');
        })
        .catch((error: any) => {
          console.error('Error al inicializar el Data Cloud Web SDK:', error);
        });
    } else {
      console.warn('El script del Data Cloud Web SDK no se ha cargado. Revisa tu index.html');
    }
  }, []);

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

        {activeTab === 'admin' && user.role === 'admin' && <AdminDashboard />}
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
      {user.role === 'admin' && <ProjectDownloadModal />}
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
