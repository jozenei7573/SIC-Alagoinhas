alter table usuarios_sistema enable row level security;
alter table contratos_patrimoniais enable row level security;
alter table contratos_log enable row level security;

drop policy if exists usuarios_select_own on usuarios_sistema;
create policy usuarios_select_own on usuarios_sistema for select using (auth.uid() = id);

drop policy if exists contratos_select_authenticated on contratos_patrimoniais;
create policy contratos_select_authenticated on contratos_patrimoniais for select using (auth.role() = 'authenticated');

drop policy if exists contratos_insert_authenticated on contratos_patrimoniais;
create policy contratos_insert_authenticated on contratos_patrimoniais for insert with check (auth.role() = 'authenticated');

drop policy if exists contratos_update_authenticated on contratos_patrimoniais;
create policy contratos_update_authenticated on contratos_patrimoniais for update using (auth.role() = 'authenticated');

drop policy if exists contratos_log_select_authenticated on contratos_log;
create policy contratos_log_select_authenticated on contratos_log for select using (auth.role() = 'authenticated');
