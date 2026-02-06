// components/NotePreview.tsx
import { PromissoryNote } from "@/lib/default-note";
import { generateNoteHTML } from "@/lib/note.ts";

interface NotePreviewProps {
  notes: PromissoryNote[];
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  formatFullDate: (dateString: string) => string;
  formatDateDDMMYYYY: (dateString: string) => string;
  selectedLayout: 4 | 5 | "default";
  notesPerPage: number;
}

export default function NotePreview({
  notes,
  formatCurrency,
  formatDate,
  formatFullDate,
  formatDateDDMMYYYY,
  selectedLayout,
  notesPerPage,
}: NotePreviewProps) {
  // Configuração para generateNoteHTML
  const config = {
    formatCurrency,
    formatDate,
    formatFullDate,
    formatDateDDMMYYYY,
  };

  // Função para criar o HTML da nota usando generateNoteHTML
  const createNoteHTML = ({
    note,
    rotated,
  }: {
    note: PromissoryNote;
    rotated: boolean;
  }) => {
    let noteWidth = 150;
    let noteHeight = 100;

    // Dimensões específicas para cada layout
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

  // Dividir notas em páginas
  const pages = [];
  for (let i = 0; i < notes.length; i += notesPerPage) {
    pages.push(notes.slice(i, i + notesPerPage));
  }

  return (
    <div className="space-y-8">
      {pages.map((pageNotes, pageIndex) => {
        const pageWidth = 210; // mm A4
        const pageHeight = 297; // mm A4

        // Layout específico para 4 notas (2x2)
        if (selectedLayout === 4) {
          const noteWidth = 148.5; // mm (largura original)
          const noteHeight = 105; // mm (altura original)

          // Quando rotacionada, as dimensões são invertidas
          const rotatedWidth = noteHeight; // 105mm (largura quando rotacionada)
          const rotatedHeight = noteWidth; // 148.5mm (altura quando rotacionada)

          const positions = [
            // Posição 1: Canto superior esquerdo
            { top: 0, left: 0, rotated: true },
            // Posição 2: Canto inferior esquerdo
            { top: pageHeight - rotatedHeight, left: 0, rotated: true },
            // Posição 3: Canto superior direito
            { top: 0, left: pageWidth - rotatedWidth, rotated: true },
            // Posição 4: Canto inferior direito
            {
              top: pageHeight - rotatedHeight,
              left: pageWidth - rotatedWidth,
              rotated: true,
            },
          ];

          return (
            <div
              key={pageIndex}
              className="page-container border border-gray-300 shadow-lg bg-white"
              style={{
                width: `${pageWidth}mm`,
                height: `${pageHeight}mm`,
                position: "relative",
                margin: "0 auto",
                marginBottom: "10mm",
              }}
            >
              {pageNotes
                .slice(0, Math.min(notesPerPage, 4))
                .map((note, index) => {
                  const pos = positions[index];
                  const displayWidth = pos.rotated ? rotatedWidth : noteWidth;
                  const displayHeight = pos.rotated
                    ? rotatedHeight
                    : noteHeight;

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
                        width: `${displayWidth}mm`,
                        height: `${displayHeight}mm`,
                      }}
                    />
                  );
                })}
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                Página {pageIndex + 1} de {pages.length}
              </div>
            </div>
          );
        }

        // Layout para 5 notas (economia)
        else if (selectedLayout === 5) {
          const noteWidth = 120; // mm
          const noteHeight = 90; // mm

          const positions = [
            // Posição 1: Canto superior esquerdo (horizontal)
            { top: 0, left: 0, rotated: false },
            // Posição 2: Meio esquerdo (horizontal)
            { top: noteHeight, left: 0, rotated: false },
            // Posição 3: Canto inferior esquerdo (horizontal)
            { top: noteHeight * 2, left: 0, rotated: false },
            // Posição 4: Canto superior direito (vertical)
            { top: 0, left: pageWidth - noteHeight, rotated: true },
            // Posição 5: Meio direito (vertical)
            { top: noteWidth, left: pageWidth - noteHeight, rotated: true },
          ];

          return (
            <div
              key={pageIndex}
              className="page-container border border-gray-300 shadow-lg bg-white"
              style={{
                width: `${pageWidth}mm`,
                minHeight: `${pageHeight}mm`,
                position: "relative",
                margin: "0 auto",
                marginBottom: "10mm",
              }}
            >
              {pageNotes
                .slice(0, Math.min(notesPerPage, 5))
                .map((note, index) => {
                  const pos = positions[index];
                  const displayWidth = pos.rotated ? noteHeight : noteWidth;
                  const displayHeight = pos.rotated ? noteWidth : noteHeight;

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
                        width: `${displayWidth}mm`,
                        height: `${displayHeight}mm`,
                      }}
                    />
                  );
                })}
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                Página {pageIndex + 1} de {pages.length}
              </div>
            </div>
          );
        }

        // Layout padrão (default)
        else {
          const noteWidth = 150; // mm
          const noteHeight = 99; // mm

          return (
            <div
              key={pageIndex}
              className="page-container border border-gray-300 shadow-lg bg-white"
              style={{
                width: `${pageWidth}mm`,
                minHeight: `${pageHeight}mm`,
                position: "relative",
                margin: "0 auto",
                marginBottom: "10mm",
              }}
            >
              {pageNotes.slice(0, notesPerPage).map((note, index) => (
                <div
                  key={note.id}
                  dangerouslySetInnerHTML={{
                    __html: createNoteHTML({
                      note,
                      rotated: false,
                    }),
                  }}
                  style={{
                    position: "absolute",
                    top: `${index * noteHeight}mm`,
                    left: `0mm`,
                    width: `${noteWidth}mm`,
                    height: `${noteHeight}mm`,
                  }}
                />
              ))}
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                Página {pageIndex + 1} de {pages.length}
              </div>
            </div>
          );
        }
      })}
    </div>
  );
}
