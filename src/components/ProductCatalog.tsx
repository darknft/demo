import React from 'react';
import {
  Coffee,
  IceCream,
  Sparkles,
  Cake,
  Sandwich,
  Package,
  Heart,
  Plus,
  SlidersHorizontal,
  Flame,
  Award,
  Tag,
  Thermometer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    cmsConfig,
    openProductModal,
    addToCart,
    toggleFavorite,
    isFavorite,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  } = useStore();

  const categories = [
    { id: 'all', label: 'Todos', icon: Sparkles },
    { id: 'bebidas_calientes', label: 'Bebidas Calientes', icon: Coffee },
    { id: 'bebidas_frias', label: 'Bebidas Frías', icon: Sparkles },
    { id: 'frappuccinos', label: 'Frappuccino®', icon: IceCream },
    { id: 'reposteria', label: 'Repostería & Bakery', icon: Cake },
    { id: 'alimentos', label: 'Sandwiches & Salados', icon: Sandwich },
    { id: 'cafe_grano', label: 'Café en Grano', icon: Package }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.longDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    // Quick add default first variant and default required modifiers
    const defaultVariant = product.variants[0];
    const defaultModifiers = product.modifierGroups
      .filter(g => g.required && g.options.length > 0)
      .map(g => ({
        groupId: g.id,
        groupName: g.name,
        optionId: g.options[0].id,
        optionName: g.options[0].name,
        priceDelta: g.options[0].priceDelta
      }));

    addToCart(product, defaultVariant, defaultModifiers, 1);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 no-scrollbar border-b border-stone-200/80 mb-8">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === 'all'
              ? products.length
              : products.filter(p => p.category === cat.id).length;

          return (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'text-white shadow-md'
                  : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
              }`}
              style={isSelected ? { backgroundColor: cmsConfig.primaryColor } : {}}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Catalog Header & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-stone-900">
            {categories.find(c => c.id === selectedCategory)?.label || 'Catálogo de Café'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Mostrando {filteredProducts.length} deliciosas opciones preparadas al instante
          </p>
        </div>

        {searchQuery && (
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full text-xs text-emerald-900 font-medium">
            <span>Resultados para "{searchQuery}"</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-emerald-700 hover:text-emerald-950 font-bold ml-1 cursor-pointer"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-300">
          <Coffee className="w-12 h-12 mx-auto text-stone-400 mb-3" />
          <h3 className="text-base font-bold text-stone-800">No encontramos productos</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
            Intenta con otra palabra clave o selecciona otra categoría del menú.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#006241] cursor-pointer"
          >
            Ver todo el menú
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map(product => {
              const fav = isFavorite(product.id);
              const defaultVariant = product.variants[0];

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => openProductModal(product)}
                  className={`group bg-white rounded-3xl border border-stone-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer relative ${
                    !product.available ? 'opacity-65 grayscale-30' : ''
                  }`}
                >
                  {/* Image & Badges */}
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                    {/* Favorite Button */}
                    <button
                      id={`fav-btn-${product.id}`}
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-transform cursor-pointer z-10"
                      title={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          fav ? 'fill-rose-500 text-rose-500' : 'text-stone-400 hover:text-stone-600'
                        }`}
                      />
                    </button>

                    {/* Featured, Offer or Stars Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      {product.salePrice && product.salePrice > 0 && product.salePrice < product.basePrice && (
                        <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          ¡Oferta!
                        </span>
                      )}
                      {product.featured && (
                        <span className="bg-amber-400 text-stone-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                          <Flame className="w-3 h-3 text-red-600" />
                          Destacado
                        </span>
                      )}
                      {product.starsAwarded && (
                        <span className="bg-emerald-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Award className="w-2.5 h-2.5" />
                          +{product.starsAwarded} ★
                        </span>
                      )}
                    </div>

                    {!product.available && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                          Agotado Temporalmente
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="font-bold text-base sm:text-lg text-stone-900 group-hover:text-[#006241] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </div>

                      {/* Temperature badge if present */}
                      {product.temperatureOption && product.temperatureOption !== 'none' && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                            <Thermometer className="w-3 h-3 text-emerald-800" />
                            {product.temperatureOption === 'hot' && '♨️ Caliente'}
                            {product.temperatureOption === 'iced' && '❄️ Frío con Hielo'}
                            {product.temperatureOption === 'both' && '♨️ Caliente o ❄️ Frío'}
                          </span>
                        </div>
                      )}

                      <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed mb-3">
                        {product.shortDescription}
                      </p>

                      {/* Sizes preview */}
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium mb-3">
                        <span>Tamaños:</span>
                        <div className="flex flex-wrap gap-1 text-stone-600 font-semibold">
                          {product.variants.map((v) => (
                            <span key={v.id} className="bg-stone-100 px-1.5 py-0.5 rounded text-[10px]">
                              {v.name.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-medium">Desde</span>
                        {product.salePrice && product.salePrice > 0 && product.salePrice < product.basePrice ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base sm:text-lg font-extrabold text-emerald-800">
                              ${product.salePrice.toFixed(2)}
                            </span>
                            <span className="text-xs font-semibold text-stone-400 line-through">
                              ${product.basePrice.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base sm:text-lg font-extrabold text-stone-900">
                            ${product.basePrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          id={`customize-btn-${product.id}`}
                          onClick={() => openProductModal(product)}
                          className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-full border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-stone-800 transition-colors cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#006241]" />
                          <span>Personalizar</span>
                        </button>

                        <button
                          id={`quick-add-btn-${product.id}`}
                          onClick={e => handleQuickAdd(e, product)}
                          disabled={!product.available}
                          title={`Agregar 1x ${defaultVariant.name}`}
                          className="w-9 h-9 rounded-full bg-[#006241] hover:bg-[#1E3932] disabled:bg-stone-300 text-white flex items-center justify-center shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};
