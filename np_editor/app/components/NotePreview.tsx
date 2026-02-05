// components/NotePreview.tsx
import { PromissoryNote } from "@/lib/default-note";
import { createNoteHTML } from "@/lib/createNoteHTML"; // ou import { NoteHTML } from "@/components/NoteHTML";

interface NotePreviewProps {
  notes: PromissoryNote[];
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  formatFullDate: (dateString: string) => string;
  formatDateDDMMYYYY: (dateString: string) => string;
  savePaper: boolean;
  notesPerPage: number;
}

export default function NotePreview({
  notes,
  formatCurrency,
  formatDate,
  formatFullDate,
  formatDateDDMMYYYY,
  savePaper,
  notesPerPage,
}: NotePreviewProps) {
  // Dividir notas em páginas
  const pages = [];
  for (let i = 0; i < notes.length; i += notesPerPage) {
    pages.push(notes.slice(i, i + notesPerPage));
  }

  return (
    <div className="space-y-8">
      {pages.map((pageNotes, pageIndex) => {
        const pageWidth = 210; // mm
        const pageHeight = 297; // mm

        if (savePaper) {
          // Layout savePaper
          const noteWidth = 120; // mm
          const noteHeight = 90; // mm

          const positions = [
            { top: 0, left: 0, rotated: false },
            { top: noteHeight, left: 0, rotated: false },
            { top: noteHeight * 2, left: 0, rotated: false },
            { top: 0, left: pageWidth - noteHeight, rotated: true },
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
              {pageNotes.slice(0, notesPerPage).map((note, index) => {
                const pos = positions[index];
                return (
                  <div
                    key={note.id}
                    style={{
                      position: "absolute",
                      top: `${pos.top}mm`,
                      left: `${pos.left}mm`,
                      width: `${pos.rotated ? noteHeight : noteWidth}mm`,
                      height: `${pos.rotated ? noteWidth : noteHeight}mm`,
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
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                Página {pageIndex + 1} de {pages.length}
              </div>
            </div>
          );
        } else {
          // Layout normal
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
                  style={{
                    position: "absolute",
                    top: `${index * noteHeight}mm`,
                    left: `0mm`,
                    width: `${noteWidth}mm`,
                    height: `${noteHeight}mm`,
                  }}
                >
                  {createNoteHTML({
                    note,
                    rotated: false,
                    pageWidth,
                    savePaper,
                    formatCurrency,
                    formatDate,
                    formatFullDate,
                    formatDateDDMMYYYY,
                  })}
                </div>
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
