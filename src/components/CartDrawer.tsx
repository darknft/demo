import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  Store,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    deliveryType,
    setDeliveryType,
    deliveryAddress,
    selectedBranch,
    cmsConfig,
    user,
    setIsCheckoutOpen
  } = useStore();

  const [redeemStarsAmount, setRedeemStarsAmount] = useState<number>(0);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const deliveryFee = deliveryType === 'delivery' && subtotal < cmsConfig.freeDeliveryThreshold
    ? cmsConfig.deliveryFee
    : 0;

  const pointsDiscount = Math.min(redeemStarsAmount * 0.05, subtotal);
  const freeShippingNeeded = Math.max(0, cmsConfig.freeDeliveryThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / cmsConfig.freeDeliveryThreshold) * 100);

  const totalEstimate = Math.max(0, subtotal - pointsDiscount + deliveryFee);
  const starsToEarn = Math.round(totalEstimate * cmsConfig.pointsPerDollar);

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer container */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: cmsConfig.primaryColor }}
                >
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900 leading-tight">Tu Carrito</h3>
                  <span className="text-xs text-stone-500 font-medium">
                    {cart.reduce((acc, i) => acc + i.quantity, 0)} artículos seleccionados
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Delivery / Pick-up Selector in Cart */}
            <div className="p-3 bg-stone-100/70 border-b border-stone-200/80">
              <div className="flex p-1 bg-white rounded-xl border border-stone-200 shadow-2xs">
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    deliveryType === 'delivery'
                      ? 'bg-[#006241] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Delivery</span>
                </button>
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    deliveryType === 'pickup'
                      ? 'bg-[#006241] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Pick-up</span>
                </button>
              </div>

              {/* Free delivery threshold progress */}
              {deliveryType === 'delivery' && (
                <div className="mt-2.5 px-1">
                  <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                    <span>
                      {freeShippingNeeded > 0
                        ? `Agrega $${freeShippingNeeded.toFixed(2)} más para delivery GRATIS`
                        : '¡Felicidades! Tienes Delivery GRATIS'}
                    </span>
                    <span className="font-bold text-emerald-800">
                      ${cmsConfig.freeDeliveryThreshold.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-stone-800 text-base">Tu carrito está vacío</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    ¿Se te antoja un Caramel Macchiato recién preparado o un butter croissant horneado?
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#006241] shadow-xs cursor-pointer hover:bg-[#1E3932] transition-colors"
                  >
                    Explorar el Menú
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-stone-200/90 bg-white hover:border-stone-300 transition-all shadow-2xs space-y-2.5"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-stone-900 truncate">
                            {item.productName}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-rose-600 cursor-pointer p-1 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-semibold text-emerald-900 block">
                          {item.selectedVariant.name}
                        </span>

                        {item.selectedModifiers.length > 0 && (
                          <div className="text-[11px] text-stone-500 mt-1 space-y-0.5">
                            {item.selectedModifiers.map(m => (
                              <div key={m.optionId} className="flex justify-between">
                                <span>• {m.optionName}</span>
                                {m.priceDelta > 0 && <span>+${m.priceDelta.toFixed(2)}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {item.isRecurring && (
                          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                            <RefreshCw className="w-3 h-3" />
                            <span>Recurrente ({item.recurringFrequency}) -10%</span>
                          </div>
                        )}

                        {item.specialInstructions && (
                          <p className="text-[11px] text-stone-500 italic mt-1 bg-stone-50 p-1.5 rounded">
                            "{item.specialInstructions}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Unit Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-2 bg-stone-100 px-2 py-1 rounded-full">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded-full bg-white text-stone-700 flex items-center justify-center hover:bg-stone-200 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded-full bg-white text-stone-700 flex items-center justify-center hover:bg-stone-200 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-stone-900">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          ${item.unitPrice.toFixed(2)} c/u
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Loyalty Points Redemption Option */}
            {cart.length > 0 && user.stars >= 50 && (
              <div className="p-3.5 bg-amber-50/70 border-t border-amber-200/80 mx-4 mb-2 rounded-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-950">
                      Canjear Estrellas ({user.stars} disponibles)
                    </span>
                  </div>
                  {redeemStarsAmount > 0 && (
                    <button
                      onClick={() => setRedeemStarsAmount(0)}
                      className="text-[11px] text-amber-800 underline font-semibold cursor-pointer"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <div className="flex gap-1.5">
                  {[50, 100, 200].map(stars => (
                    <button
                      key={stars}
                      disabled={user.stars < stars}
                      onClick={() => setRedeemStarsAmount(stars)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        redeemStarsAmount === stars
                          ? 'bg-[#006241] text-white shadow-xs'
                          : user.stars < stars
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-white border border-amber-300 text-amber-950 hover:bg-amber-100'
                      }`}
                    >
                      {stars}★ (-${(stars * 0.05).toFixed(2)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Drawer Footer with Totals & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
                  </div>

                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Descuento por {redeemStarsAmount} Estrellas:</span>
                      <span>-${pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>
                      {deliveryType === 'delivery' ? 'Costo de Envío:' : 'Retiro en Tienda:'}
                    </span>
                    <span className="font-semibold text-stone-900">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-700 font-bold">GRATIS</span>
                      ) : (
                        `$${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-extrabold text-stone-900">
                    <span>Total Estimado:</span>
                    <span className="text-base sm:text-lg text-emerald-950">
                      ${totalEstimate.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> Ganarás con esta compra:
                    </span>
                    <span>+{starsToEarn} Estrellas Rewards</span>
                  </div>
                </div>

                <button
                  id="checkout-proceed-btn"
                  onClick={handleOpenCheckout}
                  className="w-full py-3.5 rounded-full text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#006241]"
                >
                  <span>Proceder al Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
