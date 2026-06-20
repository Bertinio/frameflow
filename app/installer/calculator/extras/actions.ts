"use server";

import { getDraft as getSharedDraft, updateDraft as updateSharedDraft } from "../glass/actions";

export async function getDraft(draftId: string) {
  return getSharedDraft(draftId);
}

export async function updateDraft(draftId: string, formData: FormData) {
  return updateSharedDraft(draftId, formData);
}
