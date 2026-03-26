import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AnalyticsRow } from "./aggregations";

const STATUS_LABELS: Record<string, string> = {
  Completed: "Виконано",
  Confirmed: "Очікується",
  Cancelled: "Скасовано",
  NoShow: "Не прийшов",
};

const toExportRows = (rows: AnalyticsRow[]) =>
  rows.map((r) => ({
    Дата: r.date,
    Майстер: r.master,
    Послуга: r.service,
    Категорія: r.category,
    Статус: STATUS_LABELS[r.status] ?? r.status,
    "Сума (₴)": r.price,
    "Тривалість (хв)": r.duration,
  }));

export const exportToCSV = (rows: AnalyticsRow[], filename = "analytics") => {
  const ws = XLSX.utils.json_to_sheet(toExportRows(rows));
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `${filename}.csv`);
};

export const exportToExcel = (rows: AnalyticsRow[], filename = "analytics") => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(toExportRows(rows)),
    "Записи",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      rows
        .filter((r) => r.status === "Completed")
        .reduce((acc: Record<string, number>, r) => {
          acc[r.master] = (acc[r.master] ?? 0) + r.price;
          return acc;
        }, {}) &&
        Object.entries(
          rows
            .filter((r) => r.status === "Completed")
            .reduce((acc: Record<string, number>, r) => {
              acc[r.master] = (acc[r.master] ?? 0) + r.price;
              return acc;
            }, {}),
        ).map(([master, revenue]) => ({
          Майстер: master,
          "Дохід (₴)": revenue,
        })),
    ),
    "По майстрах",
  );
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buf], { type: "application/octet-stream" }),
    `${filename}.xlsx`,
  );
};
