import { z } from "zod";

/**
 * Primitivas de contrato (CLI-C05).
 * - IDs opacos y tenantId no forzado a UUID.
 * - Dinero como string decimal con currency/exponente; nunca float.
 * - Fechas ISO-8601 con offset explícito.
 */
export const ISO_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?(Z|[+-]\d{2}:\d{2})$/;

export const IsoDateTime = z
  .string()
  .refine((v) => ISO_WITH_OFFSET.test(v), "fecha ISO-8601 con offset requerida");

export const OpaqueRef = z
  .string()
  .min(3)
  .max(200)
  .regex(/^[a-z][a-z0-9_]*_[A-Za-z0-9_-]{2,}$/u, "ID opaco con prefijo");

export const TenantId = z.string().min(1).max(128);

export const Locale = z.enum(["es", "en", "fr"]);

export const Currency = z.string().regex(/^[A-Z]{3}$/);

export const Money = z
  .object({
    amount: z.string().regex(/^-?\d{1,18}(\.\d{1,6})?$/, "decimal string"),
    currency: Currency,
    exponent: z.number().int().min(0).max(6),
  })
  .superRefine((value, ctx) => {
    const fraction = value.amount.split(".")[1] ?? "";
    if (fraction.length > value.exponent) {
      ctx.addIssue({
        code: "custom",
        message: "más decimales que el exponente declarado",
        path: ["amount"],
      });
    }
  });

export type MoneyValue = z.infer<typeof Money>;

/** Rechazo de campos extra: el contrato es cerrado, no tolerante. */
export const strictObject = <Shape extends z.ZodRawShape>(shape: Shape) =>
  z.object(shape).strict();

export function formatMoney(value: MoneyValue): string {
  return `${value.amount} ${value.currency}`;
}

/**
 * Reglas compartidas por todos los DTO: schemaVersion propia del servicio,
 * separada de la literal nativa del padre (SystemEvent.schemaVersion "1.0").
 */
export const SERVICE_SCHEMA_VERSION = 1 as const;
