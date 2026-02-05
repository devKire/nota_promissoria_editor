import { PromissoryNote } from "@/lib/default-note";

export interface NoteHTMLParams {
  note: PromissoryNote;
  rotated?: boolean;
  pageWidth: number;
  savePaper: boolean;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  formatFullDate: (dateString: string) => string;
  formatDateDDMMYYYY: (dateString: string) => string;
}
