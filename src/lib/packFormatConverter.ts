import { z } from "zod";
import { MicroserviceDef, QuestionDef, QuestionOption } from "@/types/packs";

// Authoring format schema (your JSON format)
const AuthoringOption = z.object({
  value: z.string(),
  label: z.string()
});

const AuthoringShowIf = z.object({
  question: z.string(),
  equals_any: z.array(z.string()).min(1)
});

const AuthoringQuestion = z.object({
  id: z.string(),
  type: z.enum(["single_select", "multi_select", "text", "number", "asset_upload"]),
  label: z.string(),
  options: z.array(AuthoringOption).optional(),
  required: z.boolean().optional().default(false),
  priority: z.enum(["core", "supporting"]).optional().default("supporting"),
  show_if: z.array(AuthoringShowIf).optional(),
  accept: z.array(z.string()).optional(),
  max_files: z.number().optional()
});

const AuthoringPack = z.object({
  pack_slug: z.string(),
  version: z.number().default(1),
  status: z.string(),
  is_active: z.boolean().default(false),
  question_source: z.string(),
  priority_level: z.string().optional(),
  ibiza_specific: z.boolean().optional().default(false),
  applies_to: z.object({
    category: z.string().optional(),
    subcategory: z.string().optional(),
    microservice: z.string().optional(),
    microservice_id: z.string().optional(),
    micro_slug: z.string().optional()
  }),
  questions: z.array(AuthoringQuestion),
  a_b_test: z.any().optional(),
  metrics_defaults: z.any().optional()
});

export type AuthoringPackT = z.infer<typeof AuthoringPack>;

// Utility to generate i18n keys
const toI18nKey = (s: string) =>
  s.toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);

// Map authoring types to DB types
const mapType = (authoringType: string): QuestionDef["type"] => {
  switch (authoringType) {
    case "single_select": return "single";
    case "multi_select": return "multi";
    case "asset_upload": return "text"; // Will handle in renderer
    case "text": return "text";
    case "number": return "number";
    default: return "text";
  }
};

// Transform a single question
function transformQuestion(q: z.infer<typeof AuthoringQuestion>): QuestionDef {
  const i18nKey = `q.${toI18nKey(q.label)}`;
  
  const options: QuestionOption[] | undefined = q.options?.map(o => ({
    value: o.value,
    i18nKey: `${i18nKey}.opt.${toI18nKey(o.label)}`,
    order: 0
  }));

  return {
    key: q.id,
    type: mapType(q.type),
    i18nKey,
    required: q.required ?? false,
    options,
    aiHint: q.label,
    // Store extended metadata
    visibility: q.show_if ? {
      anyOf: q.show_if.map(c => ({
        questionKey: c.question,
        equals: c.equals_any[0] // Simplified: take first value
      }))
    } : undefined
  } as QuestionDef & {
    meta?: {
      priority?: "core" | "supporting";
      accept?: string[];
      max_files?: number;
      authoring_type?: string;
      label?: string;
    };
  } & {
    meta: {
      priority: "core" | "supporting";
      accept?: string[];
      max_files?: number;
      authoring_type: string;
      label: string;
    };
  };
}

/**
 * Convert authoring format to existing MicroserviceDef format
 * Preserves all metadata in content.meta
 */
export function convertAuthoringPackToMicroserviceDef(
  authoringPack: unknown
): MicroserviceDef & {
  meta?: {
    ibiza_specific?: boolean;
    priority_level?: string;
    a_b_test?: unknown;
    metrics_defaults?: unknown;
    authoring_pack_slug?: string;
    micro_slug?: string;
    status?: string;
    source?: string;
    is_active?: boolean;
    version?: number;
  };
} {
  const auth = AuthoringPack.parse(authoringPack);

  const questions = auth.questions.map(q => {
    const baseQ = transformQuestion(q);
    return {
      ...baseQ,
      meta: {
        priority: q.priority ?? "supporting",
        accept: q.accept,
        max_files: q.max_files,
        authoring_type: q.type,
        label: q.label
      }
    } as any;
  });

  return {
    id: crypto.randomUUID(),
    category: auth.applies_to.category || "",
    name: auth.applies_to.microservice || auth.pack_slug,
    slug: auth.applies_to.micro_slug || auth.pack_slug,
    i18nPrefix: auth.pack_slug.replace(/-/g, "."),
    questions,
    meta: {
      ibiza_specific: auth.ibiza_specific,
      priority_level: auth.priority_level,
      a_b_test: auth.a_b_test,
      metrics_defaults: auth.metrics_defaults,
      authoring_pack_slug: auth.pack_slug,
      micro_slug: auth.applies_to.micro_slug || auth.pack_slug,
      status: auth.status,
      source: auth.question_source,
      is_active: auth.is_active,
      version: auth.version
    }
  };
}

/**
 * Batch convert multiple authoring packs
 */
export function convertAuthoringPacks(authoringPacks: unknown[]): Array<MicroserviceDef & { meta?: any }> {
  return authoringPacks.map(pack => convertAuthoringPackToMicroserviceDef(pack));
}
