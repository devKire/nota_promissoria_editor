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
  selectedLayout: 4 | 5 | "default";
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
    const { selectedLayout } = options;

    let noteWidth = 150;
    let noteHeight = 100;

    // Dimensões específicas para layout de 4 notas
    if (selectedLayout === 4) {
      noteWidth = 148.5;
      noteHeight = 105;
    } else if (selectedLayout === 5) {
      noteWidth = 120;
      noteHeight = 90;
    }

    console.log(
      "createNoteHTML - selectedLayout:",
      selectedLayout,
      "dimensões:",
      { noteWidth, noteHeight },
    );

    const noteHTML = generateNoteHTML({
      note,
      selectedLayout: selectedLayout,
      rotated,
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
    const { selectedLayout, notesPerPage } = options;

    console.log(
      "createPageHTML - selectedLayout:",
      selectedLayout,
      "notesPerPage:",
      notesPerPage,
      "total notes:",
      notes.length,
    );

    // Layout específico para 4 notas (2x2)
    if (selectedLayout === 4) {
      console.log("createPageHTML - USANDO LAYOUT 4 NOTAS (2x2)");
      return this.create4NotesPageHTML(notes, pageIndex, options);
    }

    // Layout para 5 notas
    if (selectedLayout === 5) {
      console.log("createPageHTML - USANDO LAYOUT ECONOMIA (5 notas)");
      return this.createSavePaperPageHTML(notes, pageIndex, options);
    }

    console.log("createPageHTML - USANDO LAYOUT NORMAL");
    return this.createNormalPageHTML(notes, pageIndex, options);
  }

  private create4NotesPageHTML(
    notes: PromissoryNote[],
    pageIndex: number,
    options: ExportOptions,
  ) {
    const { notesPerPage } = options;

    // Dimensões da nota
    const noteWidth = 148.5; // mm (largura original)
    const noteHeight = 105; // mm (altura original)

    // Quando rotacionada, as dimensões são invertidas
    const rotatedWidth = noteHeight; // 105mm (largura quando rotacionada)
    const rotatedHeight = noteWidth; // 148.5mm (altura quando rotacionada)

    const pageWidth = 210; // mm (largura A4)
    const pageHeight = 297; // mm (altura A4)

    let html = `
    <div class="page-container four-notes-page" id="page-${pageIndex}" style="
      width: ${pageWidth}mm;
      height: ${pageHeight}mm;
      background-color: white;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
      padding: 0;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    ">
  `;

    // Posições CORRIGIDAS para as 4 notas
    // Todas as notas ficam na vertical (rotacionadas 90°)
    const positions = [
      // Posição 1: Canto superior esquerdo
      { top: 0, left: 0, rotated: true },
      // Posição 2: Canto inferior esquerdo
      // Top = altura da página - altura da nota rotacionada
      { top: pageHeight - rotatedHeight, left: 0, rotated: true },
      // Posição 3: Canto superior direito
      // Left = largura da página - largura da nota rotacionada
      { top: 0, left: pageWidth - rotatedWidth, rotated: true },
      // Posição 4: Canto inferior direito
      {
        top: pageHeight - rotatedHeight,
        left: pageWidth - rotatedWidth,
        rotated: true,
      },
    ];

    notes.forEach((note, index) => {
      if (index < notesPerPage && index < 4) {
        const pos = positions[index];
        html += `
        <div style="
          position: absolute;
          top: ${pos.top}mm;
          left: ${pos.left}mm;
          width: ${pos.rotated ? rotatedWidth : noteWidth}mm;
          height: ${pos.rotated ? rotatedHeight : noteHeight}mm;
        ">
          ${this.createNoteHTML(note, pos.rotated, options)}
        </div>
      `;
      }
    });

    html += "</div>";
    return html;
  }

  private createSavePaperPageHTML(
    notes: PromissoryNote[],
    pageIndex: number,
    options: ExportOptions,
  ) {
    const { notesPerPage } = options;

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
    console.log("createSavePaperPageHTML - HTML gerado para a página:", html);
    html += "</div>";
    return html;
  }

  private createNormalPageHTML(
    notes: PromissoryNote[],
    pageIndex: number,
    options: ExportOptions,
  ) {
    const { notesPerPage } = options;

    console.log(
      "createNormalPageHTML - notesPerPage:",
      notesPerPage,
      "notes:",
      notes.length,
    );

    // Dimensões padrão
    const noteWidth = 150; // mm
    const noteHeight = 99; // mm
    const pageWidth = 210; // mm (largura A4)
    const pageHeight = 297; // mm (altura A4)

    // Verificar se as notas cabem na página
    const totalHeightNeeded = noteHeight * Math.min(notes.length, notesPerPage);
    if (totalHeightNeeded > pageHeight) {
      console.warn(
        "ATENÇÃO: Altura total das notas excede a página:",
        totalHeightNeeded,
        "mm >",
        pageHeight,
        "mm",
      );
    }

    // CENTRALIZAR a nota horizontalmente na página
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
    const { notesPerPage } = options;

    console.log(
      "createMultipleNotesHTML - total notes:",
      notes.length,
      "notesPerPage:",
      notesPerPage,
    );

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

    console.log("createMultipleNotesHTML - total pages:", pages.length);

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
    console.log("PDFExporter.export - options:", {
      selectedLayout: options.selectedLayout,
      notesPerPage: options.notesPerPage,
      totalNotes: options.generatedNotes.length || 1,
    });

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

    console.log(
      "PDFExporter.export - total pageContainers:",
      pageContainers.length,
    );

    for (let i = 0; i < pageContainers.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const pageContainer = pageContainers[i] as HTMLElement;
      console.log(`PDFExporter.export - página ${i + 1}:`, {
        className: pageContainer.className,
        width: pageContainer.offsetWidth,
        height: pageContainer.offsetHeight,
      });

      const canvas = await html2canvas(pageContainer, {
        useCORS: true,
        logging: false,
        width: pageContainer.offsetWidth,
        height: pageContainer.offsetHeight,
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
