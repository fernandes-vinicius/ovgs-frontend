import { z } from "zod";
import { ORDER_STATUSES } from "../domain/order-status";

export const createSalesOrderSchema = z.object({
  clienteId: z.string().min(1, "Cliente é obrigatório."),
  tipoTransporteId: z.string().min(1, "Tipo de transporte é obrigatório."),
  itens: z
    .array(
      z.object({
        itemId: z.string().min(1, "Item é obrigatório."),
        quantidade: z.number().positive("Quantidade deve ser maior que zero."),
      }),
    )
    .min(1, "A ordem de venda deve conter ao menos um item."),
});

export const changeOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const changeOrderTransportSchema = z.object({
  tipoTransporteId: z.string().min(1, "Tipo de transporte é obrigatório."),
});

export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>;
