import React from 'react';
import { Coffee, MapPin, Phone, Mail, Truck, Zap, Sparkles, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { cmsConfig, setActiveTab, setAdminTab } = useStore();

  return (
    <footer className="bg-[#1E3932] text-white border-t border-emerald-950 mt-16 w-full">
      {/* Cintillo Banner */}
      <div className="w-full bg-[#004d33] border-b border-emerald-800/80 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-3 text-xs sm:text-sm font-bold text-emerald-100 tracking-wide text-center">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Delivery a todo el país</span>
          </div>
          <span className="hidden sm:inline text-emerald-600 font-normal">•</span>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Retiro express sin fila</span>
          </div>
          <span className="hidden sm:inline text-emerald-600 font-normal">•</span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Envío gratis desde $10 USD</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Well-aligned 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-12 items-start">
          {/* Column 1: Brand Info & Payment Logos */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
                style={{ backgroundColor: cmsConfig.primaryColor }}
              >
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg font-display tracking-tight">
                {cmsConfig.brandName}
              </span>
            </div>
            <p className="text-xs text-emerald-100/75 leading-relaxed max-w-sm">
              {cmsConfig.tagline}
            </p>

            {/* Payment Icons: Visa, Mastercard, Bitcoin, Amex, Paypal, Stripe (same size) */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold text-emerald-300/90 block uppercase tracking-wider">
                Métodos de Pago Aceptados
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {/* Visa */}
                <div
                  className="w-12 h-7 bg-white rounded flex items-center justify-center p-1 shadow-xs shrink-0"
                  title="Visa"
                >
                  <svg viewBox="0 0 36 12" className="h-3.5 w-auto" fill="none">
                    <path d="M14.5 1.5L12.3 11H9.8L11.9 1.5H14.5Z" fill="#1A1F71" />
                    <path
                      d="M23.1 1.7C22.6 1.5 21.8 1.3 20.8 1.3C18.2 1.3 16.4 2.6 16.4 4.5C16.4 5.9 17.7 6.7 18.7 7.2C19.7 7.7 20 8 20 8.5C20 9.2 19.1 9.5 18.3 9.5C17.2 9.5 16.5 9.3 15.6 8.9L15.2 8.7L14.8 10.7C15.5 11 16.8 11.2 18.1 11.2C20.9 11.2 22.7 9.9 22.7 7.9C22.7 6.3 21.6 5.5 20.4 4.9C19.5 4.5 18.9 4.2 18.9 3.6C18.9 3.1 19.5 2.6 20.6 2.6C21.5 2.6 22.2 2.8 22.7 3L23.1 1.7Z"
                      fill="#1A1F71"
                    />
                    <path
                      d="M26.4 7.6L27.4 2.8C27.4 2.8 27.8 1.5 26.2 1.5H24.1C23.6 1.5 23.2 1.8 23 2.2L19.6 11H22.2L22.7 9.5H25.9L26.2 11H28.5L26.4 7.6ZM23.4 7.6L24.7 3.8L25.4 7.6H23.4Z"
                      fill="#1A1F71"
                    />
                    <path
                      d="M8.5 1.5L5.9 8.2L5.6 6.8C5.2 5.3 3.9 3.6 2.4 2.8L4.6 11H7.3L11.3 1.5H8.5Z"
                      fill="#1A1F71"
                    />
                    <path
                      d="M3.7 1.5H0.1L0 1.7C2.9 2.4 5.2 4.3 6 6.8L5.2 2.4C5 1.7 4.4 1.5 3.7 1.5Z"
                      fill="#FAA61A"
                    />
                  </svg>
                </div>

                {/* Mastercard */}
                <div
                  className="w-12 h-7 bg-white rounded flex items-center justify-center p-1 shadow-xs shrink-0"
                  title="Mastercard"
                >
                  <svg viewBox="0 0 32 20" className="h-4.5 w-auto">
                    <circle cx="11" cy="10" r="8" fill="#EB001B" />
                    <circle cx="21" cy="10" r="8" fill="#F79E1B" fillOpacity="0.9" />
                    <path
                      d="M16 4.3a7.97 7.97 0 0 0-3 5.7 7.97 7.97 0 0 0 3 5.7 7.97 7.97 0 0 0 3-5.7 7.97 7.97 0 0 0-3-5.7z"
                      fill="#FF5F00"
                    />
                  </svg>
                </div>

                {/* Bitcoin */}
                <div
                  className="w-12 h-7 bg-white rounded flex items-center justify-center p-1 shadow-xs shrink-0"
                  title="Bitcoin"
                >
                  <svg viewBox="0 0 24 24" className="h-4.5 w-auto">
                    <circle cx="12" cy="12" r="11" fill="#F7931A" />
                    <path
                      d="M16.662 10.22c.24-1.61-.986-2.476-2.665-3.053l.544-2.183-1.328-.33-.53 2.126c-.35-.087-.71-.17-1.07-.25l.534-2.14-1.328-.332-.544 2.181c-.288-.066-.57-.13-.842-.198l.001-.006-1.832-.457-.354 1.42s.986.226.965.24c.538.134.636.49.62.772l-.622 2.493c.037.01.085.024.138.046l-.142-.035-.87 3.49c-.066.163-.233.407-.61.314.013.018-.966-.24-.966-.24l-.66 1.523 1.728.431c.322.08.638.164.95.244l-.55 2.213 1.327.331.545-2.184c.363.098.715.19 1.058.277l-.543 2.174 1.33.332.55-2.203c2.268.43 3.974.256 4.692-1.796.58-1.652-.03-2.606-1.222-3.228.87-.2 1.524-.773 1.7-1.956zm-3.04 4.27c-.412 1.654-3.197.76-4.1.535l.732-2.934c.903.225 3.793.67 3.368 2.399zm.414-4.305c-.376 1.506-2.698.74-3.45.553l.663-2.66c.753.187 3.178.536 2.787 2.107z"
                      fill="#FFF"
                    />
                  </svg>
                </div>

                {/* Amex */}
                <div
                  className="w-12 h-7 bg-white rounded flex items-center justify-center p-1 shadow-xs shrink-0"
                  title="American Express"
                >
                  <svg viewBox="0 0 32 20" className="h-4.5 w-auto">
                    <rect width="32" height="20" rx="2" fill="#006FCF" />
                    <text
                      x="16"
                      y="13.5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="6.5"
                      fontWeight="900"
                      fontFamily="sans-serif"
                      letterSpacing="0.8"
                    >
                      AMEX
                    </text>
                  </svg>
                </div>

                {/* PayPal */}
                <div
                  className="w-12 h-7 bg-white rounded flex items-center justify-center p-1 shadow-xs shrink-0"
                  title="PayPal"
                >
                  <svg viewBox="0 0 28 20" className="h-4 w-auto">
                    <path
                      d="M9.5 3h6.2c3 0 5.1 1.6 4.5 4.5-.5 2.6-2.5 4.2-5.3 4.2h-2l-1.1 5.3H8.3l2.8-14H9.5z"
                      fill="#003087"
                    />
                    <path
                      d="M12.5 7.2h5.5c2.6 0 4.4 1.4 3.9 3.9-.5 2.5-2.2 4-4.7 4h-1.8l-1 4.9H11.5l2.4-12.8h-1.4z"
                      fill="#0079C1"
                      fillOpacity="0.85"
                    />
                  </svg>
                </div>

                {/* Stripe */}
                <div
                  className="w-12 h-7 bg-white rounded flex items-center justify-center p-1 shadow-xs shrink-0"
                  title="Stripe"
                >
                  <svg viewBox="0 0 36 16" className="h-3.5 w-auto" fill="#635BFF">
                    <path d="M35.6 8.3c0-3-2.1-5.3-5.2-5.3-3.2 0-5.3 2.4-5.3 5.4 0 3.6 2.5 5.3 5.5 5.3 1.5 0 2.8-.4 3.7-1l-.5-1.9c-.8.5-1.8.8-2.9.8-1.5 0-2.8-.6-3-2.3h7.7v-1zm-7.7-.8c.1-1.3.9-2.2 2.3-2.2 1.3 0 2.2.9 2.2 2.2h-4.5zm-5.8-2.6h-2.9l-.1 1.2c-.6-.9-1.6-1.5-2.9-1.5-2.2 0-4.3 1.8-4.3 4.5 0 2.9 2 4.6 4.3 4.6 1.2 0 2.2-.6 2.8-1.4v1.2h2.9V4.9zm-4.7 7c-1.3 0-2.4-1.1-2.4-2.5 0-1.5 1.1-2.5 2.4-2.5 1.3 0 2.4 1 2.4 2.5 0 1.4-1.1 2.5-2.4 2.5zm-8.3-9.5c-.8 0-1.5.3-2 .8l-.1-.7H4.3v13.6h2.8v-4.1c.5.4 1.2.7 2 .7 2.1 0 4.1-1.8 4.1-4.5 0-2.8-2-4.8-4.1-4.8zm-.6 7.4c-1.3 0-2.3-1.1-2.3-2.6 0-1.4 1-2.5 2.3-2.5 1.3 0 2.3 1.1 2.3 2.5 0 1.5-1 2.6-2.3 2.6zM3.4 3.8L.5 3.3.4 4.5l1.8.4c1.5.3 1.9.9 1.9 1.7 0 1.2-1 1.8-2.4 1.8-.9 0-1.8-.3-2.4-.7l-.4 1.3c.7.4 1.8.7 2.9.7 2.6 0 4.3-1.2 4.3-3.3 0-1.8-1.2-2.7-3.1-3.1z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Explorar Tienda */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-300">
              Explorar Tienda
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>☕</span>
                  <span>Menú Completo de Bebidas</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>⭐</span>
                  <span>Programa Starbucks Rewards</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>❤️</span>
                  <span>Tus Favoritos Guardados</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('supabase');
                  }}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-semibold text-emerald-300"
                >
                  <span>🗄️</span>
                  <span>Base de Datos Supabase (Script SQL)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('pentesting');
                  }}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>🛡️</span>
                  <span>Auditoría Pentesting & DevSecOps</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminTab('cms');
                  }}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>🎨</span>
                  <span>Panel CMS y Colores</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Sucursal Única y Atención */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-300">
              Sucursal y Atención
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Paseo de la Reforma 222, Juárez, Cuauhtémoc, CDMX</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Lunes a Domingo: 6:30 AM - 10:30 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+52 55 4920 1184</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>soporte@starbucks-demo.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} {cmsConfig.brandName}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setActiveTab('admin');
                setAdminTab('docs');
              }}
              className="hover:text-white underline cursor-pointer"
            >
              Documentación de Despliegue
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              Desarrollado con React 19, NestJS/Node y Framer Motion
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
