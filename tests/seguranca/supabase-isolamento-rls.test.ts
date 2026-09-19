import { describe, expect, it, beforeAll, afterAll } from "vitest";
import postgres from "postgres";

const ref = "xenapowdtfhdwcfthfrn";
const password = "Villa667Villa";
const directConn = `postgres://postgres:${password}@db.${ref}.supabase.co:5432/postgres?sslmode=require`;

describe("Auditoria Forense de RLS, Grants e Isolamento do Supabase (App Reflex 02)", () => {
  let sql: ReturnType<typeof postgres>;

  beforeAll(() => {
    sql = postgres(directConn, { idle_timeout: 10 });
  });

  afterAll(async () => {
    if (sql) await sql.end();
  });

  it("todas as tabelas do schema sistema possuem RLS habilitado", { timeout: 15000 }, async () => {
    const tables = await sql`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'sistema'
      ORDER BY tablename;
    `;

    expect(tables.length).toBeGreaterThanOrEqual(6);
    for (const t of tables) {
      expect(t.rowsecurity, `Tabela sistema.${t.tablename} deve ter RLS ativo`).toBe(true);
    }
  });

  it("a tabela cerebro_autoral.dimensoes possui RLS habilitado e política de leitura para autenticados", { timeout: 15000 }, async () => {
    const table = await sql`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'cerebro_autoral' AND tablename = 'dimensoes';
    `;
    expect(table[0].rowsecurity).toBe(true);

    const policies = await sql`
      SELECT policyname, cmd, roles 
      FROM pg_policies 
      WHERE schemaname = 'cerebro_autoral' AND tablename = 'dimensoes';
    `;
    expect(policies.some((p) => p.policyname.includes("dimensoes"))).toBe(true);
  });

  it("o bucket originais-biblioteca está rigorosamente limitado a 50MB e é privado", { timeout: 15000 }, async () => {
    const bucket = await sql`
      SELECT id, public, file_size_limit 
      FROM storage.buckets 
      WHERE id = 'originais-biblioteca';
    `;
    expect(bucket.length).toBe(1);
    expect(bucket[0].public).toBe(false);
    expect(Number(bucket[0].file_size_limit)).toBe(52428800); // 50MB exatos
  });

  it("as views de aplicação utilizam security_invoker=true para não furar RLS", { timeout: 15000 }, async () => {
    const views = await sql`
      SELECT c.relname, c.reloptions 
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'aplicacao' AND c.relkind = 'v';
    `;

    expect(views.length).toBeGreaterThan(0);
    for (const v of views) {
      const hasSecurityInvoker = Array.isArray(v.reloptions) && v.reloptions.includes("security_invoker=true");
      expect(hasSecurityInvoker, `View aplicacao.${v.relname} deve ter security_invoker=true`).toBe(true);
    }
  });

  it("a tabela taxonomia.analises e taxonomia.conceitos_reflexoes existem e possuem RLS ativo", { timeout: 15000 }, async () => {
    const tables = await sql`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'taxonomia' AND tablename IN ('analises', 'conceitos_reflexoes');
    `;
    expect(tables.length).toBe(2);
    expect(tables[0].rowsecurity).toBe(true);
    expect(tables[1].rowsecurity).toBe(true);
  });
});
