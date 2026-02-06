// components/NoteEditor.tsx
"use client";

import { useEffect, useState } from "react";
import NotePreview from "./NotePreview";
import FieldEditor from "./FieldEditor";
import ExportControls from "./ExportControls";
import InstallmentControls from "./InstallmentControls";
import { RotateCcw } from "lucide-react";

import {
  defaultNote,
  type PromissoryNote,
  generateNoteNumber,
  formatNumberToWords,
  calculateInstallmentDates,
} from "@/lib/default-note";
import NotePreviewMb from "./NotePreviewMb";
import { se } from "date-fns/locale";

export default function NoteEditor() {
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
  const [savePaper, setSavePaper] = useState(false);
  const [amountError, setAmountError] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Estado para o layout selecionado
  const [selectedLayout, setSelectedLayout] = useState<4 | 5 | "default">(
    "default",
  );

  // Função para determinar qual layout usar
  const getCurrentLayout = (): 4 | 5 | "default" => selectedLayout;

  // Calcular automaticamente notas por página baseado no layout selecionado
  const calculateNotesPerPage = () => {
    const totalNotes = generatedNotes.length > 0 ? generatedNotes.length : 1;
    const currentLayout = getCurrentLayout(); // Usar o layout atual

    if (currentLayout === 4) return 4; // Layout de 4 notas
    if (currentLayout === 5) return 5; // Layout de 5 notas

    // Layout padrão: segue as regras 1=1, 2=2, 3=3 por página
    if (totalNotes === 1) return 1;
    if (totalNotes === 2) return 2;
    if (totalNotes >= 3) return 3; // 3 ou mais = 3 por página
    return 1;
  };

  const notesPerPage = calculateNotesPerPage();

  const hasGeneratedNotes = generatedNotes.length > 0;

  const handleAmountChange = (value: string) => {
    if (hasGeneratedNotes) return; // Não permitir edição após gerar notas

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
    if (hasGeneratedNotes) return; // Não permitir edição após gerar notas

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
    if (hasGeneratedNotes) return; // Não permitir edição após gerar notas

    setInstallments(count);

    // Se estiver reduzindo para 3 ou menos parcelas, desativar savePaper
    if (count <= 3 && savePaper) {
      setSavePaper(false);
    }
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
      const installmentNumber = `${(i + 1).toString().padStart(2, "0")} de ${installments.toString().padStart(2, "0")}`;

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

  // Função para reiniciar e permitir novas edições
  const restartEditing = () => {
    setGeneratedNotes([]);
    setInstallments(1);
    setSavePaper(false);
    setActiveTab("edit");

    // Gerar um novo número para a nota
    const newNumber = generateNoteNumber();
    setNote({
      ...defaultNote,
      number: newNumber,
      amount: note.amount, // Manter o valor
      beneficiaryName: note.beneficiaryName, // Manter os dados preenchidos
      beneficiaryCNPJ: note.beneficiaryCNPJ,
      emitterName: note.emitterName,
      emitterCPF: note.emitterCPF,
      emitterAddress: note.emitterAddress,
      city: note.city,
      state: note.state,
      paymentLocation: note.paymentLocation,
      dueDate: note.dueDate,
      issueDate: new Date().toISOString().split("T")[0], // Data atual
      formattedAmount: formatNumberToWords(note.amount),
      installments: 1,
      currentInstallment: 1,
      totalInstallments: 1,
    });
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

  // Máscara CPF (000.000.000-00)
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .substring(0, 14);
  };

  // Máscara CNPJ (00.000.000/0000-00)
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 18);
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

          <div className="space-y-6 mb-6">
            {/* Informações da Nota */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-800">
                Informações da Nota{" "}
                <span className="text-sm text-gray-500">
                  (Notas são geradas com base nestes dados; aperte{" "}
                  <span className="inline-flex items-center px-2 py-0.5 border border-gray-300 rounded-md bg-gray-100 text-gray-700 font-mono text-xs shadow-sm">
                    Tab
                  </span>{" "}
                  para navegar entre os campos)
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldEditor
                  label="Data de Vencimento (Primeira Parcela)"
                  type="date"
                  value={note.dueDate}
                  onChange={(value) => updateField("dueDate", value)}
                  disabled={hasGeneratedNotes}
                />

                <div className="space-y-2">
                  <FieldEditor
                    label="Valor Total (R$)"
                    type="text"
                    value={formatAmountForInput(note.amount)}
                    onChange={handleAmountChange}
                    prefix="R$"
                    placeholder="0,00"
                    disabled={hasGeneratedNotes}
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
                disabled={hasGeneratedNotes}
              />

              <FieldEditor
                label="CNPJ do Beneficiário"
                value={note.beneficiaryCNPJ}
                onChange={(value) =>
                  updateField("beneficiaryCNPJ", formatCNPJ(value))
                }
                placeholder="00.000.000/0000-00"
                disabled={hasGeneratedNotes}
              />

              <FieldEditor
                label="Nome do Emitente"
                value={note.emitterName}
                onChange={(value) => updateField("emitterName", value)}
                placeholder="Nome completo do emitente"
                disabled={hasGeneratedNotes}
              />

              <FieldEditor
                label="CPF do Emitente"
                value={note.emitterCPF}
                onChange={(value) =>
                  updateField("emitterCPF", formatCPF(value))
                }
                placeholder="000.000.000-00"
                disabled={hasGeneratedNotes}
                maxLength={14}
              />

              <FieldEditor
                label="Endereço do Emitente"
                value={note.emitterAddress}
                onChange={(value) => updateField("emitterAddress", value)}
                placeholder="Endereço completo"
                multiline
                disabled={hasGeneratedNotes}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldEditor
                  label="Cidade"
                  value={note.city}
                  onChange={(value) => updateField("city", value)}
                  placeholder="Cidade"
                  disabled={hasGeneratedNotes}
                />

                <FieldEditor
                  label="UF"
                  value={note.state}
                  onChange={(value) => updateField("state", value)}
                  placeholder="Estado"
                  maxLength={2}
                  disabled={hasGeneratedNotes}
                />
              </div>

              <FieldEditor
                label="Local de Pagamento"
                value={note.paymentLocation}
                onChange={(value) => updateField("paymentLocation", value)}
                placeholder="Ex: Indaial/SC"
                disabled={hasGeneratedNotes}
              />

              <FieldEditor
                label="Data de Emissão"
                type="date"
                value={note.issueDate}
                onChange={(value) => updateField("issueDate", value)}
                disabled={hasGeneratedNotes}
              />
            </div>

            {/* Configurações de Impressão */}
            <div className="p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 mb-4">
              {/* Cabeçalho com toggle */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <label className="text-sm font-semibold text-gray-800 cursor-pointer">
                    Selecione o layout de impressão
                  </label>
                </div>
              </div>

              {/* Descrição */}
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                O layout de impressão determina quantas notas serão impressas
                por página. Escolha o layout que melhor se adequa às suas
                necessidades. O layout recomendado é o de 4 notas por página,
                que otimiza o uso do papel A4 e é compatível com a maioria das
                impressoras. Se você tiver um número pequeno de notas, pode
                optar pelo layout padrão de 3 notas por página para um visual
                mais espaçado. Para um grande número de notas, o layout de 5
                notas por página pode ser mais econômico, embora as notas fiquem
                menores.
              </p>

              {/* Opções de layout (só mostra quando savePaper está ativo) */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Escolha o layout:
                </p>
                <div className="space-y-2">
                  <label className="flex items-center text-xs text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                    <input
                      type="radio"
                      name="layout"
                      value="5notes"
                      checked={selectedLayout === "default"}
                      onChange={() => setSelectedLayout("default")}
                      disabled={hasGeneratedNotes}
                    />

                    <span className="ml-2">
                      <span className="font-medium">3 notas por página</span> -
                      Layout padrão (100 mm x 150 mm)
                    </span>
                  </label>
                  <label className="flex items-center text-xs text-green-600 cursor-pointer hover:text-green-800 transition-colors">
                    <input
                      type="radio"
                      name="layout"
                      value="4notes"
                      checked={selectedLayout === 4}
                      onChange={() => setSelectedLayout(4)}
                      disabled={hasGeneratedNotes}
                    />

                    <span className="ml-2">
                      <span className="font-medium">4 notas por página</span> -
                      Layout otimizado (105 mm x 148,5 mm) com rotação de 90°
                      <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">
                        RECOMENDADO
                      </span>
                    </span>
                  </label>

                  <label className="flex items-center text-xs text-gray-600 cursor-pointer hover:text-gray-800 transition-colors">
                    <input
                      type="radio"
                      name="layout"
                      value="5notes"
                      checked={selectedLayout === 5}
                      onChange={() => setSelectedLayout(5)}
                      disabled={hasGeneratedNotes}
                    />

                    <span className="ml-2">
                      <span className="font-medium">5 notas por página</span> -
                      Layout ecônomico (90 mm x 120 mm)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de Parcelamento */}
          <InstallmentControls
            installments={installments}
            onInstallmentsChange={handleInstallmentsChange}
            onGenerate={generateInstallments}
            generatedNotes={generatedNotes}
            hasGeneratedNotes={hasGeneratedNotes}
          />

          <div className="mt-8 pt-6 border-t">
            {/* Botão de Reiniciar no topo */}
            {hasGeneratedNotes && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-green-800">
                      ✓ Parcelas Geradas com Sucesso, você já pode exportar!
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {generatedNotes.length} nota(s) promissória(s) gerada(s)
                    </p>
                  </div>
                  <button
                    onClick={restartEditing}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Nova Edição
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Caso queira editar os dados, clique em &quot;Nova
                  Edição&quot;. Os campos atuais estão bloqueados para evitar
                  alterações nas notas já geradas.
                </p>
              </div>
            )}
            <ExportControls
              note={note}
              generatedNotes={
                generatedNotes.length > 0 ? generatedNotes : [note]
              }
              selectedLayout={getCurrentLayout()}
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
              Pré-visualização{" "}
              <span className="text-sm text-gray-500">
                (O Preview será mostrado após as notas serem geradas)
              </span>
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

          {/* Botão de Reiniciar também no preview em mobile */}
          {hasGeneratedNotes && (
            <div className="mb-4 lg:hidden p-3 bg-green-50 rounded-lg border border-green-200">
              <button
                onClick={restartEditing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Nova Edição
              </button>
            </div>
          )}

          {/* Mostrar preview conforme o dispositivo */}
          {isMobile ? (
            <NotePreviewMb
              notes={generatedNotes}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              formatFullDate={formatFullDate}
              formatDateDDMMYYYY={formatDateDDMMYYYY}
              selectedLayout={selectedLayout}
              notesPerPage={notesPerPage}
            />
          ) : (
            <NotePreview
              notes={generatedNotes}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              formatFullDate={formatFullDate}
              formatDateDDMMYYYY={formatDateDDMMYYYY}
              selectedLayout={selectedLayout}
              notesPerPage={notesPerPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
