import React from 'react';
import { Sparkles, ArrowRight, Truck, Store, Clock, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';

export const HeroBanner: React.FC = () => {
  const { cmsConfig, deliveryType, setDeliveryType, user, setActiveTab } = useStore();

  return (
    <div className="relative overflow-hidden bg-[#1E3932] text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 shadow-inner">
      {/* Subtle organic background glow */}
      <div
        className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: cmsConfig.primaryColor }}
      />
      <div
        className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ backgroundColor: cmsConfig.goldColor }}
      />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column Text */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-950/60 border border-emerald-600/40 text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{cmsConfig.heroBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display leading-[1.15] text-balance">
            {cmsConfig.heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/85 max-w-2xl leading-relaxed">
            {cmsConfig.heroSubtitle}
          </p>

          {/* Delivery & Pick up quick toggle widget */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex p-1 bg-black/30 rounded-xl backdrop-blur-xs border border-white/10">
              <button
                id="hero-delivery-btn"
                disabled={!cmsConfig.isDeliveryOpen}
                onClick={() => {
                  if (cmsConfig.isDeliveryOpen) {
                    setDeliveryType('delivery');
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  !cmsConfig.isDeliveryOpen
                    ? 'opacity-50 cursor-not-allowed text-stone-400'
                    : deliveryType === 'delivery'
                    ? 'bg-[#006241] text-white shadow-sm cursor-pointer'
                    : 'text-stone-300 hover:text-white cursor-pointer'
                }`}
                title={!cmsConfig.isDeliveryOpen ? 'Delivery cerrado temporalmente' : 'Entrega a Domicilio'}
              >
                <Truck className="w-4 h-4" />
                <span>Entrega a Domicilio {!cmsConfig.isDeliveryOpen && '(Cerrado)'}</span>
              </button>
              <button
                id="hero-pickup-btn"
                onClick={() => setDeliveryType('pickup')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  deliveryType === 'pickup'
                    ? 'bg-[#006241] text-white shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Retiro en Tienda</span>
              </button>
            </div>

            {!cmsConfig.isDeliveryOpen && (
              <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-3 py-1 rounded-lg">
                ⚠️ Delivery temporalmente cerrado. Solo disponible Pick-up.
              </span>
            )}

            <button
              id="hero-rewards-cta"
              onClick={() => setActiveTab('rewards')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-stone-950 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
              style={{ backgroundColor: cmsConfig.goldColor }}
            >
              <Award className="w-4 h-4" />
              <span>Ver mis {user.stars} Estrellas</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {/* Value props */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Entrega 25-35 min</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>10★ por cada $1</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Arábica</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column Visual Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-5 relative"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 group aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
            <img
              src={cmsConfig.heroImageUrl}
              alt="Cafetería y barista preparando café artesanal"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Floating badge */}
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Suscripción Recurrente
                  </p>
                  <p className="text-sm font-semibold">
                    10% OFF en pedidos semanales programados
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ backgroundColor: cmsConfig.primaryColor }}
                >
                  -10%
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
