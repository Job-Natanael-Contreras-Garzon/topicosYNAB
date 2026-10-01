"use client";

import { useMemo, useState, useTransition } from "react";
import { approveTransactionsAction } from "@/actions/transactions";
import { Button } from "@/components/ui/Button";
import { formatCents } from "@/lib/money";
import { TransactionDialog } from "./TransactionDialog";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";

export interface TransactionRow {
  id: string;
  accountId: string;
  categoryId: string | null;
  date: string | Date;
  amountCents: number;
  payee: string;
  memo: string;
  approved: boolean;
  cleared: boolean;
  transferPairId: string | null;
  account: {
    id: string;
    name: string;
    onBudget: boolean;
    type: string;
  };
  category: {
    id: string;
    name: string;
    group: {
      id: string;
      name: string;
    };
  } | null;
}

interface AccountOption {
  id: string;
  name: string;
  onBudget: boolean;
}

interface CategoryGroupOption {
  id: string;
  name: string;
  categories: { id: string; name: string }[];
}

interface Props {
  transactions: TransactionRow[];
  accounts: AccountOption[];
  categoryGroups: CategoryGroupOption[];
  currency?: string;
  showAccountColumn?: boolean;
  defaultAccountId?: string;
}

export function TransactionTable({
  transactions,
  accounts,
  categoryGroups,
  currency = "BOB",
  showAccountColumn = false,
  defaultAccountId,
}: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unapproved" | "approved">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Modales
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<any | null>(null);

  // Filtrado reactivo en el cliente
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Estado
      if (statusFilter === "unapproved" && t.approved) return false;
      if (statusFilter === "approved" && !t.approved) return false;

      // Categoría
      if (categoryFilter !== "all") {
        if (categoryFilter === "income" && t.categoryId !== null) return false;
        if (categoryFilter !== "income" && t.categoryId !== categoryFilter) return false;
      }

      // Búsqueda
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesPayee = t.payee.toLowerCase().includes(q);
        const matchesMemo = t.memo.toLowerCase().includes(q);
        const matchesCategory = t.category?.name.toLowerCase().includes(q);
        const matchesAccount = t.account.name.toLowerCase().includes(q);
        if (!matchesPayee && !matchesMemo && !matchesCategory && !matchesAccount) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, statusFilter, categoryFilter, search]);

  const unapprovedCount = useMemo(
    () => transactions.filter((t) => !t.approved).length,
    [transactions]
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      await approveTransactionsAction(selectedIds);
      setSelectedIds([]);
    });
  };

  const handleSingleApprove = (id: string) => {
    startTransition(async () => {
      await approveTransactionsAction([id]);
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    });
  };

  const openEdit = (t: TransactionRow) => {
    const d = new Date(t.date);
    const dateStr = d.toISOString().split("T")[0];
    setEditingTransaction({
      id: t.id,
      accountId: t.accountId,
      kind: t.amountCents >= 0 ? "income" : "expense",
      amountCents: t.amountCents,
      date: dateStr,
      payee: t.payee,
      memo: t.memo,
      categoryId: t.categoryId,
      cleared: t.cleared,
    });
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Buscador */}
          <div className="relative min-w-[16rem]">
            <input
              type="search"
              placeholder="Buscar beneficiario, nota o cuenta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-10 w-full rounded-field border border-line bg-surface px-3 py-1.5 text-sm text-deep-blue outline-none focus:border-modern-pink"
            />
          </div>

          {/* Filtro por Categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-h-10 rounded-field border border-line bg-surface px-3 py-1.5 text-sm text-deep-blue"
          >
            <option value="all">Todas las categorías</option>
            <option value="income">Sin categoría (Listo para asignar)</option>
            {categoryGroups.map((g) => (
              <optgroup key={g.id} label={g.name}>
                {g.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Filtro por Estado (Pills) */}
        <div className="flex items-center gap-1 rounded-field border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-field px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-deep-blue text-off-white shadow-sm"
                : "text-muted hover:text-deep-blue"
            }`}
          >
            Todas ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("unapproved")}
            className={`flex items-center gap-1 rounded-field px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "unapproved"
                ? "bg-modern-pink text-deep-blue shadow-sm"
                : "text-muted hover:text-deep-blue"
            }`}
          >
            Sin aprobar
            {unapprovedCount > 0 && (
              <span className="rounded-full bg-alert text-white px-1.5 py-0.2 text-[10px]">
                {unapprovedCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`rounded-field px-3 py-1 text-xs font-semibold transition cursor-pointer ${
              statusFilter === "approved"
                ? "bg-money-green text-off-white shadow-sm"
                : "text-muted hover:text-deep-blue"
            }`}
          >
            Aprobadas
          </button>
        </div>
      </div>

      {/* Barra de Acciones Masivas */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-field bg-powder-pink/30 border border-modern-pink/30 px-4 py-2">
          <p className="text-sm font-semibold text-deep-blue">
            {selectedIds.length} movimiento(s) seleccionado(s)
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="corporate"
              onClick={handleBulkApprove}
              disabled={isPending}
              className="min-h-8 px-3 text-xs"
            >
              {isPending ? "Aprobando…" : `Aprobar seleccionados (${selectedIds.length})`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedIds([])}
              className="min-h-8 px-3 text-xs"
            >
              Deseleccionar
            </Button>
          </div>
        </div>
      )}

      {/* Tabla de Movimientos */}
      <div className="overflow-x-auto rounded-card border border-line bg-white shadow-sm">
        <table className="w-full min-w-[48rem] text-sm">
          <thead>
            <tr className="border-b border-line bg-surface/80 text-left text-xs font-bold text-muted uppercase tracking-wider">
              <th className="w-10 px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  aria-label="Seleccionar todas"
                  className="h-4 w-4 rounded border-line text-money-green accent-money-green cursor-pointer"
                />
              </th>
              <th className="px-4 py-3">Fecha</th>
              {showAccountColumn && <th className="px-4 py-3">Cuenta</th>}
              <th className="px-4 py-3">Beneficiario / Pagador</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Nota</th>
              <th className="px-4 py-3 text-right">Salida (Gasto)</th>
              <th className="px-4 py-3 text-right">Entrada (Ingreso)</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-deep-blue">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={showAccountColumn ? 10 : 9} className="p-8 text-center text-muted">
                  No se encontraron movimientos con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const isSelected = selectedIds.includes(t.id);
                const isExpense = t.amountCents < 0;
                const d = new Date(t.date);
                const formattedDate = d.toLocaleDateString("es-BO", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                });

                return (
                  <tr
                    key={t.id}
                    className={`transition hover:bg-surface/50 ${
                      !t.approved ? "bg-powder-pink/10" : ""
                    } ${isSelected ? "bg-powder-pink/20" : ""}`}
                  >
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(t.id)}
                        className="h-4 w-4 rounded border-line text-money-green accent-money-green cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap text-xs text-muted">
                      {formattedDate}
                    </td>
                    {showAccountColumn && (
                      <td className="px-4 py-2.5 font-semibold text-xs whitespace-nowrap">
                        <span className="rounded-full bg-surface px-2 py-0.5 border border-line">
                          {t.account.name}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-2.5 font-semibold">
                      {t.payee}
                      {t.transferPairId && (
                        <span className="ml-1.5 inline-block text-[11px] text-muted font-normal">
                          ⇄ Transferencia
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {t.category ? (
                        <span className="rounded-field bg-surface px-2 py-1 text-deep-blue font-medium border border-line">
                          {t.category.name}
                        </span>
                      ) : (
                        <span className="text-muted italic">Listo para asignar</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted max-w-[12rem] truncate">
                      {t.memo || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-alert whitespace-nowrap">
                      {isExpense ? formatCents(t.amountCents, currency) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-money-green whitespace-nowrap">
                      {!isExpense ? formatCents(t.amountCents, currency) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {!t.approved ? (
                          <button
                            type="button"
                            onClick={() => handleSingleApprove(t.id)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 rounded-full bg-alert/15 px-2 py-0.5 text-[11px] font-bold text-alert hover:bg-alert/25 transition cursor-pointer"
                            title="Haz clic para aprobar"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-alert" />
                            Sin aprobar
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-money-green/15 px-2 py-0.5 text-[11px] font-semibold text-money-green">
                            Aprobada
                          </span>
                        )}
                        {t.cleared && (
                          <span
                            className="inline-block rounded-full bg-deep-blue/10 px-1.5 py-0.2 text-[10px] font-bold text-deep-blue"
                            title="Conciliada"
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          className="rounded-field p-1 text-xs font-semibold text-deep-blue/70 hover:bg-surface hover:text-deep-blue cursor-pointer"
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTransaction(t)}
                          className="rounded-field p-1 text-xs font-semibold text-alert hover:bg-alert/10 cursor-pointer"
                          title="Eliminar"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modales de Edición y Borrado */}
      {editingTransaction && (
        <TransactionDialog
          accounts={accounts}
          categoryGroups={categoryGroups}
          defaultAccountId={defaultAccountId}
          transactionToEdit={editingTransaction}
          isOpen={Boolean(editingTransaction)}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {deletingTransaction && (
        <DeleteTransactionDialog
          transaction={deletingTransaction}
          isOpen={Boolean(deletingTransaction)}
          onClose={() => setDeletingTransaction(null)}
        />
      )}
    </div>
  );
}
