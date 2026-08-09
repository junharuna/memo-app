/** @jest-environment node */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/20260809133220_create_memos.sql",
);

it("メモテーブルを所有権付きで作成しINSERTだけを許可する", () => {
  const sql = readFileSync(migrationPath, "utf8");

  expect(sql).toMatch(/create table public\.memos/i);
  expect(sql).toMatch(/owner_id uuid[^;]+references auth\.users/i);
  expect(sql).toMatch(/enable row level security/i);
  expect(sql).toMatch(/for insert[\s\S]+with check \(\(select auth\.uid\(\)\) = owner_id\)/i);
  expect(sql).toMatch(/grant insert \(owner_id, title, content\) on table public\.memos to authenticated/i);
  expect(sql).not.toMatch(/grant (select|update|delete)/i);
});
