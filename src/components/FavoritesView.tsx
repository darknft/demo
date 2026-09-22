import React from 'react';
import { Heart, Coffee, ShoppingBag, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FavoritesView: React.FC = () => {
  const {
    products,
    user,
    openProductModal,
    addToCart,
    toggleFavorite,
    setActiveTab
  } = useStore();

  const favoriteProducts = products.filter(p => user.favoriteProductIds.includes(p.id));

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => setActiveTab('menu')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Menú</span>
          </button>
          <h1 className="text-3xl font-extrabold font-display text-stone-900 flex items-center gap-3">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <span>Tus Bebidas y Alimentos Favoritos</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Reordena tus combinaciones predilectas con un solo clic
          </p>
        </div>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="py-20 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-300">
          <Heart className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <h3 className="text-base font-bold text-stone-800">Aún no tienes favoritos guardados</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
            Haz clic en el corazón de cualquier bebida o alimento del menú para guardarlo aquí y pedirlo en segundos.
          </p>
          <button
            onClick={() => setActiveTab('menu')}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#006241] cursor-pointer"
          >
            Explorar el Menú
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map(product => {
            const defaultVariant = product.variants[0];

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-rose-500 cursor-pointer hover:scale-110 transition-transform"
                    title="Quitar de favoritos"
                  >
                    <Heart className="w-4 h-4 fill-rose-500" />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-stone-900 mb-1">{product.name}</h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                      {product.shortDescription}
                    </p>
                    <span className="text-xs font-extrabold text-stone-900 block mb-3">
                      Desde ${product.basePrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => openProductModal(product)}
                      className="flex-1 py-2 px-3 rounded-full border border-stone-300 hover:border-emerald-700 text-xs font-bold text-stone-800 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#006241]" />
                      <span>Personalizar</span>
                    </button>

                    <button
                      onClick={() => {
                        const defaultMods = product.modifierGroups
                          .filter(g => g.required && g.options.length > 0)
                          .map(g => ({
                            groupId: g.id,
                            groupName: g.name,
                            optionId: g.options[0].id,
                            optionName: g.options[0].name,
                            priceDelta: g.options[0].priceDelta
                          }));
                        addToCart(product, defaultVariant, defaultMods, 1);
                      }}
                      className="py-2 px-4 rounded-full bg-[#006241] hover:bg-[#1E3932] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Pedir Directo</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
