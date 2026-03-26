import { useState, useEffect } from 'react';
import { Product, SaleItem } from '../firebase/db';
import { createSale, getProducts } from '../services/saleService';

type PaymentMethod = 'cash' | 'card' | 'other';

const CreateSale = () => {
  // Estado del carrito
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  
  // Estado UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Cargar productos al montar
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
  }, []);

  // Agregar producto al carrito
  const handleAddToCart = () => {
    setError('');
    
    const qty = parseInt(quantity, 10);
    if (!selectedProductId) {
      setError('Selecciona un producto');
      return;
    }
    if (!qty || qty <= 0) {
      setError('Cantidad debe ser mayor a 0');
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      setError('Producto no encontrado');
      return;
    }

    if (qty > product.stock) {
      setError(`Stock insuficiente. Disponible: ${product.stock}`);
      return;
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = cartItems.find((item) => item.product_id === selectedProductId);
    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      if (newQty > product.stock) {
        setError(`Stock insuficiente. Total solicitado: ${newQty}, disponible: ${product.stock}`);
        return;
      }
      setCartItems(
        cartItems.map((item) =>
          item.product_id === selectedProductId
            ? {
                ...item,
                quantity: newQty,
                subtotal: newQty * item.price_cents,
              }
            : item
        )
      );
    } else {
      // Agregar nuevo producto
      setCartItems([
        ...cartItems,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          price_cents: product.price_cents,
          subtotal: qty * product.price_cents,
        },
      ]);
    }

    setSelectedProductId('');
    setQuantity('');
  };

  // Remover producto del carrito
  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.product_id !== productId));
  };

  // Calcular total
  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Confirmar venta
  const handleConfirmSale = async () => {
    if (cartItems.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createSale(cartItems, paymentMethod);
      setSuccess(true);
      setCartItems([]);
      setPaymentMethod('cash');
      
      // Recargar productos para actualizar stock
      const data = await getProducts();
      setProducts(data);

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al crear la venta');
    } finally {
      setLoading(false);
    }
  };

  // Formatear precio
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">📝 Registrar Nueva Venta</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          ✅ Venta registrada exitosamente
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de selección - izquierda */}
        <div className="lg:col-span-2 space-y-4">
          {/* Selector de producto */}
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <h3 className="font-semibold mb-3">Agregar Producto</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Producto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Selecciona un producto --</option>
                  {products
                    .filter((p) => p.stock > 0)
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.stock} disponibles) - {formatPrice(product.price_cents)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Cantidad a vender"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleAddToCart}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>

          {/* Carrito */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <h3 className="font-semibold p-4 border-b">Carrito</h3>
            {cartItems.length === 0 ? (
              <p className="text-slate-500 p-4">El carrito está vacío</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Producto</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase">Precio Unit.</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase">Cantidad</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold uppercase">Subtotal</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cartItems.map((item) => (
                      <tr key={item.product_id}>
                        <td className="px-4 py-2 text-sm">{item.product_name}</td>
                        <td className="px-4 py-2 text-sm text-right">{formatPrice(item.price_cents)}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">
                          {formatPrice(item.subtotal)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleRemoveFromCart(item.product_id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Panel de resumen - derecha */}
        <div className="bg-white rounded-xl shadow-sm border p-6 h-fit">
          <h3 className="font-semibold mb-4">Resumen</h3>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span>Items:</span>
              <span className="font-medium">{cartItems.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cantidad total:</span>
              <span className="font-medium">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-indigo-600">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium">Método de Pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="cash">💵 Efectivo</option>
              <option value="card">💳 Tarjeta</option>
              <option value="other">📱 Otro</option>
            </select>
          </div>

          <button
            onClick={handleConfirmSale}
            disabled={loading || cartItems.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Procesando...' : '✓ Confirmar Venta'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CreateSale;
