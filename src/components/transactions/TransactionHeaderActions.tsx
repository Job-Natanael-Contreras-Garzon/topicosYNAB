"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TransactionDialog } from "./TransactionDialog";
import { TransferDialog } from "./TransferDialog";
import { CsvImportDialog } from "./CsvImportDialog";

interface AccountOption {
  id: string;
  name: string;
  onBudget?: boolean;
}

interface CategoryGroupOption {
  id: string;
  name: string;
  categories: { id: string; name: string }[];
}

interface Props {
  accounts: AccountOption[];
  categoryGroups: CategoryGroupOption[];
  defaultAccountId?: string;
  currency?: string;
}

export function TransactionHeaderActions({
  accounts,
  categoryGroups,
  defaultAccountId,
  currency = "BOB",
}: Props) {
  const [isTxOpen, setIsTxOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="primary"
          onClick={() => setIsTxOpen(true)}
          className="shadow-sm"
        >
          + Nuevo movimiento
        </Button>

        {accounts.length >= 2 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsTransferOpen(true)}
          >
            ⇄ Transferir
          </Button>
        )}

        {accounts.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCsvOpen(true)}
            className="flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>Importar CSV</span>
          </Button>
        )}
      </div>

      <TransactionDialog
        accounts={accounts.map((a) => ({ ...a, onBudget: a.onBudget ?? true }))}
        categoryGroups={categoryGroups}
        defaultAccountId={defaultAccountId}
        isOpen={isTxOpen}
        onClose={() => setIsTxOpen(false)}
      />

      <TransferDialog
        accounts={accounts.map((a) => ({ ...a, onBudget: a.onBudget ?? true }))}
        categoryGroups={categoryGroups}
        defaultFromAccountId={defaultAccountId}
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />

      <CsvImportDialog
        accounts={accounts}
        defaultAccountId={defaultAccountId}
        currency={currency}
        isOpen={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
      />
    </>
  );
}
