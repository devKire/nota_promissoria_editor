// components/ExportControls.tsx
"use client";

import { useState } from "react";
import { Download, FileImage, Printer, File } from "lucide-react";
import { PromissoryNote } from "@/lib/default-note";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportControlsProps {
  note: PromissoryNote;
}

export default function ExportControls({ note }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Função para formatar datas
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

  // Criar elemento HTML para exportação
  // Criar elemento HTML para exportação
  const createExportHTML = () => {
    return `
    <div id="export-note-container" style="
      width: 210mm;
      background-color: white;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 280mm; /* Altura reduzida para caber melhor */
    ">
      <div style="
        font-family: 'Times New Roman', Times, serif;
        width: 180mm; /* Largura reduzida */
        padding: 15mm;
        box-sizing: border-box;
        background-color: white;
      ">
        <div style="text-align: center; margin-bottom: 15mm;">
          <h1 style="font-size: 24pt; font-weight: bold; margin-bottom: 4mm; text-transform: uppercase;">
            NOTA PROMISSÓRIA
          </h1>
          <div style="height: 1px; width: 80mm; background: #000; margin: 0 auto;"></div>
        </div>
        
        <div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 2mm; margin-bottom: 4mm;">
            <span style="font-weight: bold;">N°:</span>
            <span>${note.number}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 2mm; margin-bottom: 4mm;">
            <span style="font-weight: bold;">Vencimento:</span>
            <span>${formatDate(note.dueDate)}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 2mm; margin-bottom: 8mm;">
            <span style="font-weight: bold;">Valor:</span>
            <span style="font-weight: bold; font-size: 14pt;">${formatCurrency(note.amount)}</span>
          </div>
          
          <div style="text-align: justify; margin-bottom: 10mm; line-height: 1.6;">
            <p style="margin-bottom: 4mm;">
              Aos <span style="padding: 0 2mm;">${formatDate(note.dueDate)}</span>,
              pagarei por esta nota promissória à 
              <span style="padding: 0 2mm;"> ${note.beneficiaryName}</span>,
              CNPJ n° <span style="padding: 0 2mm;">${note.beneficiaryCNPJ}</span>,
              ou à sua ordem, a quantia de
              <span style="padding: 0 2mm;"> ${note.formattedAmount}</span>,
              em moeda corrente nacional.
            </p>
            <p>
              Pagável em <span style="padding: 0 2mm;">${note.paymentLocation}</span>.
            </p>
          </div>
          
          <div style="border-top: 1px solid #000; padding-top: 6mm; margin-top: 8mm;">
            <h3 style="font-weight: bold; font-size: 16pt; text-align: center; margin-bottom: 6mm; text-transform: uppercase;">
              EMITENTE
            </h3>
            <div style="line-height: 1.8;">
              <p>
                <span style="font-weight: bold;">Nome:</span> 
                <span style="padding: 0 2mm; margin-left: 2mm;">${note.emitterName}</span>
              </p>
              <p>
                <span style="font-weight: bold;">CPF:</span> 
                <span style="padding: 0 2mm; margin-left: 2mm;">${note.emitterCPF}</span>
              </p>
              <p>
                <span style="font-weight: bold;">Endereço:</span> 
                <span style="padding: 0 2mm; margin-left: 2mm;">${note.emitterAddress}</span>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 12mm;">
            <p>
              <span style="font-weight: bold;">${note.city}</span>, 
              <span style="padding: 0 2mm; margin-left: 2mm;">${formatDate(note.issueDate)}</span>.
            </p>
            <div style="border-top: 1px solid #000; padding-top: 6mm; margin-top: 10mm;">
              <div style="
                height: 35mm; 
                border: 1px solid #666; 
                margin-top: 6mm;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <p style="color: #666; font-style: italic;">Assinatura do emitente</p>
              </div>
              <p style="font-weight: bold; margin-top: 4mm; font-size: 12pt;">${note.emitterName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  };

  // Função para criar elemento temporário
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
      const html = createExportHTML();
      const tempElement = createTempElement(html);

      // Pequeno delay para garantir renderização
      await new Promise((resolve) => setTimeout(resolve, 100));

      const container = tempElement.querySelector(
        "#export-note-container",
      ) as HTMLElement;

      if (!container) {
        throw new Error("Container de exportação não encontrado");
      }

      const canvas = await html2canvas(container, {
        useCORS: true,
        logging: false,
      });

      document.body.removeChild(tempElement);

      const imgData = canvas.toDataURL("image/png");

      // Criar PDF com orientação e formato A4
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Configurações de página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Margens reduzidas
      const margin = 3; // Reduzido de 5 para 3mm
      const imgWidth = pageWidth - 2 * margin;

      // Calcular altura mantendo proporção
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // VERIFICAR SE A IMAGEM É MENOR QUE A PÁGINA
      // Se for menor, centralizar verticalmente
      // Se for maior, ajustar a escala
      if (imgHeight > pageHeight - 2 * margin) {
        // Se não couber (muito grande), ajustar a escala para caber
        const scale = (pageHeight - 2 * margin) / imgHeight;
        const scaledImgWidth = imgWidth * scale;
        const scaledImgHeight = imgHeight * scale;

        // Centralizar verticalmente
        const yOffset =
          margin + (pageHeight - 2 * margin - scaledImgHeight) / 2;

        // Centralizar horizontalmente também
        const xOffset = margin + (pageWidth - 2 * margin - scaledImgWidth) / 2;

        pdf.addImage(
          imgData,
          "PNG",
          xOffset,
          yOffset,
          scaledImgWidth,
          scaledImgHeight,
        );
      } else {
        // Se couber (é menor que a página), centralizar verticalmente
        const yOffset = margin + (pageHeight - 2 * margin - imgHeight) / 2;

        // Centralizar horizontalmente
        const xOffset = margin + (pageWidth - 2 * margin - imgWidth) / 2;

        pdf.addImage(
          imgData,
          "PNG",
          xOffset, // Centralizado horizontalmente
          yOffset, // Centralizado verticalmente
          imgWidth,
          imgHeight,
        );
      }

      // Salvar PDF
      pdf.save(`nota-promissoria-${note.number.replace(/ /g, "-")}.pdf`);

      console.log("PDF exportado com sucesso!");
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
      const html = createExportHTML();
      const tempElement = createTempElement(html);

      // Pequeno delay para garantir renderização
      await new Promise((resolve) => setTimeout(resolve, 100));

      const container = tempElement.querySelector(
        "#export-note-container",
      ) as HTMLElement;

      if (!container) {
        throw new Error("Container de exportação não encontrado");
      }

      const canvas = await html2canvas(container, {
        useCORS: true,
        logging: false,
      });

      document.body.removeChild(tempElement);

      // Criar link para download da imagem
      const link = document.createElement("a");
      link.download = `nota-promissoria-${note.number.replace(/ /g, "-")}.png`;
      link.href = canvas.toDataURL("image/png", 1.0); // Qualidade máxima

      // Adicionar link ao documento, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Imagem exportada com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar imagem:", error);
      alert("Erro ao exportar imagem. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  const printNote = () => {
    try {
      const html = createExportHTML();

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Por favor, permita pop-ups para impressão.");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Nota Promissória - ${note.number}</title>
            <meta charset="UTF-8">
            <style>
              body { 
                margin: 0; 
                padding: 0;
                font-family: 'Times New Roman', Times, serif;
              }
              @media print {
                body { 
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                @page {
                  size: A4;
                  margin: 05mm;
                }
              }
            </style>
          </head>
          <body>
            ${html}
            <script>
              window.onload = function() {
                // Pequeno delay para garantir que tudo carregou
                setTimeout(function() {
                  window.print();
                  // Fechar a janela após impressão
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

  const exportBoth = async () => {
    setIsExporting(true);
    try {
      // Exportar PDF primeiro
      await exportAsPDF();

      // Pequeno delay para evitar conflitos
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Exportar imagem
      await exportAsImage();
    } catch (error) {
      console.error("Erro ao exportar ambos:", error);
    } finally {
      setIsExporting(false);
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
          className="flex flex-col items-center justify-center p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Exportar como PDF"
        >
          <File className="w-6 h-6 mb-2" />
          <span className="text-sm">PDF</span>
        </button>

        <button
          onClick={exportAsImage}
          disabled={isExporting}
          className="flex flex-col items-center justify-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Exportar como Imagem PNG"
        >
          <FileImage className="w-6 h-6 mb-2" />
          <span className="text-sm">Imagem</span>
        </button>

        <button
          onClick={printNote}
          disabled={isExporting}
          className="flex flex-col items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Imprimir documento"
        >
          <Printer className="w-6 h-6 mb-2" />
          <span className="text-sm">Imprimir</span>
        </button>

        <button
          onClick={exportBoth}
          disabled={isExporting}
          className="flex flex-col items-center justify-center p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Exportar PDF e Imagem"
        >
          <Download className="w-6 h-6 mb-2" />
          <span className="text-sm">Ambos</span>
        </button>
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
          Dica: Para melhor qualidade, use &quot;Imprimir&quot; ou
          &quot;PDF&quot;
        </p>
      </div>
    </div>
  );
}
