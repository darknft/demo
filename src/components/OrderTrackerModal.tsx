import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Coffee,
  Truck,
  Store,
  MapPin,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { OrderStatus } from '../types';

export const OrderTrackerModal: React.FC = () => {
  const {
    isOrderTrackerOpen,
    setIsOrderTrackerOpen,
    currentOrder,
    updateOrderStatus
  } = useStore();

  if (!isOrderTrackerOpen || !currentOrder) return null;

  const steps: { status: OrderStatus; label: string; desc: string; icon: React.ElementType }[] = [
    {
      status: 'received',
      label: 'Recibido',
      desc: 'Confirmado por la cafetería',
      icon: CheckCircle2
    },
    {
      status: 'preparing',
      label: 'En Preparación',
      desc: 'El barista está elaborando tu bebida',
      icon: Coffee
    },
    {
      status: currentOrder.deliveryType === 'delivery' ? 'in_transit' : 'ready_for_pickup',
      label: currentOrder.deliveryType === 'delivery' ? 'En Camino' : 'Listo para Retiro',
      desc: currentOrder.deliveryType === 'delivery' ? 'Repartidor en ruta con empaque térmico' : 'Pasa a recoger a la barra',
      icon: currentOrder.deliveryType === 'delivery' ? Truck : Store
    },
    {
      status: 'delivered',
      label: 'Entregado',
      desc: '¡Orden completada con éxito!',
      icon: Sparkles
    }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 0;
      case 'preparing':
        return 1;
      case 'in_transit':
      case 'ready_for_pickup':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepIndex(currentOrder.status);

  // Quick simulation helper for user testing
  const handleSimulateNextStep = () => {
    if (currentOrder.status === 'received') {
      updateOrderStatus(currentOrder.id, 'preparing');
    } else if (currentOrder.status === 'preparing') {
      updateOrderStatus(
        currentOrder.id,
        currentOrder.deliveryType === 'delivery' ? 'in_transit' : 'ready_for_pickup'
      );
    } else if (
      currentOrder.status === 'in_transit' ||
      currentOrder.status === 'ready_for_pickup'
    ) {
      updateOrderStatus(currentOrder.id, 'delivered');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-[#1E3932] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                {currentOrder.deliveryType === 'delivery' ? '🛵 Delivery en Vivo' : '☕ Retiro en Sucursal'}
              </span>
              <span className="text-xs text-stone-300">Orden #{currentOrder.id}</span>
            </div>
            <h3 className="font-bold text-xl font-display">
              {currentOrder.status === 'delivered'
                ? '¡Tu pedido fue entregado!'
                : 'Rastreando tu pedido en tiempo real'}
            </h3>
          </div>

          <button
            onClick={() => setIsOrderTrackerOpen(false)}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Estimated ETA Banner */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#006241] text-white flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-800 uppercase font-bold tracking-wider block">
                  Tiempo Estimado de Llegada
                </span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-950">
                  {currentOrder.status === 'delivered'
                    ? 'Entregado'
                    : `${currentOrder.estimatedTimeMinutes} - ${currentOrder.estimatedTimeMinutes + 10} minutos`}
                </span>
              </div>
            </div>

            {/* Quick Demo Status Advancer */}
            {currentOrder.status !== 'delivered' && (
              <button
                onClick={handleSimulateNextStep}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#006241] hover:bg-[#1E3932] text-white cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                title="Simula el siguiente estado en vivo"
              >
                <span>Avanzar Estado</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Progreso del Pedido
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.status} className="relative flex items-start gap-3">
                    <div
                      className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                        isCompleted
                          ? 'bg-[#006241] text-white'
                          : 'bg-stone-300 text-stone-600'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${
                            isCurrent ? 'text-emerald-900' : isCompleted ? 'text-stone-900' : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 animate-pulse">
                            En progreso
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team / Courier Details */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-stone-200 overflow-hidden border border-stone-300">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                  alt="Barista & Courier"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 font-medium block">
                  {currentOrder.deliveryType === 'delivery'
                    ? 'Repartidor Asignado'
                    : 'Barista Responsable'}
                </span>
                <span className="text-sm font-bold text-stone-900">
                  {currentOrder.deliveryType === 'delivery' ? 'Carlos Mendizábal (Moto)' : 'Mateo Valenzuela (Lead Barista)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Llamando al repartidor / barista: +52 55 8820 4410')}
                className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-emerald-700 cursor-pointer transition-colors"
                title="Llamar"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert('Chat en vivo con tienda: Todo en orden, tu café está protegido en portavasos térmico.')}
                className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-emerald-700 cursor-pointer transition-colors"
                title="Mensaje"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="pt-2 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              Detalle de Productos ({currentOrder.items.length})
            </h4>

            <div className="space-y-2.5">
              {currentOrder.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                  <div>
                    <span className="font-bold text-stone-900">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="text-stone-500 block text-[11px]">
                      {item.selectedVariant.name}
                      {item.selectedModifiers.length > 0 &&
                        ` • ${item.selectedModifiers.map(m => m.optionName).join(', ')}`}
                    </span>
                  </div>
                  <span className="font-extrabold text-stone-900">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-between items-center text-xs font-bold text-stone-900">
              <span>Total Pagado ({currentOrder.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}):</span>
              <span className="text-sm text-emerald-900">${currentOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-center">
          <button
            onClick={() => setIsOrderTrackerOpen(false)}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 cursor-pointer shadow-xs"
          >
            Cerrar Ventana de Rastreo
          </button>
        </div>
      </div>
    </div>
  );
};
