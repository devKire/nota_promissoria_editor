// components/ExportControls.tsx
"use client";

import { useState } from "react";
import { Download, FileImage, Printer, File, Copy } from "lucide-react";
import { PromissoryNote } from "@/lib/default-note";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportControlsProps {
  note: PromissoryNote;
  generatedNotes: PromissoryNote[];
  printMultiple: boolean;
  notesPerPage: number;
  savePaper: boolean;
}

export default function ExportControls({
  note,
  generatedNotes,
  printMultiple,
  notesPerPage,
  savePaper,
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split("-");
      const months = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro",
      ];
      return `${parseInt(day)} de ${months[parseInt(month) - 1]} de ${year}`;
    } catch {
      return dateString;
    }
  };

  // Função para formatar data com dia, mês e ano por extenso
  const formatFullDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split("-");
      const months = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro",
      ];
      const dayNumber = parseInt(day);
      const monthName = months[parseInt(month) - 1];
      const yearInWords = convertYearToWords(parseInt(year));
      return `Aos ${dayNumber} dias do mês de ${monthName} do ano de ${yearInWords}`;
    } catch {
      return dateString;
    }
  };

  // Função para converter ano em palavras
  const convertYearToWords = (year: number): string => {
    if (year < 1000 || year > 9999) return year.toString();

    const thousands = Math.floor(year / 1000);
    const hundreds = Math.floor((year % 1000) / 100) * 100;
    const tensAndUnits = year % 100;

    let result = "";

    // Milhar
    if (thousands === 2) {
      result = "dois mil";
    } else if (thousands === 1) {
      result = "mil";
    }

    // Centenas
    if (hundreds > 0) {
      const hundredsMap: { [key: number]: string } = {
        100: "e cem",
        200: "e duzentos",
        300: "e trezentos",
        400: "e quatrocentos",
        500: "e quinhentos",
        600: "e seiscentos",
        700: "e setecentos",
        800: "e oitocentos",
        900: "e novecentos",
      };

      if (result) {
        result += ` ${hundredsMap[hundreds]}`;
      } else {
        result = hundredsMap[hundreds].replace("e ", "");
      }
    }

    // Dezenas e unidades
    if (tensAndUnits > 0) {
      const unitsMap: { [key: number]: string } = {
        1: "um",
        2: "dois",
        3: "três",
        4: "quatro",
        5: "cinco",
        6: "seis",
        7: "sete",
        8: "oito",
        9: "nove",
        10: "dez",
        11: "onze",
        12: "doze",
        13: "treze",
        14: "catorze",
        15: "quinze",
        16: "dezesseis",
        17: "dezessete",
        18: "dezoito",
        19: "dezenove",
        20: "vinte",
        30: "trinta",
        40: "quarenta",
        50: "cinquenta",
        60: "sessenta",
        70: "setenta",
        80: "oitenta",
        90: "noventa",
      };

      if (tensAndUnits in unitsMap) {
        if (result) {
          result += ` e ${unitsMap[tensAndUnits]}`;
        } else {
          result = unitsMap[tensAndUnits];
        }
      } else {
        const tens = Math.floor(tensAndUnits / 10) * 10;
        const units = tensAndUnits % 10;
        if (result) {
          result += ` e ${unitsMap[tens]} e ${unitsMap[units]}`;
        } else {
          result = `${unitsMap[tens]} e ${unitsMap[units]}`;
        }
      }
    }

    return result;
  };

  // Função para formatar data no formato DD/MM/YYYY
  const formatDateDDMMYYYY = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Função para criar HTML de uma única nota (com dimensões fixas)
  const createNoteHTML = (
    note: PromissoryNote,
    smallSize = false,
    isPageContent = false,
  ) => {
    // DIMENSÕES AJUSTÁVEIS: padrão 150x100mm, reduzido 140x93mm para economizar papel
    let noteWidth = 150; // mm
    let noteHeight = 100; // mm

    // Se estamos em modo de economizar papel E é para múltiplas notas
    if (savePaper && printMultiple && notesPerPage > 1) {
      // Reduzir para encaixar 3 na horizontal e 2 na vertical
      noteWidth = 140; // mm (reduzido de 150)
      noteHeight = 93; // mm (reduzido de 100)
    }

    // Fontes ajustadas para o tamanho
    const fontSizeTitle = smallSize ? "5mm" : "6mm";
    const fontSizeValue = smallSize ? "3.5mm" : "4mm";
    const fontSizeBody = smallSize ? "2.8mm" : "3.2mm";

    // Ajustar ainda mais as fontes se estiver em modo economizar papel
    const adjustedFontSizeBody =
      savePaper && printMultiple && notesPerPage > 1 ? "2.6mm" : fontSizeBody;
    const adjustedFontSizeTitle =
      savePaper && printMultiple && notesPerPage > 1 ? "4.5mm" : fontSizeTitle;

    return `
    <div class="note-container ${isPageContent ? "page-note" : ""}" style="
      width: ${noteWidth}mm;
      height: ${noteHeight}mm;
      background-color: white;
      padding: 0 3mm 0 3mm;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
      border: 1px solid #eee;
      page-break-inside: avoid;
      position: relative;
    ">
        <div style="
          width: 100%;
          box-sizing: border-box;
          height: 100%;
          display: flex;
          flex-direction: column;
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
              line-height: 2;
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
                <span style="margin-left: 1mm; font-size: ${fontSizeBody};">${formatDateDDMMYYYY(note.dueDate)}</span>
              </div>
              <div style="margin-top: 0.5mm;">
                <span style="
                  font-weight: bold;
                  font-size: ${fontSizeValue};
                  display: inline-block;
                ">
                  Valor: ${formatCurrency(note.amount)}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 4. Corpo do Texto -->
          <div style="
            margin-bottom: 5mm;
          ">
            <p style="
              text-align: justify;
              line-height: 1.6;
              margin: 0;
              font-size: ${fontSizeBody};
            ">
              Aos ${formatFullDate(note.dueDate)}, pagarei por esta nota promissória à ${note.beneficiaryName}, CNPJ n° ${note.beneficiaryCNPJ}, ou à sua ordem, a quantia de <strong>${note.formattedAmount}</strong>, em moeda corrente nacional.
            </p>
            
            <!-- 6. Local de Pagamento -->
            <p style="
              text-align: left;
              line-height: 1.6;
              font-size: ${fontSizeBody};
              margin: 0;
            ">
              Pagável em ${note.paymentLocation}.
            </p>
          </div>

          <!-- 7. Seção EMITENTE -->
          <div style="
            margin-bottom: 4mm;
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
              line-height: 1.8;
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
            margin-bottom: 15mm;
            font-size: ${fontSizeBody};
          ">
            <p style="margin: 0;">
              ${note.city}, ${formatDate(note.issueDate)}.
            </p>
          </div>
          
          <!-- Espaço para assinatura -->
          <div style="
            flex-shrink: 0;
            bottom: 10mm;
            left: 0;
            right: 0;
          ">
            <div style="
              width: 70%;
              height: 1px;
              background-color: #000;
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
  };

  // Função para criar HTML de uma página com múltiplas notas
  const createPageHTML = (notes: PromissoryNote[], pageIndex: number) => {
    const smallSize = notesPerPage > 1;

    // Calcular dimensões das notas
    let noteWidth = 150; // mm padrão
    let noteHeight = 100; // mm padrão

    if (savePaper && printMultiple && notesPerPage > 1) {
      noteWidth = 140; // mm reduzido
      noteHeight = 93; // mm reduzido
    }

    // Calcular quantas notas cabem por linha
    const maxWidth = 210; // largura A4 em mm
    const notesPerRow = Math.floor(maxWidth / noteWidth);

    // Para economizar papel, sempre 3 na horizontal e 2 na vertical
    let actualNotesPerRow = notesPerRow;
    let rowsPerPage = Math.ceil(notesPerPage / notesPerRow);

    if (savePaper && printMultiple && notesPerPage > 1) {
      // Forçar 3 na horizontal quando em modo economizar papel
      actualNotesPerRow = 3;
      rowsPerPage = Math.ceil(notesPerPage / 3);
    }

    // Altura da página A4
    const pageHeight = 297; // mm
    const maxRows = Math.floor(pageHeight / noteHeight);

    // Limitar rows se necessário
    if (rowsPerPage > maxRows) {
      rowsPerPage = maxRows;
    }

    let html = `
    <div class="page-container" id="page-${pageIndex}" style="
      width: 210mm;
      min-height: 297mm;
      background-color: white;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
      padding: 0;
      page-break-after: always;
      display: grid;
      grid-template-columns: repeat(${actualNotesPerRow}, ${noteWidth}mm);
      grid-auto-rows: ${noteHeight}mm;
      gap: 0;
      align-content: start;
    ">
  `;

    notes.forEach((note, index) => {
      html += createNoteHTML(note, smallSize, true);
    });

    html += "</div>";
    return html;
  };
  // Criar HTML para múltiplas notas com paginação
  const createMultipleNotesHTML = (notes: PromissoryNote[]) => {
    if (!printMultiple) {
      // UMA NOTA POR PÁGINA - MAS TODAS AS NOTAS DEVEM SER INCLUÍDAS
      let html = `
        <div id="export-notes-container" style="
          width: 210mm;
          background-color: white;
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
          padding: 0;
        ">
      `;

      notes.forEach((note, index) => {
        if (index > 0) html += '<div style="page-break-before: always;"></div>';
        // Para cada nota, criar uma página com a nota centralizada
        html += `
          <div style="
            width: 210mm;
            min-height: 297mm;
            display: flex;
            justify-content: center;
            align-items: center;
            page-break-after: always;
          ">
        `;
        html += createNoteHTML(note, false, false);
        html += "</div>";
      });

      html += "</div>";
      return html;
    } else {
      // Múltiplas notas por página
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
        html += createPageHTML(pageNotes, pageIndex);
      });

      html += "</div>";
      return html;
    }
  };

  const createTempElement = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "fixed";
    tempDiv.style.left = "0";
    tempDiv.style.top = "0";
    tempDiv.style.width = "210mm";
    tempDiv.style.zIndex = "9999";
    tempDiv.style.opacity = "0";
    tempDiv.innerHTML = html;
    document.body.appendChild(tempDiv);
    return tempDiv;
  };

  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const notesToExport = generatedNotes.length > 0 ? generatedNotes : [note];
      const html = createMultipleNotesHTML(notesToExport); // SEMPRE usar todas as notas

      const tempElement = createTempElement(html);
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

      if (!printMultiple) {
        // Modo uma nota por página
        const pageDivs = container.querySelectorAll(
          'div[style*="page-break-after: always"]',
        );

        for (let i = 0; i < pageDivs.length; i++) {
          if (i > 0) {
            pdf.addPage();
          }

          const canvas = await html2canvas(pageDivs[i] as HTMLElement, {
            useCORS: true,
            logging: false,
            width: (pageDivs[i] as HTMLElement).offsetWidth,
            height: (pageDivs[i] as HTMLElement).offsetHeight,
          });

          const imgData = canvas.toDataURL("image/png", 1.0);

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, "", "FAST");
        }
      } else {
        // Modo múltiplo: várias notas por página
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

          // Ajustar para caber na página A4
          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, "", "FAST");
        }
      }

      document.body.removeChild(tempElement);
      pdf.save(
        `notas-promissorias-${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao exportar PDF. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsImage = async () => {
    setIsExporting(true);
    try {
      const notesToExport = generatedNotes.length > 0 ? generatedNotes : [note];
      const html = createMultipleNotesHTML(notesToExport); // SEMPRE usar todas as notas

      const tempElement = createTempElement(html);
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!printMultiple) {
        // Exportar cada página separadamente
        const pageDivs = tempElement.querySelectorAll(
          'div[style*="page-break-after: always"]',
        );

        for (let i = 0; i < pageDivs.length; i++) {
          const canvas = await html2canvas(pageDivs[i] as HTMLElement, {
            useCORS: true,
            logging: false,
            width: (pageDivs[i] as HTMLElement).offsetWidth,
            height: (pageDivs[i] as HTMLElement).offsetHeight,
          });

          const link = document.createElement("a");
          link.download = `nota-promissoria-${i + 1}-${new Date().toISOString().split("T")[0]}.png`;
          link.href = canvas.toDataURL("image/png", 1.0);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Exportar múltiplas notas como uma imagem por página
        const pageContainers = tempElement.querySelectorAll(".page-container");

        for (let i = 0; i < pageContainers.length; i++) {
          const canvas = await html2canvas(pageContainers[i] as HTMLElement, {
            useCORS: true,
            logging: false,
            width: (pageContainers[i] as HTMLElement).offsetWidth,
            height: (pageContainers[i] as HTMLElement).offsetHeight,
          });

          const link = document.createElement("a");
          link.download = `notas-promissorias-pagina-${i + 1}-${new Date().toISOString().split("T")[0]}.png`;
          link.href = canvas.toDataURL("image/png", 1.0);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }

      document.body.removeChild(tempElement);
    } catch (error) {
      console.error("Erro ao exportar imagem:", error);
      alert("Erro ao exportar imagem. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  const printNote = () => {
    try {
      const notesToExport = generatedNotes.length > 0 ? generatedNotes : [note];
      const html = createMultipleNotesHTML(notesToExport); // SEMPRE usar todas as notas

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
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Exportar Documento {""}{" "}
        <span className="text-red-600">(ARQUIVO PDF ESTÁVEL)</span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={exportAsPDF}
          disabled={isExporting}
          className="flex flex-col items-center justify-center p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
          title="Exportar como PDF"
        >
          <File className="w-6 h-6 mb-2" />
          <span className="text-sm">PDF</span>
        </button>

        <button
          onClick={exportAsImage}
          disabled={isExporting}
          className="flex flex-col items-center justify-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
          title="Exportar como Imagem PNG"
        >
          <FileImage className="w-6 h-6 mb-2" />
          <span className="text-sm">Imagem</span>
        </button>

        <button
          onClick={printNote}
          disabled={isExporting}
          className="flex flex-col items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          title="Imprimir documento"
        >
          <Printer className="w-6 h-6 mb-2" />
          <span className="text-sm">Imprimir</span>
        </button>

        {generatedNotes.length > 1 && (
          <button
            onClick={() =>
              navigator.clipboard.writeText(
                JSON.stringify(generatedNotes, null, 2),
              )
            }
            className="flex flex-col items-center justify-center p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            title="Copiar dados das parcelas"
          >
            <Copy className="w-6 h-6 mb-2" />
            <span className="text-sm">Copiar</span>
          </button>
        )}
      </div>

      {isExporting && (
        <div className="text-center text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <p>Gerando documento... Aguarde.</p>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
        <p className="text-center">
          {generatedNotes.length > 1
            ? `Gerando ${generatedNotes.length} nota(s)${
                printMultiple
                  ? ` em ${Math.ceil(generatedNotes.length / notesPerPage)} página(s)`
                  : ""
              } - ${
                savePaper && printMultiple && notesPerPage > 1
                  ? "Dimensões reduzidas: 140mm x 93mm (até 5 notas/página)"
                  : "Dimensões padrão: 150mm x 100mm"
              }`
            : "Dimensões padrão: 150mm de largura x 100mm de altura"}
        </p>
      </div>
    </div>
  );
}
