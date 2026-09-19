---
name: openai-reflex-supabase-safe
description: Safely inspect or change the App Reflex 02 Supabase project. Use for schema, SQL, RLS, Auth, Storage, RPCs, migrations, pgvector, advisors, permissions, data cleanup, or any bug whose cause may be in Supabase.
---

# OpenAI Reflex Supabase Safe

1. Load the official Supabase skill available in the current session.
2. Verify current Supabase docs/changelog when behavior may have changed.
3. Query the live schema before writing SQL.
4. Review ownership, RLS, grants, SECURITY DEFINER, triggers, and downstream callers.
5. Never expose secret/service-role credentials to browser code or repository files.
6. Test the intended change in the authorized environment.
7. Create a clean versioned migration only after the SQL is understood.
8. Run Supabase security/performance advisors after structural changes.
9. Verify the live schema and representative queries after the change.
10. Reconcile repository migration history with live migration ledgers before automated push/pull.
