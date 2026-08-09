import { fireEvent, render, screen } from "@testing-library/react";
import { MemoForm } from "../../app/memos/new/memo-form";

jest.mock("../../app/memos/new/actions", () => ({
  createMemoAction: jest.fn(),
}));

describe("MemoForm", () => {
  it("タイトルとMarkdown本文を入力でき、空のプレビュー状態を表示する", () => {
    render(<MemoForm />);

    expect(screen.getByRole("textbox", { name: "タイトル" })).toHaveAttribute(
      "maxlength",
      "200",
    );
    expect(screen.getByRole("textbox", { name: "本文" })).toHaveAttribute(
      "maxlength",
      "100000",
    );
    expect(screen.getByText("本文を入力すると、ここにプレビューが表示されます。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "メモを保存" })).toBeInTheDocument();
  });

  it("入力中のGitHub Flavored Markdownを意味のある要素でプレビューする", () => {
    render(<MemoForm />);

    fireEvent.change(screen.getByRole("textbox", { name: "本文" }), {
      target: {
        value: "# 見出し\n\n**大切**な内容\n\n- [x] 完了\n\n| 項目 | 値 |\n| --- | --- |\n| A | B |",
      },
    });

    const preview = screen.getByRole("region", { name: "Markdownプレビュー" });
    expect(preview).toContainElement(screen.getByRole("heading", { level: 1, name: "見出し" }));
    expect(preview.querySelector("strong")).toHaveTextContent("大切");
    expect(preview.querySelector('input[type="checkbox"]')).toBeChecked();
    expect(preview.querySelector("table")).toHaveTextContent("項目");
  });

  it("生HTMLと危険なURLをプレビューへ出力しない", () => {
    render(<MemoForm />);

    fireEvent.change(screen.getByRole("textbox", { name: "本文" }), {
      target: {
        value: '<img src=x onerror="alert(1)">\n\n[危険](javascript:alert(1))',
      },
    });

    const preview = screen.getByRole("region", { name: "Markdownプレビュー" });
    expect(preview.querySelector("img")).not.toBeInTheDocument();
    expect(preview).toHaveTextContent("危険");
    expect(preview.querySelector("a")).not.toBeInTheDocument();
  });
});
