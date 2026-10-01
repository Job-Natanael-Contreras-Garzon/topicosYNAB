"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TransactionDialog } from "./TransactionDialog";
import { TransferDialog } from "./TransferDialog";

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
  accounts: AccountOption[];
  categoryGroups: CategoryGroupOption[];
  defaultAccountId?: string;
}

export function TransactionHeaderActions({
  accounts,
  categoryGroups,
  defaultAccountId,
}: Props) {
  const [isTxOpen, setIsTxOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

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
      </div>

      <TransactionDialog
        accounts={accounts}
        categoryGroups={categoryGroups}
        defaultAccountId={defaultAccountId}
        isOpen={isTxOpen}
        onClose={() => setIsTxOpen(false)}
      />

      <TransferDialog
        accounts={accounts}
        categoryGroups={categoryGroups}
        defaultFromAccountId={defaultAccountId}
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />
    </>
  );
}
