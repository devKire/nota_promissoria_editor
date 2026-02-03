// components/NoteEditor.tsx
"use client";

import { useState } from "react";
import NotePreview from "./NotePreview";
import FieldEditor from "./FieldEditor";
import ExportControls from "./ExportControls";
import InstallmentControls from "./InstallmentControls";

import {
  defaultNote,
  type PromissoryNote,
  generateNoteNumber,
  formatNumberToWords,
  calculateInstallmentDates,
} from "@/lib/default-note";

export default function NoteEditor() {
  // Inicializar a nota com o número gerado automaticamente
  const [note, setNote] = useState<PromissoryNote>(() => {
    const newNumber = generateNoteNumber();
    return {
      ...defaultNote,
      number: newNumber,
      installments: 1,
      currentInstallment: 1,
      totalInstallments: 1,
    };
  });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [installments, setInstallments] = useState(1);
  const [generatedNotes, setGeneratedNotes] = useState<PromissoryNote[]>([]);
  const [printMultiple, setPrintMultiple] = useState(false);
  const [notesPerPage, setNotesPerPage] = useState(1);
  const [amountError, setAmountError] = useState<string>(""); // Estado para erro

  // Calcular isMultipleLayout diretamente a partir dos estados (lógica derivada)
  const isMultipleLayout = printMultiple && notesPerPage > 1;

  // Função para validar e formatar valor monetário
  const handleAmountChange = (value: string) => {
    // Remover todos os caracteres não numéricos exceto ponto e vírgula
    let cleanedValue = value.replace(/[^\d,.]/g, "");

    // Substituir vírgula por ponto para parsing
    cleanedValue = cleanedValue.replace(",", ".");

    // Permitir apenas um ponto decimal
    const parts = cleanedValue.split(".");
    if (parts.length > 2) {
      cleanedValue = parts[0] + "." + parts.slice(1).join("");
    }

    // Limitar a 2 casas decimais
    if (parts.length > 1) {
      cleanedValue = parts[0] + "." + parts[1].substring(0, 2);
    }

    const numValue = parseFloat(cleanedValue) || 0;

    // Validar valor máximo
    const MAX_VALUE = 9999999.99;

    if (numValue > MAX_VALUE) {
      setAmountError(
        `Valor máximo permitido é R$ ${MAX_VALUE.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      );
      // Atualizar com o valor máximo
      updateField("amount", MAX_VALUE);
    } else {
      setAmountError(""); // Limpar erro
      updateField("amount", numValue);
    }
  };

  // Formatador para exibir valor no input
  const formatAmountForInput = (value: number) => {
    // Formatar para ter sempre 2 casas decimais
    return value.toFixed(2);
  };

  const updateField = (field: keyof PromissoryNote, value: string | number) => {
    setNote((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // Se o valor for alterado, atualizar o valor por extenso
      if (field === "amount") {
        const amount =
          typeof value === "number" ? value : parseFloat(value as string);
        if (!isNaN(amount)) {
          updated.formattedAmount = formatNumberToWords(amount);
        }
      }

      return updated;
    });
  };

  const handleInstallmentsChange = (count: number) => {
    setInstallments(count);
  };

  const generateInstallments = () => {
    if (installments <= 1) {
      setGeneratedNotes([note]);
      return;
    }

    const amountPerInstallment = note.amount / installments;
    const dates = calculateInstallmentDates(note.dueDate, installments);
    const notes: PromissoryNote[] = [];

    for (let i = 0; i < installments; i++) {
      const installmentNumber = `${(i + 1).toString().padStart(2, "0")}/${installments.toString().padStart(2, "0")}`;

      notes.push({
        ...note,
        id: crypto.randomUUID(),
        number: installmentNumber,
        amount: amountPerInstallment,
        formattedAmount: formatNumberToWords(amountPerInstallment),
        dueDate: dates[i],
        currentInstallment: i + 1,
        totalInstallments: installments,
        installments: installments,
      });
    }

    setGeneratedNotes(notes);
  };

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

  // Função para formatar data com dia, mês e ano por extenso (igual ao ExportControls)
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

  // Função para converter ano em palavras (igual ao ExportControls)
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

  // Função para formatar data no formato DD/MM/YYYY (igual ao ExportControls)
  const formatDateDDMMYYYY = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const formatDateShort = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Painel de Edição */}
      <div
        className={`lg:w-1/2 ${activeTab === "edit" ? "block" : "hidden lg:block"}`}
      >
        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Editar Nota Promissória
            </h2>
            <div className="lg:hidden">
              <button
                onClick={() => setActiveTab("preview")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Visualizar
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Número automático - somente leitura */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Número da Nota
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                {note.number}
              </div>
              <p className="text-xs text-gray-500">
                Número gerado automaticamente
              </p>
            </div>

            {/* Configurações de Impressão */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-800">
                Configurações de Impressão
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldEditor
                  label="Data de Vencimento (Primeira Parcela)"
                  type="date"
                  value={note.dueDate}
                  onChange={(value) => updateField("dueDate", value)}
                />

                <div className="space-y-2">
                  <FieldEditor
                    label="Valor Total (R$)"
                    type="text"
                    value={formatAmountForInput(note.amount)}
                    onChange={handleAmountChange}
                    prefix="R$"
                    placeholder="0,00"
                  />
                  {amountError && (
                    <p className="text-sm text-red-600">{amountError}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Valor máximo: R$ 9.999.999,99
                  </p>
                </div>
              </div>

              {/* Valor por extenso - somente leitura */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Valor por Extenso
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[60px]">
                  {note.formattedAmount}
                </div>
                <p className="text-xs text-gray-500">
                  Gerado automaticamente a partir do valor
                </p>
              </div>

              <FieldEditor
                label="Beneficiário"
                value={note.beneficiaryName}
                onChange={(value) => updateField("beneficiaryName", value)}
                placeholder="Nome do beneficiário"
              />

              <FieldEditor
                label="CNPJ do Beneficiário"
                value={note.beneficiaryCNPJ}
                onChange={(value) => updateField("beneficiaryCNPJ", value)}
                placeholder="00.000.000/0000-00"
              />

              <FieldEditor
                label="Nome do Emitente"
                value={note.emitterName}
                onChange={(value) => updateField("emitterName", value)}
                placeholder="Nome completo do emitente"
              />

              <FieldEditor
                label="CPF do Emitente"
                value={note.emitterCPF}
                onChange={(value) => updateField("emitterCPF", value)}
                placeholder="000.000.000-00"
              />

              <FieldEditor
                label="Endereço do Emitente"
                value={note.emitterAddress}
                onChange={(value) => updateField("emitterAddress", value)}
                placeholder="Endereço completo"
                multiline
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldEditor
                  label="Cidade"
                  value={note.city}
                  onChange={(value) => updateField("city", value)}
                  placeholder="Cidade"
                />

                <FieldEditor
                  label="UF"
                  value={note.state}
                  onChange={(value) => updateField("state", value)}
                  placeholder="Estado"
                  maxLength={2}
                />
              </div>

              <FieldEditor
                label="Local de Pagamento"
                value={note.paymentLocation}
                onChange={(value) => updateField("paymentLocation", value)}
                placeholder="Ex: Indaial/SC"
              />

              <FieldEditor
                label="Data de Emissão"
                type="date"
                value={note.issueDate}
                onChange={(value) => updateField("issueDate", value)}
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700">
                Imprimir múltiplas notas por página
              </label>
              <input
                type="checkbox"
                checked={printMultiple}
                onChange={(e) => setPrintMultiple(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            {printMultiple && (
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Notas por página
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => setNotesPerPage(count)}
                      className={`flex-1 py-2 rounded-lg ${
                        notesPerPage === count
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {count} por página
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  *Layout otimizado para papel tamanho carta
                </p>
              </div>
            )}
          </div>

          {/* Controles de Parcelamento */}
          <InstallmentControls
            installments={installments}
            onInstallmentsChange={handleInstallmentsChange}
            onGenerate={generateInstallments}
            generatedNotes={generatedNotes}
          />
          <div className="mt-8 pt-6 border-t">
            <ExportControls
              note={note}
              generatedNotes={
                generatedNotes.length > 0 ? generatedNotes : [note]
              }
              printMultiple={printMultiple}
              notesPerPage={notesPerPage}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        className={`lg:w-1/2 ${activeTab === "preview" ? "block" : "hidden lg:block"}`}
      >
        <div className="sticky top-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Pré-visualização
              {isMultipleLayout && generatedNotes.length > 0 && (
                <span className="text-sm font-normal text-blue-600 ml-2">
                  (Layout reduzido - {notesPerPage} notas por página)
                </span>
              )}
            </h2>
            <div className="lg:hidden">
              <button
                onClick={() => setActiveTab("edit")}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Editar
              </button>
            </div>
          </div>

          {/* Mostrar preview das parcelas ou nota única */}
          {generatedNotes.length > 0 ? (
            <div className="space-y-6">
              {generatedNotes.map((installmentNote, index) => (
                <div key={installmentNote.id} className="mb-6">
                  <div className="bg-blue-50 px-4 py-2 rounded-t-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800">
                      Parcela {installmentNote.currentInstallment} de{" "}
                      {installmentNote.totalInstallments}
                    </h3>
                    <p className="text-sm text-blue-600">
                      Vencimento: {formatDateShort(installmentNote.dueDate)} |
                      Valor: {formatCurrency(installmentNote.amount)}
                    </p>
                    {isMultipleLayout && (
                      <p className="text-xs text-blue-500 mt-1">
                        *Tamanho reduzido para impressão múltipla
                      </p>
                    )}
                  </div>
                  <NotePreview
                    note={installmentNote}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    formatFullDate={formatFullDate}
                    formatDateDDMMYYYY={formatDateDDMMYYYY}
                    isMultipleLayout={isMultipleLayout}
                    notesPerPage={notesPerPage}
                  />
                </div>
              ))}
            </div>
          ) : (
            <NotePreview
              note={note}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              formatFullDate={formatFullDate}
              formatDateDDMMYYYY={formatDateDDMMYYYY}
              isMultipleLayout={isMultipleLayout}
              notesPerPage={notesPerPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
