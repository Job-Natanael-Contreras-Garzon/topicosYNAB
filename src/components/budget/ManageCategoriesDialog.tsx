"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
  createCategoryGroupAction,
  updateCategoryGroupAction,
} from "@/actions/budget";
import { Button } from "@/components/ui/Button";

interface CategoryData {
  id: string;
  name: string;
  hidden: boolean;
}

interface CategoryGroupData {
  id: string;
  name: string;
  categories: CategoryData[];
}

interface Props {
  groups: CategoryGroupData[];
  isOpen: boolean;
  onClose: () => void;
  initialGroupIdToAdd?: string | null;
}

export function ManageCategoriesDialog({
  groups,
  isOpen,
  onClose,
  initialGroupIdToAdd,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"categories" | "newGroup">("categories");
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupIdToAdd || groups[0]?.id || "");
  const [newCatName, setNewCatName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      if (initialGroupIdToAdd) {
        setSelectedGroupId(initialGroupIdToAdd);
        setActiveTab("categories");
      }
      setError(null);
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen, initialGroupIdToAdd]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createCategoryAction(selectedGroupId, newCatName);
      if (res.ok) {
        setNewCatName("");
      } else {
        setError(res.error || "No se pudo crear la categoría");
      }
    });
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createCategoryGroupAction(newGroupName);
      if (res.ok) {
        setNewGroupName("");
        setActiveTab("categories");
      } else {
        setError(res.error || "No se pudo crear el grupo");
      }
    });
  };

  const handleRenameCategory = (categoryId: string) => {
    if (!editingName.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await updateCategoryAction(categoryId, { name: editingName });
      if (res.ok) {
        setEditingId(null);
      } else {
        setError(res.error || "No se pudo actualizar");
      }
    });
  };

  const handleToggleHide = (categoryId: string, currentHidden: boolean) => {
    setError(null);
    startTransition(async () => {
      await updateCategoryAction(categoryId, { hidden: !currentHidden });
    });
  };

  const handleRenameGroup = (groupId: string, name: string) => {
    if (!name.trim()) return;
    startTransition(async () => {
      await updateCategoryGroupAction(groupId, name);
      setEditingId(null);
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-[min(94vw,34rem)] rounded-card border border-line bg-surface p-6 text-deep-blue shadow-2xl backdrop:bg-deep-blue/50"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold font-display text-deep-blue">Administrar Categorías</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-deep-blue text-lg font-bold p-1 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition ${
            activeTab === "categories"
              ? "border-modern-pink text-deep-blue"
              : "border-transparent text-muted hover:text-deep-blue"
          }`}
        >
          Categorías y Grupos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("newGroup")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition ${
            activeTab === "newGroup"
              ? "border-modern-pink text-deep-blue"
              : "border-transparent text-muted hover:text-deep-blue"
          }`}
        >
          + Nuevo Grupo
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-alert">{error}</p>}

      {activeTab === "newGroup" ? (
        <form onSubmit={handleAddGroup} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="grp-name" className="block text-sm font-semibold">
              Nombre del nuevo grupo
            </label>
            <input
              id="grp-name"
              type="text"
              placeholder="Ej. Suscripciones, Transporte, Hobbies..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="min-h-10 w-full rounded-field border border-line bg-white px-3 text-base text-deep-blue outline-none focus:border-modern-pink"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setActiveTab("categories")}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? "Guardando…" : "Crear Grupo"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          {/* Formulario rápido para agregar categoría a grupo */}
          <form onSubmit={handleAddCategory} className="flex flex-wrap items-end gap-2 rounded-field bg-white/80 p-3 border border-line">
            <div className="flex-1 min-w-[12rem] space-y-1">
              <label htmlFor="cat-name" className="block text-xs font-semibold text-muted">
                Nueva Categoría
              </label>
              <input
                id="cat-name"
                type="text"
                placeholder="Nombre de la categoría..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="min-h-9 w-full rounded-field border border-line bg-surface px-2.5 text-sm outline-none focus:border-modern-pink"
                required
              />
            </div>
            <div className="w-36 space-y-1">
              <label htmlFor="cat-group" className="block text-xs font-semibold text-muted">
                En el Grupo
              </label>
              <select
                id="cat-group"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="min-h-9 w-full rounded-field border border-line bg-surface px-2 text-xs"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="corporate" disabled={isPending} className="min-h-9 px-3 text-xs">
              + Agregar
            </Button>
          </form>

          {/* Listado de Grupos y Categorías */}
          <div className="space-y-4">
            {groups.map((g) => (
              <div key={g.id} className="rounded-card border border-line bg-white p-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-line/60 pb-2 mb-2">
                  {editingId === `g-${g.id}` ? (
                    <div className="flex items-center gap-1.5 flex-1 mr-2">
                      <input
                        type="text"
                        defaultValue={g.name}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameGroup(g.id, e.currentTarget.value);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={(e) => handleRenameGroup(g.id, e.currentTarget.value)}
                        className="rounded-field border border-modern-pink px-2 py-0.5 text-sm font-bold text-deep-blue"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-deep-blue">{g.name}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(`g-${g.id}`);
                          setEditingName(g.name);
                        }}
                        className="text-xs text-muted hover:text-deep-blue cursor-pointer"
                        title="Renombrar grupo"
                      >
                        ✎
                      </button>
                    </div>
                  )}
                  <span className="text-xs text-muted">{g.categories.length} categoría(s)</span>
                </div>

                <ul className="space-y-1">
                  {g.categories.map((c) => (
                    <li
                      key={c.id}
                      className={`flex items-center justify-between rounded-field px-2.5 py-1 text-sm transition ${
                        c.hidden ? "bg-surface/50 text-muted opacity-60" : "hover:bg-surface text-deep-blue"
                      }`}
                    >
                      {editingId === c.id ? (
                        <div className="flex items-center gap-1.5 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameCategory(c.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            onBlur={() => handleRenameCategory(c.id)}
                            className="w-full rounded-field border border-modern-pink px-2 py-0.5 text-xs font-semibold"
                          />
                        </div>
                      ) : (
                        <span className="font-medium text-xs">
                          {c.name} {c.hidden && "(Oculta)"}
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(c.id);
                            setEditingName(c.name);
                          }}
                          className="rounded p-1 text-xs text-muted hover:text-deep-blue cursor-pointer"
                          title="Renombrar categoría"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleHide(c.id, c.hidden)}
                          className="rounded p-1 text-xs text-muted hover:text-deep-blue cursor-pointer"
                          title={c.hidden ? "Mostrar en presupuesto" : "Ocultar categoría"}
                        >
                          {c.hidden ? "👁 Mostrar" : "Ocultar"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-line">
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
