import React, { useState, useRef, useEffect } from 'react';
import {
  Coffee,
  ShoppingBag,
  Heart,
  Bell,
  ShieldCheck,
  Search,
  X,
  ChevronDown,
  LayoutDashboard,
  Palette,
  Award,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';

export const Navbar: React.FC = () => {
  const {
    cmsConfig,
    user,
    cart,
    activeTab,
    setActiveTab,
    adminTab,
    setAdminTab,
    setIsCartOpen,
    setIsAuthModalOpen,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    viewOrderDetails,
    orders,
    switchUserRole,
    searchQuery,
    setSearchQuery
  } = useStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs w-full overflow-x-clip">
      {/* CMS Announcement Top Bar */}
      {cmsConfig.showAnnouncement && (
        <div
          id="announcement-bar"
          className="text-white text-xs sm:text-sm font-medium py-1.5 px-4 text-center transition-colors duration-300"
          style={{ backgroundColor: cmsConfig.primaryColor }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span>{cmsConfig.announcementText}</span>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="brand-home-btn"
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer focus:outline-none shrink-0"
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 border-2 shrink-0"
                style={{ borderColor: cmsConfig.primaryColor, backgroundColor: cmsConfig.creamColor }}
              >
                {cmsConfig.logoUrl ? (
                  <img
                    src={cmsConfig.logoUrl}
                    alt={cmsConfig.brandName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Coffee className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: cmsConfig.primaryColor }} />
                )}
              </div>
              <div className="hidden sm:block">
                <span
                  className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight block leading-tight font-display"
                  style={{ color: cmsConfig.darkColor }}
                >
                  {cmsConfig.brandName}
                </span>
                <span className="text-[10px] sm:text-xs text-stone-500 font-medium tracking-wide">
                  REWARDS & SPECIALTY COFFEE
                </span>
              </div>
            </button>

            {/* Buscador colocado donde antes estaba delivery y pick-up */}
            <div className="flex items-center relative min-w-[130px] sm:min-w-[170px] max-w-[200px] sm:max-w-[240px] md:max-w-[270px] lg:max-w-[310px] ml-1 sm:ml-3">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none shrink-0" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar café, té o pan..."
                className="w-full pl-9 pr-7 py-2 bg-stone-100 hover:bg-stone-100/90 focus:bg-white text-xs sm:text-sm rounded-full border border-stone-200/90 focus:outline-none focus:ring-2 focus:ring-[#006241]/30 transition-all placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-stone-400 hover:text-stone-600 cursor-pointer p-0.5"
                  title="Borrar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            <button
              id="nav-menu-btn"
              onClick={() => setActiveTab('menu')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
                activeTab === 'menu'
                  ? 'text-white'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
              style={activeTab === 'menu' ? { backgroundColor: cmsConfig.primaryColor } : {}}
            >
              Menú
            </button>
            <button
              id="nav-rewards-btn"
              onClick={() => setActiveTab('rewards')}
              className={`flex items-center px-[20px] py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
                activeTab === 'rewards'
                  ? 'text-white'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
              style={activeTab === 'rewards' ? { backgroundColor: cmsConfig.primaryColor } : {}}
            >
              <span>Rewards</span>
            </button>
            <button
              id="nav-favorites-btn"
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
                activeTab === 'favorites'
                  ? 'text-white'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
              style={activeTab === 'favorites' ? { backgroundColor: cmsConfig.primaryColor } : {}}
            >
              <Heart className="w-4 h-4" />
              <span>Favoritos</span>
            </button>
            {/* Admin Menu with Dropdown */}
            <div className="relative" ref={adminDropdownRef}>
              <button
                id="nav-admin-btn"
                onClick={() => {
                  setIsAdminDropdownOpen(!isAdminDropdownOpen);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === 'admin'
                    ? 'bg-[#1E3932] text-white shadow-xs'
                    : 'text-stone-800 hover:text-stone-950 bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200/70'
                }`}
                title="Menú de Administración (CMS, Productos, Pedidos y Métricas)"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Menú Admin</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isAdminDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isAdminDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-stone-100 flex items-center justify-between">
                      <span className="font-extrabold text-[11px] uppercase tracking-wider text-stone-900">
                        Menú de Administración
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Acceso Rápido
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setAdminTab('products');
                          setIsAdminDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-stone-100 text-stone-800 font-semibold cursor-pointer transition-colors ${
                          activeTab === 'admin' && adminTab === 'products' ? 'bg-amber-50 text-amber-950' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                          <Coffee className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-900">Administrador de Productos</div>
                          <div className="text-[10px] text-stone-500 font-normal">Crear, editar, precios, ofertas y fotos</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setAdminTab('cms');
                          setIsAdminDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-stone-100 text-stone-800 font-semibold cursor-pointer transition-colors ${
                          activeTab === 'admin' && adminTab === 'cms' ? 'bg-emerald-50 text-emerald-950' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                          <Palette className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-900">CMS de Marca & Contenido</div>
                          <div className="text-[10px] text-stone-500 font-normal">Logo, banners, textos y delivery</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setAdminTab('dashboard');
                          setIsAdminDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-stone-100 text-stone-800 font-semibold cursor-pointer transition-colors ${
                          activeTab === 'admin' && adminTab === 'dashboard' ? 'bg-blue-50 text-blue-950' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                          <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-900">Dashboard & Reportes</div>
                          <div className="text-[10px] text-stone-500 font-normal">Ventas, métricas y pedidos del día</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setAdminTab('orders');
                          setIsAdminDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-stone-100 text-stone-800 font-semibold cursor-pointer transition-colors ${
                          activeTab === 'admin' && adminTab === 'orders' ? 'bg-purple-50 text-purple-950' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-900">Pedidos en Vivo</div>
                          <div className="text-[10px] text-stone-500 font-normal">Despacho y estado de entregas</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setAdminTab('rewards');
                          setIsAdminDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-stone-100 text-stone-800 font-semibold cursor-pointer transition-colors ${
                          activeTab === 'admin' && adminTab === 'rewards' ? 'bg-amber-50 text-amber-950' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-900">CRUD Puntos & Recompensas</div>
                          <div className="text-[10px] text-stone-500 font-normal">Catálogo de estrellas y canjes</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setAdminTab('supabase');
                          setIsAdminDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-stone-100 text-stone-800 font-semibold cursor-pointer transition-colors ${
                          activeTab === 'admin' && adminTab === 'supabase' ? 'bg-emerald-50 text-emerald-950 font-bold' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                            <span>Base de Datos & SQL</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-600 text-white rounded-full font-bold">Supabase</span>
                          </div>
                          <div className="text-[10px] text-stone-500 font-normal">Script SQL, sincronizar y conectar</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setAdminTab('pentesting');
                          setIsAdminDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-stone-100 text-stone-800 font-semibold cursor-pointer transition-colors ${
                          activeTab === 'admin' && adminTab === 'pentesting' ? 'bg-stone-100 text-stone-950' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-stone-900">Pentesting & DevSecOps</div>
                          <div className="text-[10px] text-stone-500 font-normal">Auditoría OWASP y pruebas</div>
                        </div>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-stone-100 px-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('admin');
                          setIsAdminDropdownOpen(false);
                        }}
                        className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                      >
                        Ver panel completo →
                      </button>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cmsConfig.isDeliveryOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        Delivery: {cmsConfig.isDeliveryOpen ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Quick Demo Role Toggle */}
            <button
              id="role-switch-btn"
              onClick={() => switchUserRole(user.role === 'admin' ? 'customer' : 'admin')}
              title="Alternar entre vista de Cliente y Administrador"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 cursor-pointer transition-colors shrink-0"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: user.role === 'admin' ? '#10B981' : '#F59E0B' }}
              />
              <span>{user.role === 'admin' ? 'Admin' : 'Cliente'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative shrink-0">
              <button
                id="notification-bell-btn"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-stone-700 hover:text-stone-900 rounded-full hover:bg-stone-100 relative cursor-pointer focus:outline-none transition-colors"
                title="Notificaciones push"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-amber-500 text-stone-900 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    id="notifications-popover"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-800" />
                        <span className="font-bold text-sm text-stone-800">Notificaciones en tiempo real</span>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-xs text-stone-500 hover:text-stone-700 cursor-pointer"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-stone-400">
                          No tienes notificaciones pendientes
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationAsRead(n.id);
                              if (n.orderId) {
                                const found = orders.find(o => o.id === n.orderId);
                                if (found) viewOrderDetails(found);
                              }
                            }}
                            className={`p-3.5 text-xs hover:bg-stone-50 cursor-pointer transition-colors ${
                              !n.read ? 'bg-emerald-50/40 font-medium' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <span className="font-bold text-stone-900">{n.title}</span>
                              <span className="text-[10px] text-stone-400 shrink-0">{n.timestamp}</span>
                            </div>
                            <p className="text-stone-600 text-xs leading-relaxed">{n.message}</p>
                            {n.orderId && (
                              <span className="inline-block mt-1 text-[11px] text-[#006241] font-semibold underline">
                                Ver rastreo del pedido #{n.orderId} →
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Account / Auth */}
            <button
              id="user-auth-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-stone-100 text-stone-700 cursor-pointer transition-colors shrink-0"
              title="Mi Cuenta y Perfil"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                style={{ backgroundColor: cmsConfig.primaryColor }}
              >
                {user.name.charAt(0)}
              </div>
              <span className="hidden xl:inline text-xs font-semibold text-stone-800 max-w-[90px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>

            {/* Cart Button: Sin botón verde, solo icono grande sin letras */}
            <button
              id="open-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-stone-800 hover:text-[#006241] hover:bg-stone-100 rounded-full transition-all cursor-pointer active:scale-95 shrink-0 flex items-center justify-center"
              title="Ver Carrito de Compras"
            >
              <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8" />
              {totalCartCount > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 bg-amber-500 text-stone-900 text-[10px] sm:text-[11px] font-extrabold w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center leading-none shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-100">
          <button
            onClick={() => setActiveTab('menu')}
            className={`text-xs font-semibold py-1.5 px-3 rounded-full cursor-pointer ${
              activeTab === 'menu' ? 'bg-[#006241] text-white' : 'text-stone-600'
            }`}
          >
            Menú
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`text-xs font-semibold py-1.5 px-3 rounded-full cursor-pointer ${
              activeTab === 'rewards' ? 'bg-[#006241] text-white' : 'text-stone-600'
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`text-xs font-semibold py-1.5 px-3 rounded-full cursor-pointer ${
              activeTab === 'favorites' ? 'bg-[#006241] text-white' : 'text-stone-600'
            }`}
          >
            Favoritos
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`text-xs font-semibold py-1.5 px-3 rounded-full cursor-pointer ${
              activeTab === 'admin' ? 'bg-stone-900 text-white' : 'text-stone-600'
            }`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};
