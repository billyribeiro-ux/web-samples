import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useApi } from '@/hooks/useApi.js';

export function AdminGenericListPage({
  title,
  path,
  columns,
}: {
  title: string;
  path: string;
  columns: { key: string; header: string }[];
}) {
  const api = useApi();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    void api<{ items: Record<string, unknown>[] }>(path).then((d) => setRows(d.items));
  }, [api, path]);

  return (
    <>
      <Helmet>
        <title>Admin — {title}</title>
      </Helmet>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
            {columns.map((c) => (
              <th key={c.key} className="py-2">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-b border-slate-100">
              {columns.map((c) => (
                <td key={c.key} className="py-2">
                  {String((r as Record<string, unknown>)[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
