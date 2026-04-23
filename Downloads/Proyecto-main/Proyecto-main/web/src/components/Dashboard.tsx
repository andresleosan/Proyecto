const Dashboard = () => {
  const stats = [
    { title: 'Ventas Hoy', value: '$5.200' },
    { title: 'Ventas Semana', value: '$28.900' },
    { title: 'Productos más vendidos', value: 'Arroz, Leche, Pan' },
    { title: 'Ingresos Totales', value: '$89.100' }
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Panel de Control</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((card) => (
          <article key={card.title} className="rounded-xl bg-white p-4 shadow-sm border">
            <h3 className="text-sm text-slate-500">{card.title}</h3>
            <p className="text-xl font-semibold">{card.value}</p>
          </article>
        ))}
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm border">
        <h3 className="font-semibold mb-2">Gráfica de ventas (dummy)</h3>
        <div className="h-52 bg-slate-100 rounded"></div>
      </div>
    </section>
  );
};

export default Dashboard;
