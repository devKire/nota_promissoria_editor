// components/NotePreviewMobile.tsx
import { useEffect, useState } from "react";
import { PromissoryNote } from "@/lib/default-note";
import { generateNoteHTML } from "@/lib/note.ts";

interface NotePreviewMobileProps {
  notes: PromissoryNote[];
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  formatFullDate: (dateString: string) => string;
  formatDateDDMMYYYY: (dateString: string) => string;
  selectedLayout: 4 | 5 | "default";
  notesPerPage: number;
}

interface PageData {
  pageIndex: number;
  notes: PromissoryNote[];
  positions: Array<{
    top: number;
    left: number;
    width: number;
    height: number;
    rotated: boolean;
  }>;
}

export default function NotePreviewMobile({
  notes,
  formatCurrency,
  formatDate,
  formatFullDate,
  formatDateDDMMYYYY,
  selectedLayout,
  notesPerPage,
}: NotePreviewMobileProps) {
  const [selectedPage, setSelectedPage] = useState<PageData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Limpeza ao desmontar
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  const config = {
    formatCurrency,
    formatDate,
    formatFullDate,
    formatDateDDMMYYYY,
  };

  const createNoteHTML = ({
    note,
    rotated,
  }: {
    note: PromissoryNote;
    rotated: boolean;
  }) => {
    let noteWidth = 150;
    let noteHeight = 100;

    if (selectedLayout === 4) {
      noteWidth = 148.5;
      noteHeight = 105;
    } else if (selectedLayout === 5) {
      noteWidth = 120;
      noteHeight = 90;
    }

    return generateNoteHTML({
      note,
      selectedLayout,
      rotated,
      noteWidth,
      noteHeight,
      config,
    });
  };

  const openPageModal = (page: PageData) => {
    setSelectedPage(page);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPage(null);
  };

  const calculatePages = (): PageData[] => {
    const pages: PageData[] = [];
    const pageWidth = 210;
    const pageHeight = 297;

    for (let i = 0; i < notes.length; i += notesPerPage) {
      const pageNotes = notes.slice(i, i + notesPerPage);
      const positions: Array<{
        top: number;
        left: number;
        width: number;
        height: number;
        rotated: boolean;
      }> = [];

      // Configurar posições baseado no layout
      if (selectedLayout === 4) {
        const noteWidth = 148.5;
        const noteHeight = 105;
        const rotatedWidth = noteHeight;
        const rotatedHeight = noteWidth;

        const layoutPositions = [
          { top: 0, left: 0, rotated: true },
          { top: pageHeight - rotatedHeight, left: 0, rotated: true },
          { top: 0, left: pageWidth - rotatedWidth, rotated: true },
          {
            top: pageHeight - rotatedHeight,
            left: pageWidth - rotatedWidth,
            rotated: true,
          },
        ];

        pageNotes.slice(0, Math.min(notesPerPage, 4)).forEach((_, index) => {
          const pos = layoutPositions[index];
          positions.push({
            ...pos,
            width: pos.rotated ? rotatedWidth : noteWidth,
            height: pos.rotated ? rotatedHeight : noteHeight,
          });
        });
      } else if (selectedLayout === 5) {
        const noteWidth = 120;
        const noteHeight = 90;

        const layoutPositions = [
          { top: 0, left: 0, rotated: false },
          { top: noteHeight, left: 0, rotated: false },
          { top: noteHeight * 2, left: 0, rotated: false },
          { top: 0, left: pageWidth - noteHeight, rotated: true },
          { top: noteWidth, left: pageWidth - noteHeight, rotated: true },
        ];

        pageNotes.slice(0, Math.min(notesPerPage, 5)).forEach((_, index) => {
          const pos = layoutPositions[index];
          positions.push({
            ...pos,
            width: pos.rotated ? noteHeight : noteWidth,
            height: pos.rotated ? noteWidth : noteHeight,
          });
        });
      } else {
        // Layout padrão
        const noteWidth = 150;
        const noteHeight = 99;

        pageNotes.slice(0, notesPerPage).forEach((_, index) => {
          positions.push({
            top: index * noteHeight,
            left: 0,
            width: noteWidth,
            height: noteHeight,
            rotated: false,
          });
        });
      }

      pages.push({
        pageIndex: pages.length,
        notes: pageNotes,
        positions,
      });
    }

    return pages;
  };

  const pages = calculatePages();
  const pageWidth = 210;
  const pageHeight = 297;

  return (
    <div className="p-4 pb-20">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Pré-visualização</h2>
        <p className="text-sm text-gray-600 mt-1">
          {notes.length} nota{notes.length !== 1 ? "s" : ""} em {pages.length}{" "}
          página{pages.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Lista de páginas */}
      <div className="space-y-4">
        {pages.map((page) => (
          <div
            key={page.pageIndex}
            className="bg-white rounded-xl shadow-md border border-gray-200 active:scale-[0.98] transition-transform duration-150"
            onClick={() => openPageModal(page)}
          >
            {/* Cabeçalho da página */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">
                    Página {page.pageIndex + 1}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {page.notes.length} nota{page.notes.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Layout{" "}
                    {selectedLayout === "default" ? "Padrão" : selectedLayout}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Miniatura da página */}
            <div className="p-4">
              {/* Lista de notas da página */}
              <div className="mt-4 space-y-2">
                {page.notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {note.number}
                      </div>
                      <div className="text-sm text-gray-600 truncate max-w-[140px]">
                        {note.emitterName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(note.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateDDMMYYYY(note.dueDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão de ação */}
              <div className="mt-4 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center w-full py-2 bg-blue-50 rounded-lg">
                  <span>Visualizar página completa</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de visualização completa */}
      {isModalOpen && selectedPage && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Conteúdo do modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-full flex flex-col items-center justify-center p-4">
              {/* Cabeçalho do modal */}
              <div className="w-full max-w-2xl mb-4">
                <div className="flex justify-between items-center text-white">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Página {selectedPage.pageIndex + 1} de {pages.length}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {selectedPage.notes.length} nota
                      {selectedPage.notes.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Container da página com scroll */}
              <div className="overflow-auto max-w-full max-h-[70vh] bg-white rounded-xl shadow-2xl">
                <div
                  className="mt-20 page-container border border-gray-300 bg-white mx-auto"
                  style={{
                    transform: "scale(0.6)",
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
                        dangerouslySetInnerHTML={{
                          __html: createNoteHTML({
                            note,
                            rotated: pos.rotated,
                          }),
                        }}
                        style={{
                          position: "absolute",
                          top: `${pos.top}mm`,
                          left: `${pos.left}mm`,
                          width: `${pos.width}mm`,
                          height: `${pos.height}mm`,
                        }}
                      />
                    );
                  })}
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                    Página {selectedPage.pageIndex + 1}
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="w-full max-w-2xl mt-4 flex justify-center space-x-3">
                <button
                  onClick={closeModal}
                  className="flex-1 max-w-xs px-6 py-3 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition shadow-lg"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
