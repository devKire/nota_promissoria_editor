// lib/exporters/pngExporter.ts
import html2canvas from "html2canvas";
import JSZip from "jszip";
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
  selectedLayout: 4 | 5 | "default"; // Adicionado para consistência com PDFExporter
}

export default class PNGExporter {
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

    // Layout específico para 4 notas (2x2)
    if (selectedLayout === 4) {
      return this.create4NotesPageHTML(notes, pageIndex, options);
    }

    // Layout para 5 notas
    if (selectedLayout === 5) {
      return this.createSavePaperPageHTML(notes, pageIndex, options);
    }

    // Layout normal (default)
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

    // Posições para as 4 notas (todas rotacionadas 90°)
    const positions = [
      // Posição 1: Canto superior esquerdo
      { top: 0, left: 0, rotated: true },
      // Posição 2: Canto inferior esquerdo
      { top: pageHeight - rotatedHeight, left: 0, rotated: true },
      // Posição 3: Canto superior direito
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

    // Alinhamento à esquerda
    const leftMargin = 0;

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

    // Calcular posição vertical para cada nota
    notes.forEach((note, index) => {
      if (index < notesPerPage) {
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

    // Criar ZIP para armazenar as imagens
    const zip = new JSZip();
    const pageContainers = container.querySelectorAll(".page-container");

    for (let i = 0; i < pageContainers.length; i++) {
      const pageContainer = pageContainers[i] as HTMLElement;
      const canvas = await html2canvas(pageContainer, {
        useCORS: true,
        logging: false,
        width: pageContainer.offsetWidth,
        height: pageContainer.offsetHeight,
      });

      // Converter canvas para PNG com qualidade
      const pngData = canvas.toDataURL("image/png", 1.0);

      // Extrair dados base64
      const base64Data = pngData.replace(/^data:image\/(png|jpeg);base64,/, "");

      // Adicionar ao ZIP
      const pageNumber = (i + 1).toString().padStart(3, "0");
      zip.file(`nota-promissoria-pagina-${pageNumber}.png`, base64Data, {
        base64: true,
      });
    }

    document.body.removeChild(tempElement);

    // Gerar e baixar o arquivo ZIP
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);

    const today = new Date().toISOString().split("T")[0];
    link.download = `notas-promissorias-${today}.zip`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpar URL
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  }

  print(options: ExportOptions) {
    try {
      const { note, generatedNotes } = options;
      const notesToExport = generatedNotes.length > 0 ? generatedNotes : [note];
      const html = this.createMultipleNotesHTML(notesToExport, options);

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Por favor, permita pop-ups para impressão.");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Nota${notesToExport.length > 1 ? "s" : ""} Promissória${notesToExport.length > 1 ? "s" : ""}</title>
            <meta charset="UTF-8">
            <style>
              body { 
                margin: 0; 
                padding: 0;
                font-family: Arial, Helvetica, sans-serif;
                background-color: white;
              }
              @media print {
                body { 
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                @page {
                  size: A4;
                  margin: 0 !important;
                }
                .note-container {
                  box-shadow: none !important;
                  border: 1px solid #000 !important;
                }
                #export-notes-container {
                  padding: 0 !important;
                }
                .page-container {
                  min-height: 297mm !important;
                }
              }
            </style>
          </head>
          <body>
            ${html}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 500);
                }, 100);
              }
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      alert("Erro ao imprimir. Tente novamente.");
    }
  }
}
