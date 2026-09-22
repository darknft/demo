import React from 'react';
import {
  Award,
  Sparkles,
  Gift,
  CheckCircle2,
  Lock,
  ArrowRight,
  QrCode,
  Flame,
  Sun,
  Leaf,
  CakeSlice
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { RewardItem } from '../types';

export const LoyaltySection: React.FC = () => {
  const { user, rewards, redeemReward, claimBadge, cmsConfig } = useStore();

  const tierDetails = {
    green: {
      name: 'Nivel Verde',
      color: '#006241',
      bg: 'from-[#006241] to-[#1E3932]',
      nextTier: 'Nivel Dorado',
      targetStars: 300,
      perks: ['Recarga gratis de café del día', 'Bebida de cortesía en tu cumpleaños', 'Ofertas exclusivas en la app']
    },
    gold: {
      name: 'Nivel Dorado Gold',
      color: '#CBA258',
      bg: 'from-[#CBA258] to-[#96742E]',
      nextTier: 'Nivel Reserva VIP',
      targetStars: 1000,
      perks: ['Doble puntuación en Star Days', 'Shot extra de espresso gratis en cualquier bebida', 'Acceso anticipado a colecciones exclusivas']
    },
    reserve: {
      name: 'Nivel Reserva VIP',
      color: '#1E3932',
      bg: 'from-[#1E3932] to-[#0A1612]',
      nextTier: 'Máximo Nivel Alcanzado',
      targetStars: 1000,
      perks: ['Cata de cafés exóticos de origen único gratis', 'Envíos a domicilio 100% gratuitos siempre', 'Taza personalizada grabada con tu nombre']
    }
  };

  const currentTierInfo = tierDetails[user.tier] || tierDetails.green;
  const progressPercent = Math.min(
    100,
    user.tier === 'reserve' ? 100 : (user.stars / currentTierInfo.targetStars) * 100
  );

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return Sun;
      case 'Sparkles':
        return Sparkles;
      case 'Leaf':
        return Leaf;
      case 'CakeSlice':
        return CakeSlice;
      default:
        return Award;
    }
  };

  const handleRedeem = (reward: RewardItem) => {
    const success = redeemReward(reward);
    if (success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {
        // fallback
      }
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Banner & Virtual Gold Membership Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Info */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Programa Gamificado Starbucks Rewards</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-stone-900 leading-tight">
            Cada sorbo cuenta: gana estrellas y desbloquea beneficios
          </h1>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Acumula 10 estrellas por cada $1 gastado en la cafetería. Canjea tus estrellas por personalizaciones, cafés de la casa o bebidas artesanales enteras.
          </p>

          {/* Progress bar to next tier */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Estado Actual: <span className="text-stone-900 font-extrabold">{currentTierInfo.name}</span>
              </span>
              <span className="text-sm font-extrabold text-amber-700">
                {user.stars} ★ Estrellas
              </span>
            </div>

            <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden p-0.5 border border-stone-200">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-600 to-amber-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-stone-500 font-medium">
              <span>
                {user.tier === 'reserve'
                  ? '¡Has alcanzado el estatus más exclusivo!'
                  : `Te faltan ${Math.max(0, currentTierInfo.targetStars - user.stars)} estrellas para ${currentTierInfo.nextTier}`}
              </span>
              <span>{user.lifetimeStars} estrellas históricas</span>
            </div>
          </div>
        </div>

        {/* Right: Realistic Loyalty Membership Card */}
        <div className="lg:col-span-5">
          <div
            className={`p-6 sm:p-7 rounded-3xl text-white shadow-2xl bg-gradient-to-br ${currentTierInfo.bg} relative overflow-hidden border border-white/20 aspect-16/10 flex flex-col justify-between`}
          >
            {/* Background watermark */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />

            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-200 block">
                  STARBUCKS REWARDS MEMBER
                </span>
                <h3 className="text-xl font-bold font-display">{currentTierInfo.name}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-amber-300">
                ★
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-200 block">Balance de Estrellas</span>
                <span className="text-3xl font-extrabold tracking-tight text-white">
                  {user.stars} <span className="text-xl text-amber-300">★</span>
                </span>
              </div>
              <div className="bg-white p-2 rounded-xl text-stone-900 shadow-md">
                <QrCode className="w-9 h-9" />
              </div>
            </div>

            <div className="flex justify-between items-end relative z-10 pt-2 border-t border-white/15 text-xs text-stone-200">
              <div>
                <span className="text-[10px] text-white/60 block">Titular</span>
                <span className="font-bold">{user.name}</span>
              </div>
              <span className="font-mono text-[10px] opacity-75">ID: {user.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gamified Badges / Challenges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-stone-900">
              Desafíos e Insignias Gamificadas
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Completa retos semanales para ganar estrellas extra al instante
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.badges.map(badge => {
            const Icon = getBadgeIcon(badge.iconName);
            const isFinished = badge.completed;
            const canClaim = !isFinished && badge.currentCount >= badge.targetCount;

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                  isFinished
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                    : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isFinished ? 'bg-emerald-700 text-white' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      +{badge.starsReward} ★
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-stone-900 mb-1">{badge.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed mb-4">
                    {badge.description}
                  </p>
                </div>

                <div>
                  {isFinished ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 py-1.5 px-3 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>¡Desafío Completado!</span>
                    </div>
                  ) : canClaim ? (
                    <button
                      onClick={() => claimBadge(badge.id)}
                      className="w-full py-2 rounded-full text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-xs cursor-pointer transition-colors"
                    >
                      Reclamar +{badge.starsReward} ★
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-stone-500">
                        <span>Progreso:</span>
                        <span className="font-bold text-stone-800">
                          {badge.currentCount}/{badge.targetCount}
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500"
                          style={{
                            width: `${Math.min(100, (badge.currentCount / badge.targetCount) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redeemable Rewards Catalog */}
      <div className="space-y-6 pt-4 border-t border-stone-200">
        <div>
          <h2 className="text-2xl font-bold font-display text-stone-900">
            Catálogo de Canje de Estrellas
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Selecciona la recompensa deseada y redímela al instante
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewards.map(reward => {
            const hasEnoughStars = user.stars >= reward.starsRequired;

            return (
              <div
                key={reward.id}
                className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <img
                    src={reward.imageUrl}
                    alt={reward.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#006241] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{reward.starsRequired} Estrellas</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-stone-900 mb-1 leading-snug">
                      {reward.name}
                    </h4>
                    <p className="text-xs text-stone-500 leading-relaxed mb-4">
                      {reward.description}
                    </p>
                  </div>

                  <button
                    disabled={!hasEnoughStars}
                    onClick={() => handleRedeem(reward)}
                    className={`w-full py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      hasEnoughStars
                        ? 'bg-[#006241] hover:bg-[#1E3932] text-white shadow-xs active:scale-95'
                        : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                    }`}
                  >
                    {hasEnoughStars ? (
                      <>
                        <Gift className="w-4 h-4" />
                        <span>Canjear Recompensa</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Faltan {reward.starsRequired - user.stars} ★</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
