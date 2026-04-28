import { useEffect, useState } from 'react';
import { Sale } from '../firebase/db';
import { getSales } from '../services/saleService';

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const data = await getSales();
        setSales(data);
      } catch (err) {
        console.error('Error loading sales:', err);
        setError('Error al cargar historial de ventas');
      } finally {
        setLoading(false);
      }
    };

    loadSales();
    // Recargar ventas cada 5 segundos
    const interval = setInterval(loadSales, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return '💵 Efectivo';
      case 'card':
        return '💳 Tarjeta';
      case 'other':
        return '📱 Otro';
      default:
        return method;
    }
  };

  if (loading && sales.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-sf-text">Historial de Ventas</h2>
        <div className="text-center py-8 text-gray-500">Cargando ventas...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-sf-text">Historial de Ventas</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-sf-text">Historial de Ventas</h2>
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        {sales.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hay ventas registradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-sf-primary text-white">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Fecha</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide">Items</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide">Método</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide">Detalles</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-sf-light transition">
                    <td className="px-4 py-2 text-sm font-mono text-sf-text">{sale.id?.slice(0, 8)}</td>
                    <td className="px-4 py-2 text-sm text-sf-text">{formatDate(sale.date)}</td>
                    <td className="px-4 py-2 text-sm text-right text-sf-text">{sale.items?.length || 0}</td>
                    <td className="px-4 py-2 text-sm text-right font-medium text-sf-primary">{formatPrice(sale.total)}</td>
                    <td className="px-4 py-2 text-sm text-sf-text">{getPaymentMethodLabel(sale.payment_method)}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() =>
                          setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)
                        }
                        className="text-sf-primary hover:text-sf-dark text-sm font-medium"
                      >
                        {expandedSaleId === sale.id ? '▼' : '▶'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detalles expandibles */}
        {expandedSaleId && (
          <div className="bg-sf-light border-t px-4 py-4">
            {(() => {
              const selectedSale = sales.find((s) => s.id === expandedSaleId);
              if (!selectedSale)
                return <div className="text-gray-500">Venta no encontrada</div>;

              return (
                <div className="space-y-4">
                  <h4 className="font-semibold text-sf-text">Detalles de la venta</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">ID Venta:</span>
                      <p className="font-mono text-sf-text">{selectedSale.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha:</span>
                      <p className="text-sf-text">{formatDate(selectedSale.date)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Método de Pago:</span>
                      <p className="text-sf-text">{getPaymentMethodLabel(selectedSale.payment_method)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <p className="font-bold text-lg text-sf-primary">
                        {formatPrice(selectedSale.total)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-sm mb-2 text-sf-text">Productos:</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-white border-b">
                          <tr>
                            <th className="px-2 py-1 text-left text-sf-text">Producto</th>
                            <th className="px-2 py-1 text-right text-sf-text">Precio Unit.</th>
                            <th className="px-2 py-1 text-right text-sf-text">Cantidad</th>
                            <th className="px-2 py-1 text-right text-sf-text">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedSale.items?.map((item, idx) => (
                            <tr key={idx} className="bg-white">
                              <td className="px-2 py-1 text-sf-text">{item.product_name}</td>
                              <td className="px-2 py-1 text-right text-sf-text">{formatPrice(item.price_cents)}</td>
                              <td className="px-2 py-1 text-right text-sf-text">{item.quantity}</td>
                              <td className="px-2 py-1 text-right font-medium text-sf-primary">
                                {formatPrice(item.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </section>
  );
};

export default Sales;
