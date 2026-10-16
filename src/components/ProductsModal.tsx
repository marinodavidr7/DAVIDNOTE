import React, { useState, useMemo } from 'react';
import { X, Search, Tag, ShoppingBag, Plus } from 'lucide-react';

export interface ProductItem {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  unidad: string;
  disponible: boolean;
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  { id: '1', nombre: 'Arroz Selecto (Libra)', precio: 45, categoria: 'Granos y Cereales', unidad: 'libra', disponible: true },
  { id: '2', nombre: 'Habichuelas Rojas (Libra)', precio: 75, categoria: 'Granos y Cereales', unidad: 'libra', disponible: true },
  { id: '3', nombre: 'Aceite de Cocina (1/2 Galón)', precio: 260, categoria: 'Aceites y Grasas', unidad: 'unidad', disponible: true },
  { id: '4', nombre: 'Aceite de Cocina (Litro)', precio: 145, categoria: 'Aceites y Grasas', unidad: 'unidad', disponible: true },
  { id: '5', nombre: 'Salami Especial Mallita (Libra)', precio: 185, categoria: 'Embutidos y Carnes', unidad: 'libra', disponible: true },
  { id: '6', nombre: 'Queso Cheddar / Holandés (Libra)', precio: 240, categoria: 'Lácteos', unidad: 'libra', disponible: true },
  { id: '7', nombre: 'Cartón de Huevos (30 Unidades)', precio: 275, categoria: 'Huevos y Lácteos', unidad: 'cartón', disponible: true },
  { id: '8', nombre: 'Huevos por Unidad', precio: 10, categoria: 'Huevos y Lácteos', unidad: 'unidad', disponible: true },
  { id: '9', nombre: 'Leche Evaporada Carnation', precio: 75, categoria: 'Lácteos', unidad: 'lata', disponible: true },
  { id: '10', nombre: 'Leche Líquida Entera 1L', precio: 85, categoria: 'Lácteos', unidad: 'litro', disponible: true },
  { id: '11', nombre: 'Café Santo Domingo 1/2 Libra', precio: 135, categoria: 'Café y Bebidas', unidad: 'paquete', disponible: true },
  { id: '12', nombre: 'Azúcar Crema (Libra)', precio: 40, categoria: 'Granos y Cereales', unidad: 'libra', disponible: true },
  { id: '13', nombre: 'Pan de Agua / Sobao (Unidad)', precio: 10, categoria: 'Panadería', unidad: 'unidad', disponible: true },
  { id: '14', nombre: 'Plátanos Verdes (Unidad)', precio: 25, categoria: 'Víveres y Vegetales', unidad: 'unidad', disponible: true },
  { id: '15', nombre: 'Cerveza Presidente Pequeña', precio: 140, categoria: 'Bebidas Alcohólicas', unidad: 'botella', disponible: true },
  { id: '16', nombre: 'Refresco Country Club 20oz', precio: 40, categoria: 'Bebidas y Refrescos', unidad: 'botella', disponible: true },
];

export interface ProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: ProductItem) => void;
}

export const ProductsModal: React.FC<ProductsModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [search, setSearch] = useState('');
  const [categoriaSel, setCategoriaSel] = useState<string>('todos');
  const [products] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('colmado_productos_lista');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PRODUCTS;
      }
    }
    return DEFAULT_PRODUCTS;
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.categoria));
    return ['todos', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = categoriaSel === 'todos' || p.categoria === categoriaSel;
      const matchSearch =
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.categoria.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, search, categoriaSel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="header-gradient px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">Lista de Productos y Precios</h3>
              <p className="text-xs text-blue-100">Consulta de artículos de Súper Colmado DAVID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition active:scale-95"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o categoría..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Categories Pill list */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaSel(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 text-xs ${
                  categoriaSel === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                }`}
              >
                {cat === 'todos' ? 'Todos los productos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Tag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-sm">No se encontraron productos</p>
              <p className="text-xs text-slate-400 mt-1">Prueba con otro término de búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 grid-productos">
              {filtered.map(p => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {p.categoria}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium capitalize">
                        {p.unidad}
                      </span>
                    </div>
                    <h4 className="font-black text-sm text-slate-900 group-hover:text-blue-700 transition">
                      {p.nombre}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Precio Colmado</div>
                      <div className="text-lg font-black text-slate-900">
                        RD$ {p.precio.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {onSelectProduct ? (
                      <button
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Anotar
                      </button>
                    ) : (
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                        <Tag className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            Mostrando <strong>{filtered.length}</strong> de {products.length} productos
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsModal;
