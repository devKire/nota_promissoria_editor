// lib/exporters/pdfExporter.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PromissoryNote } from "@/lib/default-note";
import { generateNoteHTML } from "./note.ts";

interface ExporterConfig {
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  formatFullDate: (dateString: string) => string;
  convertYearToWords: (year: number) => string;
  formatDateDDMMYYYY: (dateString: string) => string;
}

interface ExportOptions {
  note: PromissoryNote;
  generatedNotes: PromissoryNote[];
  notesPerPage: number;
  savePaper: boolean;
}

export default class PDFExporter {
  private config: ExporterConfig;

  constructor(config: ExporterConfig) {
    this.config = config;
  }

  private createNoteHTML(
    note: PromissoryNote,
    rotated = false,
    options: ExportOptions,
  ) {
    const { savePaper } = options;

    // Dimensões fixas para modo savePaper
    let noteWidth = 150; // mm padrão
    let noteHeight = 100; // mm padrão

    if (savePaper) {
      noteWidth = 120; // mm para modo economizar papel
      noteHeight = 90; // mm para modo economizar papel
    }

    // Fontes ajustadas para tamanho menor
    const fontSizeTitle = savePaper ? "4.5mm" : "6mm";
    const fontSizeValue = savePaper ? "3mm" : "4mm";
    const fontSizeBody = savePaper ? "2.4mm" : "3.2mm";

    const noteHTML = generateNoteHTML({
      note,
      savePaper,
      rotated,
      fontSizeTitle,
      fontSizeBody,
      fontSizeValue,
      noteWidth,
      noteHeight,
      config: this.config,
    });

    return noteHTML;
  }

  private createPageHTML(
    notes: PromissoryNote[],
    pageIndex: number,
    options: ExportOptions,
  ) {
    const { savePaper, notesPerPage } = options;

    // Se não for savePaper, usar layout normal (lista vertical)
    if (!savePaper) {
      return this.createNormalPageHTML(notes, pageIndex, options);
    }

    // Layout savePaper: 120x90mm, máximo 5 notas por página
    const noteWidth = 120; // mm
    const noteHeight = 90; // mm
    const pageWidth = 210; // mm (largura A4)
    const pageHeight = 297; // mm (altura A4)

    let html = `
    <div class="page-container save-paper-page" id="page-${pageIndex}" style="
      width: ${pageWidth}mm;
      min-height: ${pageHeight}mm;
      background-color: white;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
      padding: 0;
      page-break-after: always;
      position: relative;
    ">
  `;

    // Posições fixas para as notas (modo economizar papel)
    const positions = [
      // Posição 1: Canto superior esquerdo (horizontal)
      { top: 0, left: 0, rotated: false },
      // Posição 2: Meio esquerdo (horizontal)
      { top: noteHeight, left: 0, rotated: false },
      // Posição 3: Canto inferior esquerdo (horizontal)
      { top: noteHeight * 2, left: 0, rotated: false },
      // Posição 4: Canto superior direito (vertical)
      { top: 0, left: pageWidth - noteHeight, rotated: true },
      // Posição 5: Meio direito (vertical)
      { top: noteWidth, left: pageWidth - noteHeight, rotated: true },
    ];

    notes.forEach((note, index) => {
      if (index < notesPerPage) {
        const pos = positions[index];
        html += `
          <div style="
            position: absolute;
            top: ${pos.top}mm;
            left: ${pos.left}mm;
            width: ${pos.rotated ? noteHeight : noteWidth}mm;
            height: ${pos.rotated ? noteWidth : noteHeight}mm;
          ">
            ${this.createNoteHTML(note, pos.rotated, options)}
          </div>
        `;
      }
    });

    html += "</div>";
    return html;
  }

  private createNormalPageHTML(
    notes: PromissoryNote[],
    pageIndex: number,
    options: ExportOptions,
  ) {
    const { notesPerPage } = options;

    // Dimensões padrão
    const noteWidth = 150; // mm
    const noteHeight = 99; // mm
    const pageWidth = 210; // mm (largura A4)
    const pageHeight = 297; // mm (altura A4)

    // CENTRALIZAR a nota horizontalmente na página
    // const leftMargin = (pageWidth - noteWidth) / 2;
    const leftMargin = 0; // Alinhamento à esquerda para melhor aproveitamento do papel

    let html = `
    <div class="page-container normal-page" id="page-${pageIndex}" style="
      width: ${pageWidth}mm;
      min-height: ${pageHeight}mm;
      background-color: white;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
      padding: 0;
      page-break-after: always;
      position: relative;
    ">
  `;

    // Calcular posição vertical para cada nota (uma abaixo da outra)
    notes.forEach((note, index) => {
      if (index < notesPerPage) {
        // Posição vertical: 0mm para a primeira, 100mm para a segunda, etc.
        const topPosition = index * noteHeight;

        html += `
          <div style="
            position: absolute;
            top: ${topPosition}mm;
            left: ${leftMargin}mm;
            width: ${noteWidth}mm;
            height: ${noteHeight}mm;
          ">
            ${this.createNoteHTML(note, false, options)}
          </div>
        `;
      }
    });

    html += "</div>";
    return html;
  }

  private createMultipleNotesHTML(
    notes: PromissoryNote[],
    options: ExportOptions,
  ) {
    const { notesPerPage, savePaper } = options;

    // SEMPRE múltiplas notas por página (comportamento padrão)
    let html = `
      <div id="export-notes-container" style="
        width: 210mm;
        background-color: white;
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
        padding: 0;
      ">
    `;

    // Dividir notas em páginas
    const pages = [];
    for (let i = 0; i < notes.length; i += notesPerPage) {
      pages.push(notes.slice(i, i + notesPerPage));
    }

    pages.forEach((pageNotes, pageIndex) => {
      if (pageIndex > 0) {
        html += '<div style="page-break-before: always;"></div>';
      }
      html += this.createPageHTML(pageNotes, pageIndex, options);
    });

    html += "</div>";
    return html;
  }

  private createTempElement(html: string) {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "fixed";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "0";
    tempDiv.style.width = "210mm";
    tempDiv.style.zIndex = "9999";
    tempDiv.style.opacity = "0";
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);
    return tempDiv;
  }

  async export(options: ExportOptions) {
    const { note, generatedNotes } = options;
    const notesToExport = generatedNotes.length > 0 ? generatedNotes : [note];
    const html = this.createMultipleNotesHTML(notesToExport, options);

    const tempElement = this.createTempElement(html);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const container = tempElement.querySelector(
      "#export-notes-container",
    ) as HTMLElement;
    if (!container) throw new Error("Container não encontrado");

    // Criar PDF com múltiplas páginas
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // Sempre modo múltiplo (comportamento padrão)
    const pageContainers = container.querySelectorAll(".page-container");

    for (let i = 0; i < pageContainers.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const canvas = await html2canvas(pageContainers[i] as HTMLElement, {
        useCORS: true,
        logging: false,
        width: (pageContainers[i] as HTMLElement).offsetWidth,
        height: (pageContainers[i] as HTMLElement).offsetHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, "", "FAST");
    }

    document.body.removeChild(tempElement);
    pdf.save(
      `notas-promissorias-${new Date().toISOString().split("T")[0]}.pdf`,
    );
  }
}
