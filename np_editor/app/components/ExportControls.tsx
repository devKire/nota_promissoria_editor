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
}

export default function ExportControls({
  note,
  generatedNotes,
  printMultiple,
  notesPerPage,
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

  // Função para criar HTML de uma única nota (versão reduzida para múltiplas)
  const createNoteHTML = (
    note: PromissoryNote,
    smallSize = false,
    isPageContent = false,
  ) => {
    // Ajustes para tamanho reduzido
    const scaleFactor = smallSize ? 0.85 : 1;

    // Se for smallSize, mantemos a mesma estrutura mas com fontes menores
    const fontSizeTitle = smallSize ? "6mm" : "7mm";
    const fontSizeValue = smallSize ? "3.8mm" : "4.5mm";
    const fontSizeBody = smallSize ? "3.2mm" : "3.8mm";
    const fontSizeEmitente = smallSize ? "3.4mm" : "4mm";
    const paddingTop = smallSize ? "3mm" : "5mm";
    const paddingBottom = smallSize ? "12mm" : "25mm";
    const paddingSide = smallSize ? "10mm" : "25mm";
    const marginBottomEmitente = smallSize ? "6mm" : "10mm";
    const marginBottomLocal = smallSize ? "8mm" : "15mm";
    const lineHeight = smallSize ? "1.4" : "1.6";

    return `
  <div class="note-container ${isPageContent ? "page-note" : ""}" style="
    ${smallSize ? "width: 200mm; min-height: 85mm;" : "width: 210mm; min-height: 280mm;"}
    background-color: white;
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
    border: ${isPageContent ? "none" : "1px solid #eee"};
    page-break-inside: avoid;
    ${smallSize && !isPageContent ? "margin-bottom: 3mm;" : ""}
  ">
    <div style="
      width: 100%;
      padding: ${paddingTop} ${paddingSide} ${paddingBottom};
      box-sizing: border-box;
      height: 100%;
      display: flex;
      flex-direction: column;
    ">
      <!-- 1. Título Principal -->
      <div style="
        text-align: center; 
        margin-bottom: 0mm;
        flex-shrink: 0;
      ">
        <h1 style="
          font-size: ${fontSizeTitle}; 
          font-weight: bold; 
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          line-height: 1.2;
          text-decoration: underline black;
        ">
          NOTA PROMISSÓRIA
        </h1>
      </div>
      
      <!-- 2. Numero da Nota -->
      <div style="margin-top: 2mm; margin-bottom: 1mm;">
        <span style="font-weight: bold; font-size: ${fontSizeBody};">Nº:</span>
        <span style="margin-left: 2mm; font-size: ${fontSizeBody};">${note.number}</span>
      </div>
      
      <!-- 3. Vencimento e Valor -->
      <div style="
        text-align: right;
        margin-bottom: 0;
        flex-shrink: 0;
      ">
        <div style="margin-bottom: 1mm;">
          <span style="font-weight: bold; font-size: ${fontSizeBody};">Vencimento:</span>
          <span style="margin-left: 2mm; font-size: ${fontSizeBody};">${formatDateDDMMYYYY(note.dueDate)}</span>
        </div>
        <div>
          <span style="
            font-weight: bold; 
            font-size: ${fontSizeValue};
            padding: 1mm 2mm;
            display: inline-block;
          ">
            Valor: ${formatCurrency(note.amount)}
          </span>
        </div>
      </div>
      
      <!-- 4. Corpo do Texto -->
      <div style="
        flex-grow: 1;
        margin-bottom: 0;
        margin-top: ${smallSize ? "4mm" : "15mm"};
      ">
        <p style="
          text-align: justify;
          line-height: ${lineHeight};
          margin: 0;
          font-size: ${fontSizeBody};
        ">
          ${formatFullDate(note.dueDate)}, pagarei por esta nota promissória à ${note.beneficiaryName}, CNPJ n° ${note.beneficiaryCNPJ}, ou à sua ordem, a quantia de <strong>${note.formattedAmount}</strong>, em moeda corrente nacional.
        </p>
        
        <!-- 6. Local de Pagamento -->
        <p style="
          text-align: left;
          line-height: ${lineHeight};
          font-size: ${fontSizeBody};
          margin-top: ${smallSize ? "2mm" : "5mm"};
          margin-bottom: ${smallSize ? "4mm" : "10mm"};
        ">
          Pagável em ${note.paymentLocation}.
        </p>
      </div>
      
      <!-- 7. Seção EMITENTE -->
      <div style="
        flex-shrink: 0;
        margin-bottom: ${marginBottomEmitente};
      ">
        <h2 style="
          font-weight: bold;
          font-size: ${fontSizeEmitente};
          text-transform: uppercase;
          line-height: 1.3;
          margin: 0 0 1mm 0;
        ">
          EMITENTE
        </h2>
        
        <div style="
          line-height: ${lineHeight};
          font-size: ${fontSizeBody};
        ">
          <!-- Nome -->
          <div style="margin-bottom: 1mm;">
            <span style="font-weight: bold; display: inline-block;">Nome:</span>
            <span style="margin-left: 2mm;">${note.emitterName}</span>
          </div>
          
          <!-- CPF -->
          <div style="margin-bottom: 1mm;">
            <span style="font-weight: bold; display: inline-block;">CPF:</span>
            <span style="margin-left: 2mm;">${note.emitterCPF}</span>
          </div>
          
          <!-- Endereço -->
          <div>
            <span style="font-weight: bold; display: inline-block; vertical-align: top;">Endereço:</span>
            <span style="margin-left: 2mm; display: inline-block; width: calc(100% - 22mm);">${note.emitterAddress}</span>
          </div>
        </div>
      </div>
      
      <!-- 8. Local e Data e Assinatura -->
      <div style="
        margin-top: auto;
        padding-top: ${smallSize ? "2mm" : "5mm"};
        flex-shrink: 0;
      ">
        <!-- Local e Data -->
        <div style="
          text-align: left;
          margin-bottom: ${smallSize ? "8mm" : "15mm"};
          font-size: ${fontSizeBody};
        ">
          <p style="margin: 0;">
            ${note.city}, ${formatDate(note.issueDate)}.
          </p>
        </div>
        
        <!-- Espaço para assinatura -->
        <div style="
          flex-shrink: 0;
        ">
          <div style="
            width: 70%;
            height: 1px;
            background-color: #000;
          "></div>
          <p style="
            margin: 2mm 0 0 0;
            font-weight: bold;
            font-size: ${fontSizeBody};
            margin-left: 15mm; 
            text-transform: uppercase;
            line-height: 1.3;
          ">
            ${note.emitterName.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  </div>
`;
  };

  // Função para criar HTML de uma página com múltiplas notas
  const createPageHTML = (notes: PromissoryNote[], pageIndex: number) => {
    const smallSize = notesPerPage > 1;

    let html = `
      <div class="page-container" id="page-${pageIndex}" style="
        width: 210mm;
        min-height: 297mm;
        background-color: white;
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
        padding: 0;
        page-break-after: always;
        display: flex;
        flex-direction: column;
        gap: 2mm;
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
    const smallSize = notesPerPage > 1;

    if (!printMultiple || notesPerPage === 1) {
      // Uma nota por página ou não é múltiplo
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
        html += createNoteHTML(note, false, false);
      });

      html += "</div>";
      return html;
    } else {
      // Múltiplas notas por página com paginação
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
      const html = printMultiple
        ? createMultipleNotesHTML(notesToExport)
        : createMultipleNotesHTML([notesToExport[0]]);

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

      if (!printMultiple || notesPerPage === 1) {
        // Modo simples: uma nota por página
        const noteContainers = container.querySelectorAll(
          ".note-container:not(.page-note)",
        );

        for (let i = 0; i < noteContainers.length; i++) {
          if (i > 0) {
            pdf.addPage();
          }

          const canvas = await html2canvas(noteContainers[i] as HTMLElement, {
            useCORS: true,
            logging: false,
            width: (noteContainers[i] as HTMLElement).offsetWidth,
            height: (noteContainers[i] as HTMLElement).offsetHeight,
          });

          const imgData = canvas.toDataURL("image/png");

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let finalHeight = imgHeight;
          let finalWidth = imgWidth;

          if (imgHeight > pageHeight) {
            finalHeight = pageHeight;
            finalWidth = (canvas.width * finalHeight) / canvas.height;
          }

          pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            finalWidth,
            finalHeight,
            "",
            "FAST",
          );
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

          const imgData = canvas.toDataURL("image/png");

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let finalHeight = imgHeight;
          let finalWidth = imgWidth;

          if (imgHeight > pageHeight) {
            finalHeight = pageHeight;
            finalWidth = (canvas.width * finalHeight) / canvas.height;
          }

          pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            finalWidth,
            finalHeight,
            "",
            "FAST",
          );
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
      const html = printMultiple
        ? createMultipleNotesHTML(notesToExport)
        : createNoteHTML(notesToExport[0], false, false);

      const tempElement = createTempElement(html);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const container = tempElement.querySelector(
        printMultiple ? "#export-notes-container" : ".note-container",
      ) as HTMLElement;
      if (!container) throw new Error("Container não encontrado");

      const canvas = await html2canvas(container, {
        useCORS: true,
        logging: false,
        width: container.offsetWidth,
        height: container.offsetHeight,
      });

      document.body.removeChild(tempElement);
      const link = document.createElement("a");
      link.download = `nota${generatedNotes.length > 1 ? "s" : ""}-promissoria${generatedNotes.length > 1 ? "s" : ""}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      const html = printMultiple
        ? createMultipleNotesHTML(notesToExport)
        : createMultipleNotesHTML([notesToExport[0]]);

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
                  border: none !important;
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
        Exportar Documento
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
          {printMultiple && notesPerPage > 1
            ? `Gerando ${generatedNotes.length} nota(s) em ${Math.ceil(generatedNotes.length / notesPerPage)} página(s)`
            : "Para melhor qualidade, use 'Imprimir' ou 'PDF'"}
        </p>
      </div>
    </div>
  );
}
