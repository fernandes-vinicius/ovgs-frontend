"use client";

import { useMemo, useState } from "react";
import { useTiposTransporte } from "@/features/tipos-transporte/presentation/hooks/use-tipos-transporte";
import { Pencil, Plus, Search } from "@/shared/components/icons";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/list-state";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { Cliente } from "../../domain/cliente";
import { useClientes } from "../hooks/use-clientes";
import { ClienteFormDialog } from "./cliente-form-dialog";

export function ClientesPage() {
  const { data: clientes, isLoading, isError } = useClientes();
  const { data: tiposTransporte } = useTiposTransporte();
  const [busca, setBusca] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | undefined>(undefined);

  const tipoNomePorId = useMemo(() => {
    const map = new Map<string, string>();
    for (const tipo of tiposTransporte ?? []) map.set(tipo.id, tipo.nome);
    return map;
  }, [tiposTransporte]);

  const clientesFiltrados = useMemo(() => {
    if (!clientes) return [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.documento.toLowerCase().includes(termo),
    );
  }, [clientes, busca]);

  function abrirCriacao() {
    setClienteEmEdicao(undefined);
    setDialogOpen(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setClienteEmEdicao(cliente);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Cadastro de clientes e dos tipos de transporte que cada um está autorizado a utilizar.
          </p>
        </div>
        <Button onClick={abrirCriacao}>
          <Plus />
          Novo cliente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por nome ou documento"
          className="pl-8"
        />
      </div>

      {isLoading ? (
        <LoadingState message="Carregando clientes…" />
      ) : isError ? (
        <ErrorState message="Não foi possível carregar os clientes." />
      ) : clientesFiltrados.length === 0 ? (
        <EmptyState
          message={
            clientes?.length
              ? "Nenhum cliente encontrado para essa busca."
              : "Nenhum cliente cadastrado ainda."
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Transportes autorizados</TableHead>
              <TableHead className="w-px" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientesFiltrados.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">{cliente.nome}</TableCell>
                <TableCell className="text-muted-foreground">{cliente.documento}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {cliente.tiposTransporteAutorizados.map((tipoId) => (
                      <Badge key={tipoId} variant="secondary">
                        {tipoNomePorId.get(tipoId) ?? tipoId}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" onClick={() => abrirEdicao(cliente)}>
                    <Pencil />
                    <span className="sr-only">Editar {cliente.nome}</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ClienteFormDialog open={dialogOpen} onOpenChange={setDialogOpen} cliente={clienteEmEdicao} />
    </div>
  );
}
