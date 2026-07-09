"use client";

import { useState } from "react";
import { Pencil, Plus } from "@/shared/components/icons";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/list-state";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { TipoTransporte } from "../../domain/tipo-transporte";
import { useTiposTransporte } from "../hooks/use-tipos-transporte";
import { TipoTransporteFormDialog } from "./tipo-transporte-form-dialog";

export function TiposTransportePage() {
  const { data: tiposTransporte, isLoading, isError } = useTiposTransporte();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoEmEdicao, setTipoEmEdicao] = useState<TipoTransporte | undefined>(undefined);

  function abrirCriacao() {
    setTipoEmEdicao(undefined);
    setDialogOpen(true);
  }

  function abrirEdicao(tipo: TipoTransporte) {
    setTipoEmEdicao(tipo);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Tipos de transporte</h1>
          <p className="text-sm text-muted-foreground">
            Modalidades de transporte disponíveis para autorização de clientes e criação de ordens
            de venda.
          </p>
        </div>
        <Button onClick={abrirCriacao}>
          <Plus />
          Novo tipo de transporte
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Carregando tipos de transporte…" />
      ) : isError ? (
        <ErrorState message="Não foi possível carregar os tipos de transporte." />
      ) : !tiposTransporte?.length ? (
        <EmptyState message="Nenhum tipo de transporte cadastrado ainda." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-px" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiposTransporte.map((tipo) => (
              <TableRow key={tipo.id}>
                <TableCell className="font-medium">{tipo.nome}</TableCell>
                <TableCell>
                  <Badge variant={tipo.ativo ? "default" : "outline"}>
                    {tipo.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" onClick={() => abrirEdicao(tipo)}>
                    <Pencil />
                    <span className="sr-only">Editar {tipo.nome}</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TipoTransporteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoTransporte={tipoEmEdicao}
      />
    </div>
  );
}
