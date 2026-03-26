import { useEffect, useState } from 'react';
import { Product } from '../firebase/db';
import { getProducts } from '../services/saleService';

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    // Recargar productos cada 5 segundos para reflejar cambios en tiempo real
    const interval = setInterval(loadProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading && products.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Inventario</h2>
        <div className="text-center py-8 text-slate-500">Cargando productos...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Inventario</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Inventario</h2>
      <div className="overflow-x-auto bg-white shadow-sm rounded-xl border">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Nombre</th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide">Precio</th>
              <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide">Stock</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-2 text-sm">{product.id}</td>
                <td className="px-4 py-2 text-sm">{product.name}</td>
                <td className="px-4 py-2 text-sm text-right">{formatPrice(product.price_cents)}</td>
                <td className={`px-4 py-2 text-sm text-right ${product.stock < 10 ? 'text-red-600 font-medium' : 'text-slate-700'}`}>
                  {product.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="text-center py-8 text-slate-500">No hay productos en el inventario</div>
      )}
    </section>
  );
};

export default Inventory;
