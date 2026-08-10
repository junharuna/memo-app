/** @jest-environment node */

import { revalidatePath } from "next/cache";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "../../app/categories/actions";
import { initialOrganizationState } from "../../lib/memos/organization-state";
import { createClient } from "../../lib/supabase/server";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("../../lib/supabase/server", () => ({ createClient: jest.fn() }));

const categoryId = "11111111-1111-4111-8111-111111111111";
const mockCreateClient = jest.mocked(createClient);
const mockGetClaims = jest.fn();
const mockFrom = jest.fn();

function categoryFormData(name: string, colorKey = "blue") {
  const formData = new FormData();
  formData.set("name", name);
  formData.set("colorKey", colorKey);
  return formData;
}

beforeEach(() => {
  mockGetClaims.mockResolvedValue({
    data: { claims: { sub: "user-123" } },
    error: null,
  });
  mockCreateClient.mockResolvedValue({
    auth: { getClaims: mockGetClaims },
    from: mockFrom,
  } as never);
});

afterEach(() => jest.clearAllMocks());

it("所有者付きで正規化したカテゴリを作成する", async () => {
  const insert = jest.fn().mockResolvedValue({ error: null });
  mockFrom.mockReturnValue({ insert });

  await expect(
    createCategoryAction(
      initialOrganizationState,
      categoryFormData("  仕事  ", "orange"),
    ),
  ).resolves.toMatchObject({ status: "success", submissionId: 1 });
  expect(mockFrom).toHaveBeenCalledWith("categories");
  expect(insert).toHaveBeenCalledWith({
    color_key: "orange",
    name: "仕事",
    owner_id: "user-123",
  });
  expect(revalidatePath).toHaveBeenCalledWith("/categories");
  expect(revalidatePath).toHaveBeenCalledWith("/memos");
});

it("重複カテゴリを分かりやすい入力エラーにする", async () => {
  mockFrom.mockReturnValue({
    insert: jest.fn().mockResolvedValue({ error: { code: "23505" } }),
  });

  await expect(
    createCategoryAction(
      initialOrganizationState,
      categoryFormData("仕事"),
    ),
  ).resolves.toMatchObject({
    fieldErrors: { name: "同じ名前のカテゴリがすでにあります。" },
    status: "error",
  });
});

it("所有するカテゴリの名前と色だけを更新する", async () => {
  const maybeSingle = jest.fn().mockResolvedValue({
    data: { id: categoryId },
    error: null,
  });
  const select = jest.fn(() => ({ maybeSingle }));
  const idEq = jest.fn(() => ({ select }));
  const ownerEq = jest.fn(() => ({ eq: idEq }));
  const update = jest.fn(() => ({ eq: ownerEq }));
  mockFrom.mockReturnValue({ update });

  await expect(
    updateCategoryAction(
      categoryId,
      initialOrganizationState,
      categoryFormData("個人", "violet"),
    ),
  ).resolves.toMatchObject({ status: "success" });
  expect(update).toHaveBeenCalledWith({ color_key: "violet", name: "個人" });
  expect(ownerEq).toHaveBeenCalledWith("owner_id", "user-123");
  expect(idEq).toHaveBeenCalledWith("id", categoryId);
});

it("カテゴリ削除は所有者とIDで限定する", async () => {
  const maybeSingle = jest.fn().mockResolvedValue({
    data: { id: categoryId },
    error: null,
  });
  const select = jest.fn(() => ({ maybeSingle }));
  const idEq = jest.fn(() => ({ select }));
  const ownerEq = jest.fn(() => ({ eq: idEq }));
  const deleteRows = jest.fn(() => ({ eq: ownerEq }));
  mockFrom.mockReturnValue({ delete: deleteRows });

  await expect(
    deleteCategoryAction(categoryId, initialOrganizationState, new FormData()),
  ).resolves.toMatchObject({ status: "success" });
  expect(ownerEq).toHaveBeenCalledWith("owner_id", "user-123");
  expect(idEq).toHaveBeenCalledWith("id", categoryId);
});
