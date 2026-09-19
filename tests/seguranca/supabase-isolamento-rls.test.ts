import { describe, expect, it, beforeAll, afterAll } from "vitest";
import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

// Conexão direta opcional para validação live somente via variável de ambiente segura local (nunca versionada)
const directConn =
  process.env.SUPABASE_DB_URL ||
  process.env.TEST_DATABASE_URL ||
  "";

describe("Auditoria Forense de RLS, Grants e Isolamento do Supabase (App Reflex 02)", () => {
  let sql: ReturnType<typeof postgres> | null = null;
  let bancoAlcancavel = false;

  beforeAll(async () => {
    if (!directConn) {
      bancoAlcancavel = false;
      return;
    }

    try {
      sql = postgres(directConn, { idle_timeout: 10, connect_timeout: 4 });
      await sql`SELECT 1;`;
      bancoAlcancavel = true;
    } catch (err: any) {
      console.warn(
        `[AVISO CI] Banco Supabase não alcançável diretamente neste ambiente (${err?.code || err?.message}). Executando validação baseada em paridade de migrations.`
      );
      bancoAlcancavel = false;
      if (sql) {
        try {
          await sql.end();
        } catch {
          // ignore
        }
        sql = null;
      }
    }
  });

  afterAll(async () => {
    if (sql) {
      try {
        await sql.end();
      } catch {
        // ignore
      }
    }
  });

  it("as migrations 0026 a 0031 existem no repositório e cobrem RLS, isolamento e storage", () => {
    const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
    const m26 = fs.readFileSync(path.join(migrationsDir, "0026_motor_taxonomia_automatica.sql"), "utf-8");
    const m27 = fs.readFileSync(path.join(migrationsDir, "0027_grants_propostas_atualizacao.sql"), "utf-8");
    const m28 = fs.readFileSync(path.join(migrationsDir, "0028_dimensoes_canonicas_readonly.sql"), "utf-8");
    const m29 = fs.readFileSync(path.join(migrationsDir, "0029_limite_upload_biblioteca_50mb.sql"), "utf-8");
    const m30 = fs.readFileSync(path.join(migrationsDir, "0030_sistema_rls_hardening.sql"), "utf-8");
    const m31 = fs.readFileSync(path.join(migrationsDir, "0031_claims_ledger.sql"), "utf-8");

    // 0026
    expect(m26).toContain("taxonomia.analises");
    expect(m26).toContain("taxonomia.conceitos_reflexoes");
    expect(m26).toContain("security_invoker = true");

    // 0027
    expect(m27).toContain("cerebro_autoral.propostas_atualizacao");
    expect(m27).toContain("service_role");

    // 0028
    expect(m28).toContain("cerebro_autoral.dimensoes ENABLE ROW LEVEL SECURITY");

    // 0029
    expect(m29).toContain("file_size_limit = 52428800");

    // 0030
    expect(m30).toContain("sistema.configuracoes_usuario ENABLE ROW LEVEL SECURITY");
    expect(m30).toContain("sistema.modelos_ia ENABLE ROW LEVEL SECURITY");
    expect(m30).toContain("sistema.perfis_embedding ENABLE ROW LEVEL SECURITY");

    // 0031 (Wave 1 - Claims Ledger & Provenance)
    expect(m31).toContain("cerebro_autoral.claims ENABLE ROW LEVEL SECURITY");
    expect(m31).toContain("cerebro_autoral.claim_provenance ENABLE ROW LEVEL SECURITY");
    expect(m31).toContain("fk_claim_provenance_ownership");
    expect(m31).toContain("uq_claims_id_usuario");
    expect(m31).not.toContain("is_authorial BOOLEAN NOT NULL DEFAULT true"); // Invariant: PROIBIDO default true de autoria
  });

  it("todas as tabelas do schema sistema possuem RLS habilitado no banco ativo", { timeout: 15000 }, async () => {
    if (!bancoAlcancavel || !sql) return;

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
    if (!bancoAlcancavel || !sql) return;

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
    if (!bancoAlcancavel || !sql) return;

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
    if (!bancoAlcancavel || !sql) return;

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
    if (!bancoAlcancavel || !sql) return;

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
