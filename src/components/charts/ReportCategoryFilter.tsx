"use client";

import { useRouter } from "next/navigation";

interface CategoryGroupOption {
  id: string;
  name: string;
  categories: { id: string; name: string }[];
}

interface Props {
  range: string;
  currentCategory: string;
  categoryGroups: CategoryGroupOption[];
}

export function ReportCategoryFilter({
  range,
  currentCategory,
  categoryGroups,
}: Props) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="category-select" className="text-xs font-semibold text-muted">
        Filtrar categoría:
      </label>
      <select
        id="category-select"
        value={currentCategory}
        onChange={(e) => {
          const val = e.target.value;
          router.push(`/app/reportes?tab=trend&range=${range}&category=${val}`);
        }}
        className="rounded-field border border-line bg-surface/50 px-3 py-1.5 text-xs font-medium text-deep-blue focus:bg-white cursor-pointer"
      >
        <option value="all">Todas las categorías</option>
        <option value="uncategorized">Sin categoría</option>
        {categoryGroups.map((group) => (
          <optgroup key={group.id} label={group.name}>
            {group.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
