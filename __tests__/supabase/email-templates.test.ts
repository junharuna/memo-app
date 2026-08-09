/** @jest-environment node */

import { readFile } from "node:fs/promises";
import path from "node:path";

const repositoryRoot = path.resolve(__dirname, "../..");

async function readTemplate(name: string) {
  return readFile(path.join(repositoryRoot, "supabase", "templates", name), "utf8");
}

it.each([
  ["confirmation.html", "TagNoteへようこそ", "メールアドレスを確認する", "signed-up"],
  ["magic-link.html", "TagNoteへサインイン", "TagNoteへサインインする", "signed-in"],
])("%s は日本語のTagNoteメールとして安全な確認リンクを使う", async (file, heading, cta, toast) => {
  const template = await readTemplate(file);

  expect(template).toContain(`<title>${heading}</title>`);
  expect(template).toContain(heading);
  expect(template).toContain(cta);
  expect(template).toContain("{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=email");
  expect(template).toContain(`toast%3D${toast}`);
  expect(template).toContain("このメールに心当たりがない場合");
});

it("管理スクリプトに日本語の件名を定義する", async () => {
  const script = await readFile(
    path.join(repositoryRoot, "scripts", "update-supabase-email-templates.mjs"),
    "utf8",
  );

  expect(script).toContain("TagNoteへようこそ — メールアドレスをご確認ください");
  expect(script).toContain("TagNoteへのサインインリンク");
  expect(script).toContain("mailer_templates_confirmation_content");
  expect(script).toContain("mailer_templates_magic_link_content");
});
