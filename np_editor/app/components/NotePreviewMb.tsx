// components/NotePreviewMb.tsx
import { useState } from "react";
import { PromissoryNote } from "@/lib/default-note";
import { createNoteHTML } from "@/lib/createNoteHTML";

interface NotePreviewProps {
  notes: PromissoryNote[];
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  formatFullDate: (dateString: string) => string;
  formatDateDDMMYYYY: (dateString: string) => string;
  savePaper: boolean;
  notesPerPage: number;
}

interface NotePage {
  pageIndex: number;
  notes: PromissoryNote[];
  positions: Array<{
    top: number;
    left: number;
    rotated: boolean;
    width: number;
    height: number;
  }>;
}

export default function NotePreviewMb({
  notes,
  formatCurrency,
  formatDate,
  formatFullDate,
  formatDateDDMMYYYY,
  savePaper,
  notesPerPage,
}: NotePreviewProps) {
  const [selectedPage, setSelectedPage] = useState<NotePage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dimensões das notas
  const noteWidth = savePaper ? 120 : 150; // mm
  const noteHeight = savePaper ? 90 : 99; // mm

  // Dividir notas em páginas e calcular posições
  const pages: NotePage[] = [];
  const pageWidth = 210; // mm
  const pageHeight = 297; // mm

  for (let i = 0; i < notes.length; i += notesPerPage) {
    const pageNotes = notes.slice(i, i + notesPerPage);
    const pageIndex = pages.length;
    const positions = [];

    if (savePaper) {
      // Layout savePaper
      const savePaperPositions = [
        { top: 0, left: 0, rotated: false },
        { top: noteHeight, left: 0, rotated: false },
        { top: noteHeight * 2, left: 0, rotated: false },
        { top: 0, left: pageWidth - noteHeight, rotated: true },
        { top: noteWidth, left: pageWidth - noteHeight, rotated: true },
      ];

      for (let j = 0; j < Math.min(pageNotes.length, notesPerPage); j++) {
        const pos = savePaperPositions[j];
        positions.push({
          top: pos.top,
          left: pos.left,
          rotated: pos.rotated,
          width: pos.rotated ? noteHeight : noteWidth,
          height: pos.rotated ? noteWidth : noteHeight,
        });
      }
    } else {
      // Layout normal
      for (let j = 0; j < Math.min(pageNotes.length, notesPerPage); j++) {
        positions.push({
          top: j * noteHeight,
          left: 0,
          rotated: false,
          width: noteWidth,
          height: noteHeight,
        });
      }
    }

    pages.push({
      pageIndex,
      notes: pageNotes,
      positions,
    });
  }

  const createThumbnailNoteHTML = (note: PromissoryNote, rotated = false) => {
    // Para thumbnails, usamos scale no container externo
    const scale = 0.25;
    const scaledNoteWidth = noteWidth * scale;
    const scaledNoteHeight = noteHeight * scale;

    return (
      <div
        style={{
          width: `${scaledNoteWidth}mm`,
          height: `${scaledNoteHeight}mm`,
          position: "relative",
          transform: rotated ? "rotate(90deg)" : "none",
          transformOrigin: "top left",
          marginLeft: rotated ? `${scaledNoteHeight}mm` : "0",
          overflow: "hidden",
        }}
      >
        {/* Container com scale interno */}
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${noteWidth}mm`,
            height: `${noteHeight}mm`,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {createNoteHTML({
            note,
            rotated,
            pageWidth,
            savePaper,
            formatCurrency,
            formatDate,
            formatFullDate,
            formatDateDDMMYYYY,
          })}
        </div>
      </div>
    );
  };

  const openPageModal = (page: NotePage) => {
    setSelectedPage(page);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPage(null);
  };

  return (
    <div className="p-4">
      {/* Lista de miniaturas */}
      <div className="space-y-6">
        {pages.map((page) => (
          <div
            key={page.pageIndex}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
            onClick={() => openPageModal(page)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Página {page.pageIndex + 1} de {pages.length}
              </h3>
              <span className="text-sm text-gray-500">
                {page.notes.length} nota{page.notes.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Miniatura da página */}
            <div className="relative bg-gray-50 border border-gray-300 rounded overflow-hidden">
              <div
                className="relative"
                style={{
                  width: `${pageWidth * 0.3}mm`,
                  height: `${pageHeight * 0.3}mm`,
                  transform: "scale(0.3)",
                  transformOrigin: "top left",
                  margin: "-70% 0",
                }}
              >
                {/* Página de fundo */}
                <div
                  className="absolute bg-white border border-gray-300"
                  style={{
                    width: `${pageWidth}mm`,
                    height: `${pageHeight}mm`,
                  }}
                />

                {/* Miniaturas das notas na página */}
                {page.notes.map((note, index) => {
                  const pos = page.positions[index];
                  return (
                    <div
                      key={note.id}
                      className="absolute"
                      style={{
                        top: `${pos.top}mm`,
                        left: `${pos.left}mm`,
                        width: `${pos.width}mm`,
                        height: `${pos.height}mm`,
                      }}
                    >
                      {createThumbnailNoteHTML(note, pos.rotated)}
                    </div>
                  );
                })}

                {/* Número da página na miniatura */}
                <div
                  className="absolute"
                  style={{
                    bottom: "2mm",
                    right: "2mm",
                    fontSize: "3mm",
                    color: "#6b7280",
                  }}
                >
                  {page.pageIndex + 1}
                </div>
              </div>

              {/* Overlay para clique */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all cursor-pointer">
                <div className="bg-white bg-opacity-90 rounded-full p-2">
                  <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Preview das notas (lista simplificada) */}
            <div className="mt-4 space-y-2">
              {page.notes.map((note) => (
                <div
                  key={note.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div>
                    <span className="font-medium text-gray-700">
                      {note.number}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {note.emitterName}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">
                      {formatCurrency(note.amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Vence: {formatDateDDMMYYYY(note.dueDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Clique para visualizar em tela cheia →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de visualização completa */}
      {isModalOpen && selectedPage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black">
          {/* Overlay para fechar */}
          <div
            className="fixed inset-0"
            onClick={closeModal}
            aria-hidden="true"
          />
          {/* Conteúdo da página */}
          <div
            className="page-container border border-gray-300 shadow-lg bg-white mx-auto mt-20"
            style={{
              transform: `scale(${
                window.innerWidth < 480
                  ? 0.4
                  : window.innerWidth < 640
                    ? 0.5
                    : 0.7
              })`, // 🔹 escala mais compacta para mobile
              transformOrigin: "top center",
              width: `${pageWidth}mm`,
              minHeight: `${pageHeight}mm`,
              position: "relative",
            }}
          >
            {selectedPage.notes.map((note, index) => {
              const pos = selectedPage.positions[index];
              return (
                <div
                  key={note.id}
                  style={{
                    position: "absolute",
                    top: `${pos.top}mm`,
                    left: `${pos.left}mm`,
                    width: `${pos.width}mm`,
                    height: `${pos.height}mm`,
                  }}
                >
                  {createNoteHTML({
                    note,
                    rotated: pos.rotated,
                    pageWidth,
                    savePaper,
                    formatCurrency,
                    formatDate,
                    formatFullDate,
                    formatDateDDMMYYYY,
                  })}
                </div>
              );
            })}
            <div className="absolute bottom-2 z-50 right-2 text-xs text-gray-500">
              Página {selectedPage.pageIndex + 1} de {pages.length}
            </div>
          </div>{" "}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={closeModal}
              className="px-8 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition shadow-lg hover:shadow-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
