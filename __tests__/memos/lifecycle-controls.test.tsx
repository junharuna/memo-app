import { render, screen } from "@testing-library/react";
import { MemoLifecycleControls } from "@/components/memos/memo-lifecycle-controls";

jest.mock("../../app/memos/[id]/lifecycle/actions", () => ({
  mutateMemoLifecycleAction: jest.fn(),
}));
jest.mock("../../app/memos/[id]/delete/actions", () => ({
  deleteMemoAction: jest.fn(),
}));

const memoId = "11111111-1111-4111-8111-111111111111";

it("通常メモではお気に入り、アーカイブ、ゴミ箱への移動を表示する", () => {
  render(
    <MemoLifecycleControls
      archivedAt={null}
      favoritedAt={null}
      memoId={memoId}
      memoTitle="通常メモ"
      trashedAt={null}
    />,
  );

  expect(screen.getByRole("button", { name: "お気に入りに追加" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "アーカイブ" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "ゴミ箱に移動" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "完全に削除" })).not.toBeInTheDocument();
});

it("アーカイブ済みメモではアーカイブ解除を表示する", () => {
  render(
    <MemoLifecycleControls
      archivedAt="2026-08-10T01:00:00.000Z"
      favoritedAt="2026-08-10T02:00:00.000Z"
      memoId={memoId}
      memoTitle="保管メモ"
      trashedAt={null}
    />,
  );

  expect(screen.getByRole("button", { name: "お気に入りから外す" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "アーカイブを解除" })).toBeInTheDocument();
});

it("ゴミ箱のメモでは復元と完全削除だけを表示する", () => {
  render(
    <MemoLifecycleControls
      archivedAt={null}
      favoritedAt={null}
      memoId={memoId}
      memoTitle="削除予定メモ"
      trashedAt="2026-08-10T03:00:00.000Z"
    />,
  );

  expect(screen.getByRole("button", { name: "メモを復元" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "完全に削除" })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "お気に入りに追加" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "ゴミ箱に移動" })).not.toBeInTheDocument();
});
