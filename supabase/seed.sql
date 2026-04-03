-- Seed de datos de ejemplo para flujo completo
-- Nota: reemplaza los UUID de auth.users en profiles por usuarios reales creados en Supabase Auth.

insert into public.clients (id, nombre_completo, telefono, email, direccion, ciudad, observaciones)
values
  ('11111111-1111-1111-1111-111111111111', 'Maria Gonzalez', '+54 11 4000 0001', 'maria@demo.com', 'Av. Rivadavia 1200', 'Buenos Aires', 'Cliente frecuente'),
  ('22222222-2222-2222-2222-222222222222', 'Carlos Perez', '+54 11 4000 0002', 'carlos@demo.com', 'Belgrano 540', 'La Plata', 'Prefiere comunicacion por WhatsApp'),
  ('33333333-3333-3333-3333-333333333333', 'Lucia Romero', '+54 11 4000 0003', 'lucia@demo.com', 'Mitre 830', 'Quilmes', null)
on conflict (id) do nothing;

insert into public.projects (id, client_id, nombre_obra, direccion_instalacion, estado, fecha_visita, fecha_entrega_estimada, observaciones)
values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'Depto Caballito', 'Yerbal 300', 'en_produccion', '2026-03-12', '2026-04-15', 'Instalar blackout en dormitorios'),
  ('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222', 'Casa Norte', 'Maipu 200', 'cotizada', '2026-03-18', '2026-04-22', null),
  ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333333', 'Oficina Centro', 'Sarmiento 900', 'relevamiento', '2026-03-29', '2026-05-01', 'Pendiente aprobacion')
on conflict (id) do nothing;

insert into public.rooms (id, project_id, nombre_ambiente, observaciones)
values
  ('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 'Living', 'Ventanales grandes'),
  ('55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444441', 'Dormitorio principal', null),
  ('55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444442', 'Comedor', null)
on conflict (id) do nothing;

insert into public.measurements (id, room_id, tipo_producto, tipo_montaje, ancho, alto, cantidad, lado_mando, tela, color, observaciones)
values
  ('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', 'roller', 'interior', 2.40, 1.80, 2, 'derecho', 'Screen 5%', 'Gris', 'Con cenefa'),
  ('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555552', 'tradicional', 'exterior', 1.80, 2.20, 1, 'izquierdo', 'Blackout premium', 'Arena', null),
  ('66666666-6666-6666-6666-666666666663', '55555555-5555-5555-5555-555555555553', 'roller', 'interior', 2.10, 1.70, 1, 'derecho', 'Screen 1%', 'Blanco', null)
on conflict (id) do nothing;

insert into public.quotations (id, client_id, project_id, numero, fecha, estado, descuento, costo_instalacion, anticipo_requerido, observaciones)
values
  ('77777777-7777-7777-7777-777777777771', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444441', 'COT-2026-001', '2026-03-20', 'enviada', 15000, 20000, 50000, 'Incluye colocacion'),
  ('77777777-7777-7777-7777-777777777772', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444442', 'COT-2026-002', '2026-03-25', 'borrador', 0, 18000, 40000, null)
on conflict (id) do nothing;

insert into public.quotation_items (id, quotation_id, measurement_id, descripcion, cantidad, precio_unitario)
values
  ('88888888-8888-8888-8888-888888888881', '77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666661', 'Roller screen living', 2, 42000),
  ('88888888-8888-8888-8888-888888888882', '77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666662', 'Tradicional dormitorio', 1, 38000),
  ('88888888-8888-8888-8888-888888888883', '77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666663', 'Roller comedor', 1, 36000)
on conflict (id) do nothing;

insert into public.installations (id, project_id, fecha_programada, tecnico, estado, observaciones)
values
  ('99999999-9999-9999-9999-999999999991', '44444444-4444-4444-4444-444444444441', '2026-04-18', 'Juan tecnico', 'pendiente', 'Confirmar horario con cliente'),
  ('99999999-9999-9999-9999-999999999992', '44444444-4444-4444-4444-444444444442', '2026-04-24', 'Nicolas tecnico', 'reprogramada', 'Cliente pidio mover al viernes')
on conflict (id) do nothing;

insert into public.payments (id, quotation_id, fecha_pago, monto, medio_pago, estado, observaciones)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '77777777-7777-7777-7777-777777777771', '2026-03-28', 50000, 'transferencia', 'acreditado', 'Anticipo recibido'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '77777777-7777-7777-7777-777777777771', '2026-04-01', 25000, 'efectivo', 'acreditado', 'Pago parcial')
on conflict (id) do nothing;
