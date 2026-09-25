import type { FieldDef } from '../../core/schema';

/** Display label for an attribute value; null means unknown ("미확인"). */
export const fieldLabel = (f: FieldDef, v: string | number | null | undefined) =>
  v == null ? null : (f.values?.[String(v)] ?? String(v));
