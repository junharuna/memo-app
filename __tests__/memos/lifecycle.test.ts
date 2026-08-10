import {
  getMemoLifecycle,
  isMemoEditable,
  type MemoLifecycleInput,
} from "@/lib/memos/lifecycle";

function lifecycleInput(
  overrides: Partial<MemoLifecycleInput> = {},
): MemoLifecycleInput {
  return {
    archivedAt: null,
    trashedAt: null,
    ...overrides,
  };
}

describe("メモのライフサイクル", () => {
  it("日時からactive、archived、trashedを一意に判定する", () => {
    expect(getMemoLifecycle(lifecycleInput())).toBe("active");
    expect(
      getMemoLifecycle(
        lifecycleInput({ archivedAt: "2026-08-10T01:00:00.000Z" }),
      ),
    ).toBe("archived");
    expect(
      getMemoLifecycle(
        lifecycleInput({ trashedAt: "2026-08-10T02:00:00.000Z" }),
      ),
    ).toBe("trashed");
  });

  it("ゴミ箱を最優先し、ゴミ箱以外だけを編集可能にする", () => {
    const inconsistent = lifecycleInput({
      archivedAt: "2026-08-10T01:00:00.000Z",
      trashedAt: "2026-08-10T02:00:00.000Z",
    });

    expect(getMemoLifecycle(inconsistent)).toBe("trashed");
    expect(isMemoEditable(inconsistent)).toBe(false);
    expect(
      isMemoEditable(
        lifecycleInput({ archivedAt: "2026-08-10T01:00:00.000Z" }),
      ),
    ).toBe(true);
  });
});
