/** @jest-environment node */

import { metadata as rootMetadata } from "@/app/layout";
import { metadata as signinMetadata } from "@/app/signin/page";
import { metadata as signupMetadata } from "@/app/signup/page";

it("TagNoteのアプリ名と説明をメタデータへ反映する", () => {
  expect(rootMetadata).toMatchObject({
    applicationName: "TagNote",
    description: "Markdownメモをカテゴリとタグで整理できる、シンプルなノートアプリ。",
    title: {
      default: "TagNote — メモを、タグで整える",
      template: "%s | TagNote",
    },
  });
  expect(signinMetadata.description).toBe("メールアドレスでTagNoteへサインインします。");
  expect(signupMetadata.description).toBe(
    "メールアドレスでTagNoteのアカウントを作成します。",
  );
});
