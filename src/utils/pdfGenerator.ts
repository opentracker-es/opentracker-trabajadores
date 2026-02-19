import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonthlyReportResponse } from '../types';
import { getMonthName, formatMinutesToHoursMinutes } from './dateFormatters';

/**
 * Formatea una fecha ISO a dd/mm/yyyy en zona horaria local
 */
function formatDateLocal(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formatea una fecha ISO a HH:mm en zona horaria local
 */
function formatTimeLocal(isoString: string | null): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Traduce el estado de firma al texto en español para el PDF
 */
function getSignatureStatusText(
  status: 'pending' | 'signed' | 'not_required'
): string {
  switch (status) {
    case 'signed':
      return 'Firmado';
    case 'pending':
      return 'Pendiente';
    case 'not_required':
      return 'No requerida';
  }
}

/**
 * Genera un PDF con el informe mensual de jornada de un trabajador
 * y dispara la descarga en el navegador.
 *
 * @param report - Respuesta completa del informe mensual (MonthlyReportResponse)
 */
export function generateMonthlyReportPDF(report: MonthlyReportResponse): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // ─── 1. Header ────────────────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Informe Mensual de Jornada', pageWidth / 2, y, {
    align: 'center',
  });
  y += 14;

  // ─── 2. Worker info block ─────────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Nombre:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(report.worker_name, 50, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('DNI:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(report.worker_id_number, 50, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Empresa:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(report.company_name, 50, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Periodo:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${getMonthName(report.month)} ${report.year}`, 50, y);
  y += 12;

  // ─── 3. Summary block ────────────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen', 14, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Días trabajados:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(String(report.total_days_worked), 60, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Total horas:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatMinutesToHoursMinutes(report.total_worked_minutes), 60, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Total pausas:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatMinutesToHoursMinutes(report.total_pause_minutes), 60, y);
  y += 12;

  // ─── 4. Daily detail table ────────────────────────────────────────────
  const sortedDays = [...report.daily_details].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const tableBody = sortedDays.map((day) => [
    formatDateLocal(day.date),
    formatTimeLocal(day.first_entry),
    formatTimeLocal(day.last_exit),
    formatMinutesToHoursMinutes(day.total_worked_minutes),
    formatMinutesToHoursMinutes(day.total_pause_minutes),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Fecha', 'Entrada', 'Salida', 'Horas', 'Pausas']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    styles: {
      fontSize: 10,
    },
    margin: { left: 14, right: 14 },
  });

  // Get the Y position after the table
  const lastTable = (doc as unknown as { lastAutoTable: { finalY: number } })
    .lastAutoTable;
  y = lastTable ? lastTable.finalY + 12 : y + 12;

  // ─── 5. Signature status ──────────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Estado de firma: ${getSignatureStatusText(report.signature_status)}`,
    14,
    y
  );
  y += 14;

  // ─── 6. Footer ────────────────────────────────────────────────────────
  const now = new Date();
  const generatedDay = String(now.getDate()).padStart(2, '0');
  const generatedMonth = String(now.getMonth() + 1).padStart(2, '0');
  const generatedYear = now.getFullYear();
  const generatedHours = String(now.getHours()).padStart(2, '0');
  const generatedMinutes = String(now.getMinutes()).padStart(2, '0');
  const generatedTimestamp = `${generatedDay}/${generatedMonth}/${generatedYear} ${generatedHours}:${generatedMinutes}`;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`Generado el ${generatedTimestamp}`, pageWidth / 2, y, {
    align: 'center',
  });
  y += 5;
  doc.text('OpenJornada - Registro de Jornada', pageWidth / 2, y, {
    align: 'center',
  });

  // ─── Trigger download ─────────────────────────────────────────────────
  const monthStr = String(report.month).padStart(2, '0');
  const filename = `informe_${report.year}-${monthStr}_${report.worker_id_number}.pdf`;
  doc.save(filename);
}
