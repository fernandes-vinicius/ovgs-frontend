"use client";

import { useState } from "react";
import { Plus } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useItens } from "../hooks/use-itens";
import { ItemFormDialog } from "./item-form-dialog";

export function ItensPage() {
  const { data: itens, isLoading, isError } = useItens();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Itens</h1>
          <p className="text-sm text-muted-foreground">
            Itens previamente cadastrados que podem ser associados a ordens de venda.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus />
          Novo item
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando itens…</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Não foi possível carregar os itens.</p>
      ) : !itens?.length ? (
        <p className="text-sm text-muted-foreground">Nenhum item cadastrado ainda.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Unidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {item.sku}
                </TableCell>
                <TableCell className="font-medium">{item.nome}</TableCell>
                <TableCell className="text-muted-foreground">{item.unidade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ItemFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
