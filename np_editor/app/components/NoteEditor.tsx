"use client";

import { useState } from "react";
import NotePreview from "./NotePreview";
import FieldEditor from "./FieldEditor";
import ExportControls from "./ExportControls";
import { defaultNote, type PromissoryNote } from "@/lib/default-note";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NoteEditor() {
  const [note, setNote] = useState<PromissoryNote>(defaultNote);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const updateField = (field: keyof PromissoryNote, value: string | number) => {
    setNote((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldEditor
                label="Número da Nota"
                value={note.number}
                onChange={(value) => updateField("number", value)}
                placeholder="Ex: 01 de 01"
              />

              <FieldEditor
                label="Data de Vencimento"
                type="date"
                value={note.dueDate}
                onChange={(value) => updateField("dueDate", value)}
              />
            </div>

            <FieldEditor
              label="Valor (R$)"
              type="number"
              value={note.amount.toString()}
              onChange={(value) =>
                updateField("amount", parseFloat(value) || 0)
              }
              prefix="R$"
            />

            <FieldEditor
              label="Valor por Extenso"
              value={note.formattedAmount}
              onChange={(value) => updateField("formattedAmount", value)}
              placeholder="Ex: DOIS MIL E NOVENTA REAIS"
            />

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

          <div className="mt-8 pt-6 border-t">
            <ExportControls note={note} />
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
          <NotePreview
            note={note}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </div>
      </div>
    </div>
  );
}
