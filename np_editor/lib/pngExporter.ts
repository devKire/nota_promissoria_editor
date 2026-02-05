// lib/exporters/pngExporter.ts
import html2canvas from "html2canvas";
import JSZip from "jszip";
import { PromissoryNote } from "@/lib/default-note";

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
    const { savePaper } = options;

    // Dimensões fixas para modo savePaper (exatamente igual ao PDFExporter)
    let noteWidth = 150; // mm padrão
    let noteHeight = 100; // mm padrão

    if (savePaper) {
      noteWidth = 120; // mm para modo economizar papel
      noteHeight = 90; // mm para modo economizar papel
    }

    // Fontes ajustadas para tamanho menor (exatamente igual ao PDFExporter)
    const fontSizeTitle = savePaper ? "4.5mm" : "6mm";
    const fontSizeValue = savePaper ? "3mm" : "4mm";
    const fontSizeBody = savePaper ? "2.4mm" : "3.2mm";

    const noteHTML = `
    <div class="note-container" style="
      width: ${noteWidth}mm;
      height: ${noteHeight}mm;
      background-color: white;
      padding: ${savePaper ? "0 2mm" : "0 3mm"};
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
      border: 1px solid #eee;
      position: relative;
      ${rotated ? "transform: rotate(90deg); transform-origin: top left; margin-left: 90mm;" : ""}
    ">
        <div style="
          width: 100%;
          box-sizing: border-box;
          height: 100%;
          display: flex;
          flex-direction: column;
          ${rotated ? "transform: translateX(0mm);" : ""}
        ">
          <!-- 1. Título Principal -->
          <div style="
            text-align: center; 
            margin: 0;
          ">
            <h1 style="
              font-size: ${fontSizeTitle}; 
              font-weight: bold; 
              margin: 0;
              text-transform: uppercase;
              line-height: 1.8;
              text-decoration: underline black;
            ">
              NOTA PROMISSÓRIA
            </h1>
          </div>
          
          <!-- 2 e 3. Número da Nota e Vencimento -->
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin: 0;
            padding: 0;
            line-height: 1.2;
          ">
            <!-- Nº da Nota -->
            <div style="transform: translateY(-1.5mm);">
              <span style="font-weight: bold; font-size: ${fontSizeBody};">Nº:</span>
              <span style="margin-left: 1mm; font-size: ${fontSizeBody};">${note.number}</span>
            </div>

            <!-- Vencimento e Valor -->
            <div style="text-align: right;">
              <div style="margin: 0;">
                <span style="font-weight: bold; font-size: ${fontSizeBody};">Vencimento:</span>
                <span style="margin-left: 1mm; font-size: ${fontSizeBody};">${this.config.formatDateDDMMYYYY(note.dueDate)}</span>
              </div>
              <div style="margin-top: 0.5mm;">
                <span style="
                  font-weight: bold;
                  font-size: ${fontSizeValue};
                  display: inline-block;
                ">
                  Valor: ${this.config.formatCurrency(note.amount)}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 4. Corpo do Texto -->
          <div style="
            margin-bottom: ${savePaper ? "3mm" : "5mm"};
          ">
            <p style="
              text-align: justify;
              line-height: 1.5;
              margin: 0;
              font-size: ${fontSizeBody};
            ">
              ${this.config.formatFullDate(note.dueDate)}, pagarei por esta nota promissória à ${note.beneficiaryName}, CNPJ n° ${note.beneficiaryCNPJ}, ou à sua ordem, a quantia de <strong>${note.formattedAmount}</strong>, em moeda corrente nacional.
            </p>
            
            <!-- 6. Local de Pagamento -->
            <p style="
              text-align: left;
              line-height: 1.5;
              font-size: ${fontSizeBody};
              margin: 0;
              margin-top: 2mm;
            ">
              Pagável em ${note.paymentLocation}.
            </p>
          </div>

          <!-- 7. Seção EMITENTE -->
          <div style="
            margin-bottom: 3mm;
            flex-shrink: 0;
          ">
            <h2 style="
              font-weight: bold;
              font-size: ${fontSizeBody};
              text-transform: uppercase;
              line-height: 1.3;
              margin: 0;
            ">
              EMITENTE
            </h2>
            
            <div style="
              line-height: 1.6;
              font-size: ${fontSizeBody};
            ">
              <!-- Nome -->
              <span style="font-weight: bold; display: inline-block; font-size: ${fontSizeBody};">Nome:</span>
              <span style="font-size: ${fontSizeBody};">${note.emitterName}</span>
              <!-- CPF -->
              <div>
                <span style="font-weight: bold; display: inline-block; font-size: ${fontSizeBody};">CPF:</span>
                <span style="font-size: ${fontSizeBody};">${note.emitterCPF}</span>
              </div>
              
              <!-- Endereço -->
              <div>
                <span style="font-weight: bold; display: inline-block; vertical-align: top; font-size: ${fontSizeBody};">Endereço:</span>
                <span style="font-size: ${fontSizeBody};">${note.emitterAddress}</span>
              </div>
            </div>
          </div>
    
          <!-- 8. Local e Data -->
          <div style="
            text-align: left;
            flex-shrink: 0;
            margin-bottom: ${savePaper ? "10mm" : "15mm"};
            font-size: ${fontSizeBody};
          ">
            <p style="margin: 0;">
              ${note.city}, ${this.config.formatDate(note.issueDate)}.
            </p>
          </div>
          
          <!-- Espaço para assinatura -->
          <div style="
            flex-shrink: 0;
            position: absolute;
            bottom: 8mm;
            left: 0;
            right: 0;
          ">
            <div style="
              width: 60%;
              height: 1px;
              background-color: #000;
              margin-bottom: 1mm;
            "></div>
            <p style="
              margin: 0 0 0 15mm;
              font-weight: bold;
              font-size: ${fontSizeBody};
              text-transform: uppercase;
              line-height: 1.3;
            ">
              ${note.emitterName.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    `;

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

    // Layout savePaper: 120x90mm, máximo 5 notas por página (exatamente igual ao PDFExporter)
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

    // Posições fixas para as notas (modo economizar papel) - exatamente igual ao PDFExporter
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

    // Dimensões padrão (exatamente igual ao PDFExporter)
    const noteWidth = 150; // mm
    const noteHeight = 99; // mm
    const pageWidth = 210; // mm (largura A4)
    const pageHeight = 297; // mm (altura A4)

    // Alinhamento à esquerda para melhor aproveitamento do papel (igual ao PDFExporter)
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

    // Calcular posição vertical para cada nota (uma abaixo da outra) - igual ao PDFExporter
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

    // SEMPRE múltiplas notas por página (comportamento padrão) - igual ao PDFExporter
    let html = `
      <div id="export-notes-container" style="
        width: 210mm;
        background-color: white;
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
        padding: 0;
      ">
    `;

    // Dividir notas em páginas - igual ao PDFExporter
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
      const canvas = await html2canvas(pageContainers[i] as HTMLElement, {
        useCORS: true,
        logging: false,
        width: (pageContainers[i] as HTMLElement).offsetWidth,
        height: (pageContainers[i] as HTMLElement).offsetHeight,
      });

      // Converter canvas para PNG com qualidade
      const pngData = canvas.toDataURL("image/png", 0.9);

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
