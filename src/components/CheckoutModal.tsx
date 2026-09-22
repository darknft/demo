import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  ShieldCheck,
  Lock,
  Truck,
  Store,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { DeliveryType, PaymentMethod } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    deliveryType,
    setDeliveryType,
    deliveryAddress,
    setDeliveryAddress,
    selectedBranch,
    setSelectedBranch,
    cmsConfig,
    user,
    createOrder
  } = useStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cashAmount, setCashAmount] = useState<string>('50');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [tipPercentage, setTipPercentage] = useState<number>(10);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  // Card details state
  const [cardNumber, setCardNumber] = useState<string>('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('789');
  const [cardHolder, setCardHolder] = useState<string>(user.name || 'Camila Rosales');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isCheckoutOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const deliveryFee = deliveryType === 'delivery' && subtotal < cmsConfig.freeDeliveryThreshold
    ? cmsConfig.deliveryFee
    : 0;

  const pointsDiscount = Math.min(pointsToRedeem * 0.05, subtotal);
  const tipAmount = (subtotal * tipPercentage) / 100;
  const grandTotal = Math.max(0, subtotal - pointsDiscount + deliveryFee + tipAmount);
  const starsToEarn = Math.round(grandTotal * cmsConfig.pointsPerDollar);

  // Luhn algorithm check for realistic card validation
  const validateCard = (num: string): boolean => {
    const cleaned = num.replace(/\s+/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      if (isNaN(digit)) return false;
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const handleProcessOrder = () => {
    setErrorMsg('');

    if (deliveryType === 'delivery') {
      if (!cmsConfig.isDeliveryOpen) {
        setErrorMsg('El servicio de delivery se encuentra cerrado temporalmente por la cafetería. Por favor selecciona Retiro en Tienda.');
        return;
      }
      if (!deliveryAddress.trim()) {
        setErrorMsg('Por favor ingresa tu dirección completa para la entrega.');
        return;
      }
    }

    if (paymentMethod === 'card') {
      if (!validateCard(cardNumber)) {
        setErrorMsg('El número de tarjeta no es válido (Verificación algoritmo de Luhn).');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg('El código de seguridad CVV debe tener al menos 3 dígitos.');
        return;
      }
    } else {
      const cashVal = parseFloat(cashAmount);
      if (isNaN(cashVal) || cashVal < grandTotal) {
        setErrorMsg(`Para pago en efectivo, debes ingresar un monto igual o mayor a $${grandTotal.toFixed(2)}.`);
        return;
      }
    }

    setIsProcessing(true);

    // Simulate secure TLS gateway verification and tokenization
    setTimeout(() => {
      setIsProcessing(false);
      createOrder({
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
        pickupBranch: deliveryType === 'pickup' ? selectedBranch : undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        paymentMethod,
        cashAmountProvided: paymentMethod === 'cash' ? parseFloat(cashAmount) : undefined,
        tip: tipAmount,
        pointsToRedeem,
        isRecurring: cart.some(i => i.isRecurring),
        recurringFrequency: cart.find(i => i.isRecurring)?.recurringFrequency
      });

      // Fire celebratory confetti for loyal customer
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // confetti fallback
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: cmsConfig.primaryColor }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 leading-tight">
                Finalizar Pedido Seguro
              </h3>
              <p className="text-xs text-stone-500">
                Cifrado bancario AES-256 & Protocolo TLS 1.3
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Delivery or Pickup Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              1. Modalidad de Entrega
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                disabled={!cmsConfig.isDeliveryOpen}
                onClick={() => {
                  if (cmsConfig.isDeliveryOpen) {
                    setDeliveryType('delivery');
                  }
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  !cmsConfig.isDeliveryOpen
                    ? 'border-stone-200 bg-stone-100 text-stone-400 opacity-60 cursor-not-allowed'
                    : deliveryType === 'delivery'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold cursor-pointer'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50 cursor-pointer'
                }`}
              >
                <Truck className="w-5 h-5 text-[#006241]" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm block">Delivery a Domicilio</span>
                    {!cmsConfig.isDeliveryOpen && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded-md">
                        Cerrado
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-500 font-normal">
                    {cmsConfig.isDeliveryOpen ? 'Llega en 25-35 min' : 'Servicio cerrado temporalmente'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                  deliveryType === 'pickup'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Store className="w-5 h-5 text-[#006241]" />
                <div>
                  <span className="text-xs sm:text-sm block">Retiro en Tienda</span>
                  <span className="text-[11px] text-stone-500 font-normal">
                    Listo en 10-15 min
                  </span>
                </div>
              </button>
            </div>

            {!cmsConfig.isDeliveryOpen && deliveryType === 'delivery' && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>El delivery está cerrado. Cambiando automáticamente a Retiro en Tienda.</span>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className="px-2.5 py-1 bg-amber-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  Seleccionar Pick-up
                </button>
              </div>
            )}

            {deliveryType === 'delivery' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Dirección exacta de entrega:</span>
                </div>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="Calle, número exterior/interior, colonia, ciudad..."
                  className="w-full text-xs p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-stone-700 block">
                  Sucursal de retiro:
                </span>
                <select
                  value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value)}
                  className="w-full text-xs p-3 border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                >
                  {cmsConfig.storeBranches.map((b, idx) => (
                    <option key={idx} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-2">
              <input
                type="text"
                value={deliveryNotes}
                onChange={e => setDeliveryNotes(e.target.value)}
                placeholder="Instrucciones para el repartidor o barista (Ej. Tocar timbre 3B)..."
                className="w-full text-xs p-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Payment Method */}
          <div className="pt-4 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              2. Método de Pago
            </label>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                  paymentMethod === 'card'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[#006241]" />
                <div>
                  <span className="text-xs sm:text-sm block">Tarjeta en Línea</span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    Crédito / Débito / Apple Pay
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-[#006241]" />
                <div>
                  <span className="text-xs sm:text-sm block">Dinero en Efectivo</span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    Contra entrega o en caja
                  </span>
                </div>
              </button>
            </div>

            {/* Credit Card Fields */}
            {paymentMethod === 'card' ? (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">Datos de la Tarjeta</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Tokenización Segura</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Número de Tarjeta
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Vencimiento (MM/AA)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              /* Cash on Delivery / Pickup Fields */
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <Banknote className="w-4 h-4 text-emerald-700" />
                  <span>¿Con cuánto dinero pagarás en efectivo?</span>
                </div>
                <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                  Indica el monto para que el repartidor o barista prepare tu cambio exacto.
                </p>

                <div className="flex items-center gap-2">
                  {['20', '50', '100'].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashAmount(amt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        cashAmount === amt
                          ? 'bg-[#006241] text-white shadow-xs'
                          : 'bg-white border border-emerald-300 text-stone-800'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                  <div className="flex-1 relative">
                    <span className="absolute left-2.5 top-2 text-xs text-stone-400">$</span>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={e => setCashAmount(e.target.value)}
                      placeholder="Monto"
                      className="w-full text-xs pl-6 pr-2 py-1.5 bg-white border border-emerald-300 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                {parseFloat(cashAmount) >= grandTotal && (
                  <p className="text-xs text-emerald-900 font-semibold">
                    Cambio que recibirás:{' '}
                    <span className="font-extrabold">
                      ${(parseFloat(cashAmount) - grandTotal).toFixed(2)}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3. Barista Tip */}
          <div className="pt-4 border-t border-stone-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                3. Propina para el Barista y Repartidor
              </span>
              <span className="text-xs font-extrabold text-stone-900">
                +${tipAmount.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[0, 10, 15, 20].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTipPercentage(pct)}
                  className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    tipPercentage === pct
                      ? 'bg-[#006241] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70'
                  }`}
                >
                  {pct === 0 ? 'Sin propina' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Summary and Place Order Button */}
        <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
          <div className="flex justify-between items-center text-xs text-stone-600">
            <span>Total a Pagar ({paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}):</span>
            <span className="text-xl font-extrabold text-stone-900">
              ${grandTotal.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Recibirás por esta compra:
            </span>
            <span className="font-bold">+{starsToEarn} Estrellas Starbucks Rewards</span>
          </div>

          <button
            id="confirm-checkout-btn"
            type="button"
            disabled={isProcessing}
            onClick={handleProcessOrder}
            className="w-full py-3.5 rounded-full text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#006241] disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando pago seguro...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {paymentMethod === 'card' ? 'Pagar y Enviar Orden' : 'Confirmar Orden con Efectivo'}
                </span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
