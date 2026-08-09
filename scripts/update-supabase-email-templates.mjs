import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function requireEnvironmentVariable(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const templateDirectory = path.join(repositoryRoot, "supabase", "templates");

const [confirmationContent, magicLinkContent] = await Promise.all([
  readFile(path.join(templateDirectory, "confirmation.html"), "utf8"),
  readFile(path.join(templateDirectory, "magic-link.html"), "utf8"),
]);

const projectRef = requireEnvironmentVariable("SUPABASE_PROJECT_REF");
const accessToken = requireEnvironmentVariable("SUPABASE_ACCESS_TOKEN");
const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  body: JSON.stringify({
    mailer_subjects_confirmation: "TagNoteへようこそ — メールアドレスをご確認ください",
    mailer_subjects_magic_link: "TagNoteへのサインインリンク",
    mailer_templates_confirmation_content: confirmationContent,
    mailer_templates_magic_link_content: magicLinkContent,
  }),
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  method: "PATCH",
});

if (!response.ok) {
  const message = await response.text();
  throw new Error(`Supabase email template update failed (${response.status}): ${message}`);
}

console.log("Supabaseのサインアップ／サインインメールをTagNote向けに更新しました。");
