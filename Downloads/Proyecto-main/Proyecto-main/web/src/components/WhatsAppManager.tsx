import { useEffect, useState } from 'react';
import {
  getConversations,
  getOrders,
  addMessage,
  createOrder,
  updateOrderStatus,
  getWhatsAppStats,
  markConversationAsRead,
  WhatsAppConversation,
  WhatsAppOrder,
} from '../services/whatsappService';

interface Stats {
  totalConversations: number;
  activeConversations: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
}

const WhatsAppManager = () => {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null);
  const [activeTab, setActiveTab] = useState<'conversations' | 'orders' | 'stats'>('conversations');
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [conversationsData, ordersData, statsData] = await Promise.all([
          getConversations(),
          getOrders(),
          getWhatsAppStats(),
        ]);

        setConversations(conversationsData);
        setOrders(ordersData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Recargar cada 5 segundos
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectConversation = (conversation: WhatsAppConversation) => {
    setSelectedConversation(conversation);
    markConversationAsRead(conversation.id);
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyMessage.trim()) return;

    try {
      setLoading(true);
      await addMessage(selectedConversation.id, 'admin', replyMessage, 'text');
      setReplyMessage('');

      // Recargar conversación
      const updatedConversations = await getConversations();
      setConversations(updatedConversations);

      // Actualizar conversación seleccionada
      const updated = updatedConversations.find((c) => c.id === selectedConversation.id);
      if (updated) setSelectedConversation(updated);
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: WhatsAppOrder['status']) => {
    try {
      setLoading(true);
      await updateOrderStatus(orderId, newStatus);

      const updatedOrders = await getOrders();
      setOrders(updatedOrders);

      const updatedStats = await getWhatsAppStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <span>💬</span> Gestor de WhatsApp
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'conversations'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-600'
          }`}
        >
          Conversaciones ({conversations.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'orders'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-600'
          }`}
        >
          Órdenes ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'stats'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-600'
          }`}
        >
          Estadísticas
        </button>
      </div>

      {/* Conversaciones Tab */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-3 gap-4 h-96">
          {/* Lista de conversaciones */}
          <div className="border rounded-lg bg-white overflow-y-auto">
            <div className="sticky top-0 bg-slate-50 p-3 border-b">
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>

            {conversations.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No hay conversaciones aún
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-3 border-b text-left hover:bg-slate-50 transition ${
                    selectedConversation?.id === conv.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{conv.clientName}</p>
                      <p className="text-xs text-slate-500">{conv.clientPhone}</p>
                      <p className="text-xs text-slate-600 truncate mt-1">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat actual */}
          {selectedConversation ? (
            <div className="col-span-2 border rounded-lg bg-white flex flex-col">
              {/* Header */}
              <div className="p-4 border-b bg-slate-50">
                <h3 className="font-semibold">{selectedConversation.clientName}</h3>
                <p className="text-sm text-slate-600">{selectedConversation.clientPhone}</p>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          msg.sender === 'admin'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {msg.timestamp && new Date(msg.timestamp.toDate?.() || msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-8">No hay mensajes</div>
                )}
              </div>

              {/* Input de respuesta */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={loading || !replyMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    {loading ? '...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="col-span-2 border rounded-lg bg-white flex items-center justify-center text-slate-400">
              Selecciona una conversación para comenzar
            </div>
          )}
        </div>
      )}

      {/* Órdenes Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No hay órdenes</div>
          ) : (
            orders.map((order) => (
              <article key={order.id} className="bg-white border rounded-lg p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Cliente</p>
                    <p className="font-semibold">{order.clientName}</p>
                    <p className="text-sm text-slate-600">{order.clientPhone}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Productos</p>
                    <p className="font-semibold">{order.items.length} items</p>
                    <p className="text-sm text-slate-600">Total: ${order.total}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Dirección</p>
                    <p className="text-sm">{order.deliveryAddress}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateOrderStatus(order.id, e.target.value as WhatsAppOrder['status'])
                      }
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="in_preparation">En preparación</option>
                      <option value="in_delivery">En entrega</option>
                      <option value="delivered">Entregada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>

                    <button
                      className="text-xs text-indigo-600 hover:underline"
                      onClick={() => {
                        alert('Detalles de la orden:\n' + JSON.stringify(order.items, null, 2));
                      }}
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Estadísticas Tab */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-3 gap-4">
          <article className="rounded-xl bg-white p-4 shadow-sm border">
            <h3 className="text-sm text-slate-500">Total Conversaciones</h3>
            <p className="text-2xl font-semibold">{stats.totalConversations}</p>
            <p className="text-xs text-indigo-600 mt-1">
              {stats.activeConversations} activas
            </p>
          </article>

          <article className="rounded-xl bg-white p-4 shadow-sm border">
            <h3 className="text-sm text-slate-500">Órdenes Pendientes</h3>
            <p className="text-2xl font-semibold">{stats.pendingOrders}</p>
            <p className="text-xs text-orange-600 mt-1">
              De {stats.totalOrders} total
            </p>
          </article>

          <article className="rounded-xl bg-white p-4 shadow-sm border">
            <h3 className="text-sm text-slate-500">Ingresos (Entregadas)</h3>
            <p className="text-2xl font-semibold">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">
              {stats.deliveredOrders} órdenes entregadas
            </p>
          </article>

          {/* Tabla de órdenes por estado */}
          <article className="col-span-3 rounded-xl bg-white p-4 shadow-sm border">
            <h3 className="font-semibold mb-3">Resumen de Órdenes</h3>
            <div className="grid grid-cols-6 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                <p className="text-xs text-slate-600">Pendientes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalOrders - stats.pendingOrders - stats.deliveredOrders}
                </p>
                <p className="text-xs text-slate-600">En Proceso</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
                <p className="text-xs text-slate-600">Entregadas</p>
              </div>
              <div className="col-span-3">
                <div className="bg-slate-100 rounded-lg p-4">
                  <p className="text-xs text-slate-600 mb-2">Tasa de Conversión</p>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${stats.totalConversations > 0
                          ? (stats.totalOrders / stats.totalConversations) * 100
                          : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs font-semibold mt-2">
                    {stats.totalConversations > 0
                      ? ((stats.totalOrders / stats.totalConversations) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-semibold mb-2">⚙️ Configuración Requerida</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Backend con webhooks de Twilio configurado</li>
          <li>Número de WhatsApp Business verificado en Twilio</li>
          <li>Credenciales de Twilio configuradas en variables de entorno</li>
          <li>Servidor de backend desplegado para recibir mensajes</li>
        </ul>
      </div>
    </section>
  );
};

export default WhatsAppManager;
