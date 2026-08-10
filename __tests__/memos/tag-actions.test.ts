/** @jest-environment node */

import {
  createTagAction,
  deleteTagAction,
  updateTagAction,
} from "../../app/tags/actions";
import { initialOrganizationState } from "../../lib/memos/organization-state";
import { createClient } from "../../lib/supabase/server";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("../../lib/supabase/server", () => ({ createClient: jest.fn() }));

const tagId = "22222222-2222-4222-8222-222222222222";
const mockCreateClient = jest.mocked(createClient);
const mockGetClaims = jest.fn();
const mockFrom = jest.fn();

function tagFormData(name: string) {
  const formData = new FormData();
  formData.set("name", name);
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

it("先頭#を除いたタグを所有者付きで作成する", async () => {
  const insert = jest.fn().mockResolvedValue({ error: null });
  mockFrom.mockReturnValue({ insert });

  await expect(
    createTagAction(initialOrganizationState, tagFormData(" #TypeScript ")),
  ).resolves.toMatchObject({ status: "success", submissionId: 1 });
  expect(insert).toHaveBeenCalledWith({
    name: "TypeScript",
    owner_id: "user-123",
  });
});

it("所有するタグの名前だけを更新する", async () => {
  const maybeSingle = jest.fn().mockResolvedValue({ data: { id: tagId }, error: null });
  const select = jest.fn(() => ({ maybeSingle }));
  const idEq = jest.fn(() => ({ select }));
  const ownerEq = jest.fn(() => ({ eq: idEq }));
  const update = jest.fn(() => ({ eq: ownerEq }));
  mockFrom.mockReturnValue({ update });

  await expect(
    updateTagAction(tagId, initialOrganizationState, tagFormData("C#")),
  ).resolves.toMatchObject({ status: "success" });
  expect(update).toHaveBeenCalledWith({ name: "C#" });
  expect(ownerEq).toHaveBeenCalledWith("owner_id", "user-123");
});

it("タグ削除は所有者とIDで限定する", async () => {
  const maybeSingle = jest.fn().mockResolvedValue({ data: { id: tagId }, error: null });
  const select = jest.fn(() => ({ maybeSingle }));
  const idEq = jest.fn(() => ({ select }));
  const ownerEq = jest.fn(() => ({ eq: idEq }));
  const deleteRows = jest.fn(() => ({ eq: ownerEq }));
  mockFrom.mockReturnValue({ delete: deleteRows });

  await expect(
    deleteTagAction(tagId, initialOrganizationState, new FormData()),
  ).resolves.toMatchObject({ status: "success" });
  expect(ownerEq).toHaveBeenCalledWith("owner_id", "user-123");
  expect(idEq).toHaveBeenCalledWith("id", tagId);
});
