// components/ExportControls.tsx
"use client";

import { useState } from "react";
import { Download, FileImage, Printer, File, Copy } from "lucide-react";
import { PromissoryNote } from "@/lib/default-note";
import PDFExporter from "@/lib/pdfExporter";
import PNGExporter from "@/lib/pngExporter";

interface ExportControlsProps {
  note: PromissoryNote;
  generatedNotes: PromissoryNote[];
  savePaper: boolean; // Removido printMultiple
}

export default function ExportControls({
  note,
  generatedNotes,
  savePaper,
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Calcular automaticamente notas por página baseado nas regras
  const calculateNotesPerPage = () => {
    const totalNotes = generatedNotes.length > 0 ? generatedNotes.length : 1;

    if (savePaper) {
      // Modo economizar papel: máximo 5 notas por página
      return 5;
    } else {
      // Modo normal: segue as regras 1=1, 2=2, 3=3 por página
      if (totalNotes === 1) return 1;
      if (totalNotes === 2) return 2;
      if (totalNotes >= 3) return 3; // 3 ou mais = 3 por página
      return 1;
    }
  };

  const notesPerPage = calculateNotesPerPage();

  // Formatters que podem ser compartilhados com as classes utilitárias
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

  const formatDateDDMMYYYY = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Handlers para exportação
  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const pdfExporter = new PDFExporter({
        formatCurrency,
        formatDate,
        formatFullDate,
        convertYearToWords,
        formatDateDDMMYYYY,
      });

      await pdfExporter.export({
        note,
        generatedNotes,
        notesPerPage,
        savePaper,
      });
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
      const pngExporter = new PNGExporter({
        formatCurrency,
        formatDate,
        formatFullDate,
        convertYearToWords,
        formatDateDDMMYYYY,
      });

      await pngExporter.export({
        note,
        generatedNotes,
        notesPerPage,
        savePaper,
      });
    } catch (error) {
      console.error("Erro ao exportar imagem:", error);
      alert("Erro ao exportar imagem. Tente novamente.");
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
            ? `Gerando ${generatedNotes.length} nota(s) em ${Math.ceil(generatedNotes.length / notesPerPage)} página(s) - ${
                savePaper
                  ? "Layout economizar papel: 120mm x 90mm (até 5 notas/página)"
                  : "Layout padrão: 150mm x 100mm (1-3 notas/página conforme quantidade)"
              }`
            : "Dimensões padrão: 150mm de largura x 100mm de altura"}
        </p>
      </div>
      {/* Informações adicionais sobre exportação */}
      <div className="text-xs text-gray-600 pt-4 border-t border-gray-200 mt-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              <svg
                className="w-3.5 h-3.5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-gray-700">
                Permissões do navegador:
              </span>
              <p className="text-gray-600 mt-0.5">
                Certifique-se de que seu navegador permite downloads
                automáticos. Alguns navegadores podem solicitar permissão antes
                de baixar.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              <svg
                className="w-3.5 h-3.5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-gray-700">
                Exportação como IMAGEM (PNG):
              </span>
              <p className="text-gray-600 mt-0.5">
                As imagens são compactadas em um arquivo{" "}
                <code className="px-1 py-0.5 bg-gray-100 rounded text-gray-800 font-mono">
                  .ZIP
                </code>
                . Você precisará de um software como WinRAR, 7-Zip ou o próprio
                Windows Explorer para extrair os arquivos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              <svg
                className="w-3.5 h-3.5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.2 6.5 10.266a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-gray-700">
                Melhores resultados de impressão:
              </span>
              <ul className="list-disc list-inside text-gray-600 mt-0.5 ml-1 space-y-1">
                <li>
                  Utilize papel <strong>tamanho A4</strong> (210mm × 297mm)
                </li>
                <li>
                  Configure a impressora para{" "}
                  <strong>&quot;Sem margens&quot;</strong>
                </li>
                <li>
                  Use qualidade de impressão <strong>normal ou alta</strong>{" "}
                  para melhor definição
                </li>
                <li>Verifique a pré-visualização antes de imprimir</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="mt-0.5">
              <svg
                className="w-3.5 h-3.5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-blue-700">Dica rápida:</span>
              <p className="text-blue-600 mt-0.5">
                Para economizar papel, ative a opção{" "}
                <strong>&quot;Economizar papel&quot;</strong> que organiza
                múltiplas notas por página, otimizando o espaço disponível.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
