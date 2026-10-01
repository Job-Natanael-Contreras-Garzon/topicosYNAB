"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/Button";
import { formatCents } from "@/lib/money";
import {
  mapCsvRow,
  type DateFormat,
  type DecimalSeparator,
  type ColumnMapping,
  type ParsedCsvTransaction,
} from "@/lib/csv-import";
import { importTransactionsAction } from "@/actions/transactions";

interface AccountOption {
  id: string;
  name: string;
}

interface Props {
  accounts: AccountOption[];
  defaultAccountId?: string;
  currency?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CsvImportDialog({
  accounts,
  defaultAccountId,
  currency = "BOB",
  isOpen,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedAccountId, setSelectedAccountId] = useState(
    defaultAccountId || accounts[0]?.id || ""
  );

  // Estado del archivo y parsing
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);

  // Opciones de mapeo
  const [dateFormat, setDateFormat] = useState<DateFormat>("DD/MM/YYYY");
  const [decimalSeparator, setDecimalSeparator] = useState<DecimalSeparator>(".");
  const [amountMode, setAmountMode] = useState<"single" | "dual">("single");
  const [invertSign, setInvertSign] = useState(false);

  const [dateCol, setDateCol] = useState<string>("");
  const [payeeCol, setPayeeCol] = useState<string>("");
  const [memoCol, setMemoCol] = useState<string>("");
  const [amountCol, setAmountCol] = useState<string>("");
  const [outflowCol, setOutflowCol] = useState<string>("");
  const [inflowCol, setInflowCol] = useState<string>("");

  // Estado de envío
  const [isPending, startTransition] = useTransition();
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported?: number;
    skipped?: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      // Resetear estado al cerrar
      setFile(null);
      setHeaders([]);
      setRawRows([]);
      setParsingError(null);
      setImportResult(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultAccountId) {
      setSelectedAccountId(defaultAccountId);
    } else if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [defaultAccountId, accounts, selectedAccountId]);

  // Manejar subida y parsing del archivo CSV con Papa Parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setParsingError(null);
    setImportResult(null);

    Papa.parse<Record<string, string>>(uploadedFile, {
      header: true,
      skipEmptyLines: "greedy",
      encoding: "UTF-8",
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.warn("PapaParse advertencias:", results.errors);
        }

        const fields = results.meta.fields || [];
        if (fields.length === 0) {
          setParsingError("No se pudieron detectar columnas en el archivo CSV.");
          return;
        }

        setHeaders(fields);
        setRawRows(results.data);

        // Auto-detección inteligente de columnas
        const lowerFields = fields.map((f) => ({ original: f, lower: f.toLowerCase() }));

        const detectedDate =
          lowerFields.find((f) => /fecha|date|dia|fec/i.test(f.lower))?.original || fields[0] || "";
        const detectedPayee =
          lowerFields.find((f) => /beneficiario|payee|comercio|detalle|concepto|descripcion|glosa/i.test(f.lower))
            ?.original || fields[1] || "";
        const detectedMemo =
          lowerFields.find((f) => /memo|nota|referencia|observacion/i.test(f.lower))?.original || "";

        const detectedAmount =
          lowerFields.find((f) => /monto|importe|amount|saldo|total/i.test(f.lower))?.original || "";
        const detectedOutflow =
          lowerFields.find((f) => /debito|cargo|egreso|outflow|gasto/i.test(f.lower))?.original || "";
        const detectedInflow =
          lowerFields.find((f) => /credito|abono|ingreso|inflow/i.test(f.lower))?.original || "";

        setDateCol(detectedDate);
        setPayeeCol(detectedPayee);
        setMemoCol(detectedMemo);

        if (detectedOutflow && detectedInflow) {
          setAmountMode("dual");
          setOutflowCol(detectedOutflow);
          setInflowCol(detectedInflow);
        } else {
          setAmountMode("single");
          setAmountCol(detectedAmount || fields[2] || "");
        }
      },
      error: (err) => {
        setParsingError(`Error al leer el archivo: ${err.message}`);
      },
    });
  };

  // Mapear filas en tiempo real según la configuración actual
  const currentMapping: ColumnMapping = {
    dateCol,
    payeeCol,
    memoCol: memoCol || undefined,
    amountMode,
    amountCol,
    outflowCol,
    inflowCol,
    invertSign,
  };

  const parsedTransactions: ParsedCsvTransaction[] = [];
  if (headers.length > 0 && rawRows.length > 0 && dateCol && payeeCol) {
    for (const row of rawRows) {
      const parsed = mapCsvRow(row, {
        dateFormat,
        decimalSeparator,
        mapping: currentMapping,
      });
      if (parsed) {
        parsedTransactions.push(parsed);
      }
    }
  }

  const previewRows = parsedTransactions.slice(0, 10);

  const handleImport = () => {
    if (!selectedAccountId) {
      setParsingError("Debes seleccionar una cuenta para importar");
      return;
    }
    if (parsedTransactions.length === 0) {
      setParsingError("No hay transacciones válidas para importar.");
      return;
    }

    startTransition(async () => {
      const res = await importTransactionsAction({
        accountId: selectedAccountId,
        transactions: parsedTransactions.map((t) => ({
          date: t.date,
          amountCents: t.amountCents,
          payee: t.payee,
          memo: t.memo,
        })),
      });

      if (!res.ok) {
        setImportResult({ success: false, error: res.error });
      } else {
        setImportResult({
          success: true,
          imported: res.importedCount,
          skipped: res.skippedCount,
        });
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-3xl rounded-card border border-line bg-white p-6 shadow-2xl backdrop:bg-deep-blue/50"
    >
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-extrabold font-display text-deep-blue">
            Importar Transacciones (CSV)
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Sube el extracto de tu entidad bancaria, mapea las columnas y revisa los datos antes de importar.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-muted hover:bg-surface hover:text-deep-blue"
          aria-label="Cerrar diálogo"
        >
          ✕
        </button>
      </div>

      <div className="mt-5 space-y-6">
        {/* Selector de Cuenta destino */}
        <div>
          <label htmlFor="csv-account-select" className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
            Cuenta de destino
          </label>
          <select
            id="csv-account-select"
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            disabled={isPending || importResult?.success}
            className="w-full rounded-field border border-line bg-surface/40 px-3 py-2 text-sm font-semibold text-deep-blue focus:bg-white"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Zona de subida de archivo */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed border-line bg-surface/30 p-8 text-center transition hover:border-modern-pink hover:bg-surface/60"
          >
            <span className="text-3xl">📄</span>
            <p className="mt-2 text-sm font-bold text-deep-blue">
              Haz clic para seleccionar tu archivo CSV
            </p>
            <p className="mt-0.5 text-xs text-muted">Archivos delimitados por comas (.csv)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-card border border-line bg-surface/40 p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-bold text-sm text-deep-blue">{file.name}</p>
                <p className="text-xs text-muted">
                  {rawRows.length} filas leídas • {headers.length} columnas detectadas
                </p>
              </div>
            </div>
            {!importResult?.success && (
              <Button
                type="button"
                variant="outline"
                className="min-h-8 px-3 py-1 text-xs"
                onClick={() => {
                  setFile(null);
                  setHeaders([]);
                  setRawRows([]);
                  setParsingError(null);
                }}
              >
                Cambiar archivo
              </Button>
            )}
          </div>
        )}

        {parsingError && (
          <div className="rounded-field border border-alert/30 bg-alert/10 p-3 text-xs text-alert font-medium">
            {parsingError}
          </div>
        )}

        {/* Configuración de formato y mapeo de columnas */}
        {headers.length > 0 && !importResult?.success && (
          <div className="space-y-4 rounded-card border border-line bg-surface/20 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              1. Formato y correspondencia de columnas
            </h3>

            {/* Formatos numéricos y de fecha */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="csv-date-format-select" className="block text-xs font-semibold text-deep-blue mb-1">
                  Formato de Fecha
                </label>
                <select
                  id="csv-date-format-select"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value as DateFormat)}
                  className="w-full rounded-field border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-deep-blue"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (ej. 15/10/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ej. 2026-10-15)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (ej. 10/15/2026)</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY (ej. 15-10-2026)</option>
                </select>
              </div>

              <div>
                <label htmlFor="csv-decimal-select" className="block text-xs font-semibold text-deep-blue mb-1">
                  Separador Decimal
                </label>
                <select
                  id="csv-decimal-select"
                  value={decimalSeparator}
                  onChange={(e) => setDecimalSeparator(e.target.value as DecimalSeparator)}
                  className="w-full rounded-field border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-deep-blue"
                >
                  <option value=".">Punto (1250.50)</option>
                  <option value=",">Coma (1250,50)</option>
                </select>
              </div>

              <div>
                <label htmlFor="csv-amount-mode-select" className="block text-xs font-semibold text-deep-blue mb-1">
                  Estructura de Montos
                </label>
                <select
                  id="csv-amount-mode-select"
                  value={amountMode}
                  onChange={(e) => setAmountMode(e.target.value as any)}
                  className="w-full rounded-field border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-deep-blue"
                >
                  <option value="single">Columna única de monto</option>
                  <option value="dual">Dos columnas (Débito y Crédito)</option>
                </select>
              </div>
            </div>

            {/* Mapeo de columnas detectadas */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
              <div>
                <label htmlFor="csv-col-date-select" className="block text-xs font-semibold text-deep-blue mb-1">
                  Columna de Fecha *
                </label>
                <select
                  id="csv-col-date-select"
                  value={dateCol}
                  onChange={(e) => setDateCol(e.target.value)}
                  className="w-full rounded-field border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-deep-blue"
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="csv-col-payee-select" className="block text-xs font-semibold text-deep-blue mb-1">
                  Beneficiario / Detalle *
                </label>
                <select
                  id="csv-col-payee-select"
                  value={payeeCol}
                  onChange={(e) => setPayeeCol(e.target.value)}
                  className="w-full rounded-field border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-deep-blue"
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="csv-col-memo-select" className="block text-xs font-semibold text-deep-blue mb-1">
                  Memo / Nota (opcional)
                </label>
                <select
                  id="csv-col-memo-select"
                  value={memoCol}
                  onChange={(e) => setMemoCol(e.target.value)}
                  className="w-full rounded-field border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-deep-blue"
                >
                  <option value="">(Ninguno)</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Columnas según modo de monto */}
            {amountMode === "single" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
                <div>
                  <label htmlFor="csv-col-amount-select" className="block text-xs font-semibold text-deep-blue mb-1">
                    Columna de Monto *
                  </label>
                  <select
                    id="csv-col-amount-select"
                    value={amountCol}
                    onChange={(e) => setAmountCol(e.target.value)}
                    className="w-full rounded-field border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-deep-blue"
                  >
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-deep-blue">
                    <input
                      type="checkbox"
                      checked={invertSign}
                      onChange={(e) => setInvertSign(e.target.checked)}
                      className="rounded border-line text-modern-pink focus:ring-modern-pink"
                    />
                    Invertir signos (si tu banco exporta los gastos en positivo)
                  </label>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
                <div>
                  <label htmlFor="csv-col-outflow-select" className="block text-xs font-semibold text-deep-blue mb-1">
                    Columna de Gastos / Débito *
                  </label>
                  <select
                    id="csv-col-outflow-select"
                    value={outflowCol}
                    onChange={(e) => setOutflowCol(e.target.value)}
                    className="w-full rounded-field border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-deep-blue"
                  >
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="csv-col-inflow-select" className="block text-xs font-semibold text-deep-blue mb-1">
                    Columna de Ingresos / Crédito *
                  </label>
                  <select
                    id="csv-col-inflow-select"
                    value={inflowCol}
                    onChange={(e) => setInflowCol(e.target.value)}
                    className="w-full rounded-field border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-deep-blue"
                  >
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Previsualización de las 10 primeras filas */}
        {headers.length > 0 && !importResult?.success && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                2. Vista previa (10 primeras filas mapeadas)
              </h3>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-deep-blue border border-line">
                {parsedTransactions.length} transacciones listas para importar
              </span>
            </div>

            {previewRows.length === 0 ? (
              <div className="rounded-field border border-dashed border-line bg-surface/20 p-4 text-center text-xs text-muted">
                No se pudo mapear ninguna fila con los parámetros actuales. Revisa el formato de fecha y separador decimal.
              </div>
            ) : (
              <div className="max-h-56 overflow-x-auto rounded-card border border-line bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface/50 text-muted uppercase font-semibold border-b border-line">
                    <tr>
                      <th className="px-3 py-2">Fecha</th>
                      <th className="px-3 py-2">Beneficiario</th>
                      <th className="px-3 py-2">Memo</th>
                      <th className="px-3 py-2 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {previewRows.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-surface/40">
                        <td className="px-3 py-2 font-mono text-muted">{tx.date}</td>
                        <td className="px-3 py-2 font-medium text-deep-blue">{tx.payee}</td>
                        <td className="px-3 py-2 text-muted truncate max-w-[150px]">
                          {tx.memo || "—"}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-bold tabular-nums ${
                            tx.amountCents >= 0 ? "text-money-green" : "text-alert"
                          }`}
                        >
                          {formatCents(tx.amountCents, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Mensaje de resultado de importación */}
        {importResult && (
          <div
            className={`rounded-card border p-4 ${
              importResult.success
                ? "border-money-green/40 bg-money-green/10"
                : "border-alert/40 bg-alert/10"
            }`}
          >
            {importResult.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-money-green font-bold">
                  <span>✓</span>
                  <span>¡Importación completada con éxito!</span>
                </div>
                <p className="text-xs text-deep-blue">
                  Se importaron <strong>{importResult.imported}</strong> transacciones como pendientes
                  de aprobación (sin categoría asignada).
                  {importResult.skipped && importResult.skipped > 0 ? (
                    <span className="block mt-1 text-muted">
                      Se descartaron <strong>{importResult.skipped}</strong> transacciones duplicadas que ya
                      existían en esta cuenta.
                    </span>
                  ) : null}
                </p>
              </div>
            ) : (
              <div className="text-xs text-alert font-semibold">
                Error al importar: {importResult.error}
              </div>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            {importResult?.success ? "Cerrar" : "Cancelar"}
          </Button>

          {!importResult?.success && (
            <Button
              type="button"
              variant="primary"
              onClick={handleImport}
              disabled={isPending || parsedTransactions.length === 0}
            >
              {isPending
                ? "Importando..."
                : `Importar ${parsedTransactions.length} transacciones`}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
