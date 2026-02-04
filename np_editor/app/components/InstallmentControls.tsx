// components/InstallmentControls.tsx
"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { PromissoryNote } from "@/lib/default-note";

interface InstallmentControlsProps {
  installments: number;
  onInstallmentsChange: (count: number) => void;
  onGenerate: () => void;
  generatedNotes: PromissoryNote[];
  hasGeneratedNotes?: boolean;
}

export default function InstallmentControls({
  installments,
  onInstallmentsChange,
  onGenerate,
  generatedNotes,
  hasGeneratedNotes = false,
}: InstallmentControlsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onGenerate();
      setIsGenerating(false);
    }, 500);
  };

  const handleInstallmentChange = (value: number) => {
    const newValue = Math.max(1, Math.min(12, value)); // Limitar entre 1 e 12 parcelas
    onInstallmentsChange(newValue);
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-gray-800">
        Configurações de Parcelamento
      </h3>

      <div className="space-y-4">
        {/* Controle de parcelas */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Número de Parcelas
          </label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleInstallmentChange(installments - 1)}
              disabled={installments <= 1}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <input
                type="range"
                min="1"
                max="12"
                value={installments}
                onChange={(e) =>
                  handleInstallmentChange(parseInt(e.target.value))
                }
                disabled={hasGeneratedNotes}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${hasGeneratedNotes ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>6</span>
                <span>12</span>
              </div>
            </div>

            <button
              onClick={() => handleInstallmentChange(installments + 1)}
              disabled={installments >= 12}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium min-w-[60px] text-center">
              {installments}x
            </span>
          </div>
        </div>

        {/* Botão para gerar parcelas */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || hasGeneratedNotes}
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
        >
          {isGenerating
            ? "Gerando..."
            : `Gerar ${installments} Parcela${installments > 1 ? "s" : ""}`}
        </button>

        {/* Resumo das parcelas geradas */}
        {generatedNotes.length > 0 && (
          <div className="pt-4 border-t border-gray-300">
            <h4 className="font-medium text-gray-700 mb-2">Parcelas Geradas</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {generatedNotes.map((note, index) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded"
                >
                  <div>
                    <span className="font-medium">
                      Parcela {note.currentInstallment}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      Venc: {new Date(note.dueDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <span className="font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(note.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
