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

  it("カテゴリを1件、タグを複数選択できる", () => {
    render(
      <MemoForm
        categories={[
          { colorKey: "blue", id: "category-1", memoCount: 0, name: "仕事" },
        ]}
        tags={[
          { id: "tag-1", memoCount: 0, name: "重要" },
          { id: "tag-2", memoCount: 0, name: "確認" },
        ]}
      />,
    );

    expect(screen.getByRole("combobox", { name: "カテゴリ" })).toHaveValue("");
    expect(screen.getByRole("option", { name: "仕事" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "#重要" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "#確認" })).not.toBeChecked();
    expect(screen.getByRole("link", { name: "カテゴリを管理" })).toHaveAttribute(
      "href",
      "/categories",
    );
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

  it("CommonMarkとGFMの対応範囲とHTMLを実行しないことを案内する", () => {
    render(<MemoForm />);

    expect(
      screen.getByText(
        "CommonMarkとGitHub Flavored Markdownに対応し、Enterで改行できます。安全のためHTMLは実行されません。",
      ),
    ).toBeInTheDocument();
  });

  it("Enterによる単一改行をプレビューでも改行する", () => {
    render(<MemoForm />);

    fireEvent.change(screen.getByRole("textbox", { name: "本文" }), {
      target: { value: "1行目\n2行目" },
    });

    const preview = screen.getByRole("region", { name: "Markdownプレビュー" });
    const paragraph = preview.querySelector(".markdown-preview p");
    expect(paragraph).toHaveTextContent("1行目");
    expect(paragraph).toHaveTextContent("2行目");
    expect(paragraph?.querySelector("br")).toBeInTheDocument();
  });

  it("CommonMarkとGFMの主要なブロック・インライン記法をプレビューする", () => {
    render(<MemoForm />);

    fireEvent.change(screen.getByRole("textbox", { name: "本文" }), {
      target: {
        value: [
          "# 見出し1",
          "## 見出し2",
          "### 見出し3",
          "#### 見出し4",
          "##### 見出し5",
          "###### 見出し6",
          "",
          "*斜体* **太字** ~~取り消し線~~ `インラインコード`  ",
          "改行後",
          "",
          "> 引用",
          ">",
          "> > 入れ子の引用",
          "",
          "- 箇条書き",
          "  - 入れ子",
          "",
          "1. 番号付き",
          "2. 2番目",
          "",
          "- [x] 完了",
          "- [ ] 未完了",
          "",
          "[リンク](https://example.com)",
          "",
          "![画像の代替テキスト](/favicon.ico)",
          "",
          "---",
          "",
          "| 左 | 右 |",
          "| --- | ---: |",
          "| A | B |",
          "",
          "```ts",
          'const message = "code";',
          "```",
          "",
          "脚注[^1]",
          "",
          "[^1]: 脚注の内容",
        ].join("\n"),
      },
    });

    const preview = screen.getByRole("region", { name: "Markdownプレビュー" });
    for (let level = 1; level <= 6; level += 1) {
      expect(preview.querySelector(`.markdown-preview h${level}`)).toHaveTextContent(
        `見出し${level}`,
      );
    }
    expect(preview.querySelector("em")).toHaveTextContent("斜体");
    expect(preview.querySelector("strong")).toHaveTextContent("太字");
    expect(preview.querySelector("del")).toHaveTextContent("取り消し線");
    expect(preview.querySelector("blockquote blockquote")).toHaveTextContent("入れ子の引用");
    expect(preview.querySelector("ul ul")).toHaveTextContent("入れ子");
    expect(preview.querySelector("ol")).toHaveTextContent("番号付き");
    expect(preview.querySelectorAll('input[type="checkbox"]')).toHaveLength(2);
    expect(preview.querySelector('a[href="https://example.com"]')).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(preview.querySelector('img[src="/favicon.ico"]')).toHaveAttribute(
      "alt",
      "画像の代替テキスト",
    );
    expect(preview.querySelector("hr")).toBeInTheDocument();
    expect(preview.querySelector("table")).toHaveTextContent("A");
    expect(preview.querySelector("pre code")).toHaveTextContent('const message = "code";');
    expect(preview.querySelector("br")).toBeInTheDocument();
    expect(preview.querySelector("section[data-footnotes]")).toHaveTextContent("脚注の内容");
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
