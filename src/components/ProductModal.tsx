import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Check,
  Flame,
  Clock,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Heart,
  Coffee,
  Thermometer,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { ProductVariant, SelectedModifier, RecurringFrequency } from '../types';

export const ProductModal: React.FC = () => {
  const {
    isProductModalOpen,
    activeProduct,
    closeProductModal,
    addToCart,
    cmsConfig,
    toggleFavorite,
    isFavorite
  } = useStore();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedTemperature, setSelectedTemperature] = useState<'hot' | 'iced' | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('weekly');

  useEffect(() => {
    if (activeProduct) {
      setSelectedVariant(activeProduct.variants[0]);
      
      // Initialize temperature choice
      if (activeProduct.temperatureOption === 'both' || activeProduct.temperatureOption === 'hot') {
        setSelectedTemperature('hot');
      } else if (activeProduct.temperatureOption === 'iced') {
        setSelectedTemperature('iced');
      } else {
        setSelectedTemperature(null);
      }

      // Preselect default required modifiers (first option of required groups)
      const initialMods: SelectedModifier[] = [];
      activeProduct.modifierGroups.forEach(group => {
        if (group.required && group.options.length > 0) {
          initialMods.push({
            groupId: group.id,
            groupName: group.name,
            optionId: group.options[0].id,
            optionName: group.options[0].name,
            priceDelta: group.options[0].priceDelta
          });
        }
      });
      setSelectedModifiers(initialMods);
      setQuantity(1);
      setSpecialInstructions('');
      setIsRecurring(false);
      setRecurringFrequency('weekly');
    }
  }, [activeProduct]);

  if (!isProductModalOpen || !activeProduct || !selectedVariant) return null;

  const handleToggleModifier = (
    groupId: string,
    groupName: string,
    optionId: string,
    optionName: string,
    priceDelta: number,
    isRadio: boolean
  ) => {
    if (isRadio) {
      // Replace existing selection in this group
      setSelectedModifiers(prev => [
        ...prev.filter(m => m.groupId !== groupId),
        { groupId, groupName, optionId, optionName, priceDelta }
      ]);
    } else {
      // Multiple selection toggle
      const exists = selectedModifiers.some(
        m => m.groupId === groupId && m.optionId === optionId
      );
      if (exists) {
        setSelectedModifiers(prev =>
          prev.filter(m => !(m.groupId === groupId && m.optionId === optionId))
        );
      } else {
        setSelectedModifiers(prev => [
          ...prev,
          { groupId, groupName, optionId, optionName, priceDelta }
        ]);
      }
    }
  };

  const isModifierSelected = (groupId: string, optionId: string) => {
    return selectedModifiers.some(m => m.groupId === groupId && m.optionId === optionId);
  };

  // Calculate prices with optional Sale Price
  const hasSalePrice = Boolean(
    activeProduct.salePrice &&
    activeProduct.salePrice > 0 &&
    activeProduct.salePrice < activeProduct.basePrice
  );
  const effectiveBasePrice = hasSalePrice ? activeProduct.salePrice! : activeProduct.basePrice;

  const modifiersCost = selectedModifiers.reduce((acc, m) => acc + m.priceDelta, 0);
  const unitPrice = effectiveBasePrice + selectedVariant.priceDelta + modifiersCost;
  const originalUnitPrice = activeProduct.basePrice + selectedVariant.priceDelta + modifiersCost;

  const rawSubtotal = unitPrice * quantity;
  const originalRawSubtotal = originalUnitPrice * quantity;
  const recurringDiscount = isRecurring ? rawSubtotal * 0.10 : 0;
  const finalTotal = rawSubtotal - recurringDiscount;
  const starsCalculated = Math.round(finalTotal * cmsConfig.pointsPerDollar);

  const handleAddToCart = () => {
    const tempPrefix = selectedTemperature 
      ? `Temperatura: ${selectedTemperature === 'hot' ? 'Caliente ♨️' : 'Frío con Hielo ❄️'}` 
      : '';
    const fullNotes = [tempPrefix, specialInstructions.trim()].filter(Boolean).join(' | ');

    addToCart(
      activeProduct,
      selectedVariant,
      selectedModifiers,
      quantity,
      fullNotes || undefined,
      isRecurring,
      isRecurring ? recurringFrequency : undefined
    );
    closeProductModal();
  };

  const fav = isFavorite(activeProduct.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200"
        >
          {/* Header Image & Close Button */}
          <div className="relative aspect-16/9 sm:aspect-21/9 shrink-0 overflow-hidden bg-stone-100">
            <img
              src={activeProduct.imageUrl}
              alt={activeProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <button
              onClick={closeProductModal}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={() => toggleFavorite(activeProduct.id)}
              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 ${fav ? 'fill-rose-500 text-rose-500' : 'text-white'}`}
              />
            </button>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 uppercase">
                  {activeProduct.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> +{starsCalculated} Estrellas
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display leading-tight">
                {activeProduct.name}
              </h2>
            </div>
          </div>

          {/* Scrollable Customization Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Long description */}
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed border-b border-stone-100 pb-4">
              {activeProduct.longDescription}
            </p>

            {/* 1. Size / Variant Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-[#006241]" />
                  <span>Selecciona el Tamaño</span>
                </h4>
                <span className="text-xs text-emerald-800 font-bold uppercase">Obligatorio</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activeProduct.variants.map(variant => {
                  const isSelected = selectedVariant.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-50/70 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-xs sm:text-sm text-stone-900">
                          {variant.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#006241]" />}
                      </div>
                      <div className="flex justify-between items-center text-xs text-stone-500">
                        <span>
                          {variant.priceDelta > 0 ? `+$${variant.priceDelta.toFixed(2)}` : 'Incluido'}
                        </span>
                        {variant.calories && <span>{variant.calories} kcal</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Temperature Option (Caliente / Frío) */}
            {activeProduct.temperatureOption && activeProduct.temperatureOption !== 'none' && (
              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-emerald-800" />
                    <span>Temperatura de Servicio</span>
                  </h4>
                  {activeProduct.temperatureOption === 'both' ? (
                    <span className="text-xs text-emerald-800 font-bold uppercase">Elige tu preferencia</span>
                  ) : (
                    <span className="text-xs text-stone-500 font-medium">Fijo de receta</span>
                  )}
                </div>

                {activeProduct.temperatureOption === 'both' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTemperature('hot')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        selectedTemperature === 'hot'
                          ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold shadow-xs'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">♨️</span>
                        <div>
                          <span className="text-xs sm:text-sm block">Caliente</span>
                          <span className="text-[10px] text-stone-500 font-normal">Vaporizado perfecto</span>
                        </div>
                      </div>
                      {selectedTemperature === 'hot' && <Check className="w-4 h-4 text-amber-700" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTemperature('iced')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        selectedTemperature === 'iced'
                          ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold shadow-xs'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">❄️</span>
                        <div>
                          <span className="text-xs sm:text-sm block">Frío / Con Hielo</span>
                          <span className="text-[10px] text-stone-500 font-normal">Iced barista</span>
                        </div>
                      </div>
                      {selectedTemperature === 'iced' && <Check className="w-4 h-4 text-sky-700" />}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-2">
                    <span>{activeProduct.temperatureOption === 'hot' ? '♨️ Servido Caliente al punto barista' : '❄️ Servido Frío con Hielo Cristalino'}</span>
                  </div>
                )}
              </div>
            )}

            {/* 2. Modifiers Groups */}
            {activeProduct.modifierGroups.map(group => {
              const isRadio = group.maxSelection === 1;
              return (
                <div key={group.id} className="pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{group.name}</h4>
                      <p className="text-[11px] text-stone-400">
                        {isRadio ? 'Elige 1 opción' : `Hasta ${group.maxSelection} opciones`}
                      </p>
                    </div>
                    {group.required ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                        Obligatorio
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-stone-400">Opcional</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {group.options.map(option => {
                      const selected = isModifierSelected(group.id, option.id);
                      return (
                        <div
                          key={option.id}
                          onClick={() =>
                            handleToggleModifier(
                              group.id,
                              group.name,
                              option.id,
                              option.name,
                              option.priceDelta,
                              isRadio
                            )
                          }
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                            selected
                              ? 'border-emerald-600 bg-emerald-50/60 font-semibold text-emerald-950'
                              : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-${isRadio ? 'full' : 'md'} border flex items-center justify-center ${
                                selected
                                  ? 'border-emerald-700 bg-emerald-700 text-white'
                                  : 'border-stone-300'
                              }`}
                            >
                              {selected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{option.name}</span>
                          </div>
                          <span className="font-medium text-stone-500">
                            {option.priceDelta > 0 ? `+$${option.priceDelta.toFixed(2)}` : 'Gratis'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* 3. Recurring Order / Subscription Toggle */}
            <div className="pt-4 border-t border-stone-100">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-2.5">
                    <RefreshCw className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2">
                        <span>Compra Recurrente / Suscripción</span>
                        <span className="bg-emerald-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          10% OFF
                        </span>
                      </h4>
                      <p className="text-[11px] text-amber-900/80 mt-0.5 leading-relaxed">
                        Programa este café para recibirlo automáticamente y ahorra un 10% adicional. Puedes pausar o cancelar cuando quieras.
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    id="recurring-checkbox"
                    checked={isRecurring}
                    onChange={e => setIsRecurring(e.target.checked)}
                    className="w-5 h-5 accent-[#006241] cursor-pointer rounded mt-0.5"
                  />
                </div>

                {isRecurring && (
                  <div className="mt-3 pt-3 border-t border-amber-200/60 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-amber-950">Frecuencia:</span>
                    {(['daily', 'weekly', 'biweekly', 'monthly'] as RecurringFrequency[]).map(freq => {
                      const labels: Record<RecurringFrequency, string> = {
                        daily: 'Diario (Lun-Vie)',
                        weekly: 'Semanal',
                        biweekly: 'Quincenal',
                        monthly: 'Mensual'
                      };
                      return (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setRecurringFrequency(freq)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                            recurringFrequency === freq
                              ? 'bg-[#006241] text-white shadow-xs'
                              : 'bg-white/80 text-stone-700 hover:bg-white border border-amber-200'
                          }`}
                        >
                          {labels[freq]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Special Instructions */}
            <div className="pt-4 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Notas especiales para el Barista (Opcional):
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                placeholder="Ej. Poco hielo, escribir nombre 'Ana' en el vaso, tapa hermética..."
                className="w-full text-xs p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-full text-stone-600 hover:bg-stone-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-extrabold text-sm text-stone-900 w-5 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-full text-stone-600 hover:bg-stone-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Price Breakdown & Add Button */}
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              <div className="text-right">
                {hasSalePrice && (
                  <div className="flex items-center justify-end gap-1.5 mb-0.5">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                      Oferta
                    </span>
                    <span className="text-xs text-stone-400 line-through">
                      ${originalRawSubtotal.toFixed(2)}
                    </span>
                  </div>
                )}
                {isRecurring && !hasSalePrice && (
                  <span className="text-[11px] text-stone-400 line-through block">
                    ${rawSubtotal.toFixed(2)}
                  </span>
                )}
                <span className="text-lg sm:text-xl font-extrabold text-stone-900 block leading-tight">
                  ${finalTotal.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-800 font-bold block">
                  +{starsCalculated} ★ Stars
                </span>
              </div>

              <button
                id="modal-confirm-add-cart-btn"
                type="button"
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer bg-[#006241]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Agregar al Carrito</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
