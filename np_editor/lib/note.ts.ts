import { se } from "date-fns/locale";
import { PromissoryNote } from "./default-note";

export const generateNoteHTML = ({
  note,
  selectedLayout,
  rotated,
  noteWidth,
  noteHeight,
  config,
}: {
  note: PromissoryNote;
  selectedLayout: 4 | 5 | "default";
  rotated: boolean;
  noteWidth: number;
  noteHeight: number;
  config: {
    formatCurrency: (v: number) => string;
    formatDate: (d: string) => string;
    formatFullDate: (d: string) => string;
    formatDateDDMMYYYY: (d: string) => string;
  };
}) => {
  // 🔹 Define estilos específicos de cada layout
  const layoutStyles = {
    default: {
      fontSizeTitle: "6mm",
      fontSizeBody: "3mm",
      fontSizeValue: "4mm",
      textShadow: "none",
      padding: "0 3mm",
      marginBottomBody: "3mm",
      marginBottomEmitente: "5mm",
      marginBottomLocal: "15mm",
      assinaturaBottom: "4mm",
      textShadowStrong: "0 1px 1px #000",
    },
    4: {
      fontSizeTitle: "6mm",
      fontSizeBody: "3.1mm",
      fontSizeValue: "4mm",
      textShadow: "none",
      padding: "0 3mm",
      marginBottomBody: "3mm",
      marginBottomEmitente: "5mm",
      marginBottomLocal: "15mm",
      assinaturaBottom: "4mm",
      textShadowStrong: "0 0.1px 0.1px #000",
    },
    5: {
      fontSizeTitle: "4.5mm",
      fontSizeBody: "2.4mm",
      fontSizeValue: "3mm",
      textShadow: "1px 1px 2px #333",
      padding: "0 2mm",
      marginBottomBody: "3mm",
      marginBottomEmitente: "8mm",
      marginBottomLocal: "10mm",
      assinaturaBottom: "4mm",
      textShadowStrong: "1px 1px 2px #333",
    },
  } as const;

  const styles = layoutStyles[selectedLayout] || layoutStyles.default;

  // 🔹 Geração do HTML
  return `
<div class="note-container" style="
  width: ${noteWidth}mm;
  height: ${noteHeight}mm;
  background-color: white;
  padding: ${styles.padding};
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
  border: 1px solid #eee;
  position: relative;
  transform: ${rotated ? "rotate(90deg)" : "none"};
  transform-origin: top left;
  margin-left: ${rotated ? `${noteHeight}mm` : "0"};
">
  <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">

    <!-- Título -->
    <div style="text-align: center;">
      <h1 style="
        font-size: ${styles.fontSizeTitle};
        font-weight: bold;
        margin: 0;
        text-transform: uppercase;
        line-height: 1.8;
        text-decoration: underline black;
      ">NOTA PROMISSÓRIA</h1>
    </div>

    <!-- Nº / Vencimento -->
    <div style="display: flex; justify-content: space-between; line-height: 1.2;">
      <div style="transform: translateY(-1.5mm);">
        <span style="font-weight: bold; text-shadow: ${styles.textShadow}; font-size: ${styles.fontSizeBody};">Nº:</span>
        <span style="margin-left: 1mm; font-size: ${styles.fontSizeBody};">${note.number}</span>
      </div>
      <div style="text-align: right;">
        <div>
          <span style="font-weight: bold; text-shadow: ${styles.textShadow}; font-size: ${styles.fontSizeBody};">Vencimento:</span>
          <span style="margin-left: 1mm; font-size: ${styles.fontSizeBody};">${config.formatDateDDMMYYYY(note.dueDate)}</span>
        </div>
        <div style="margin-top: 0.5mm;">
          <span style="font-weight: bold; font-size: ${styles.fontSizeValue};">
            Valor: ${config.formatCurrency(note.amount)}
          </span>
        </div>
      </div>
    </div>

    <!-- Corpo -->
    <div style="margin-bottom: ${styles.marginBottomBody};">
      <p style="text-align: justify; line-height: 1.5; margin: 0; font-size: ${styles.fontSizeBody};">
        ${config.formatFullDate(note.dueDate)}, pagarei por esta nota promissória à ${note.beneficiaryName}, CNPJ n° ${note.beneficiaryCNPJ}, ou à sua ordem, a quantia de 
        <strong style="font-weight: bold; text-shadow: ${styles.textShadowStrong};">${note.formattedAmount}</strong>, em moeda corrente nacional.
      </p>
      <p style="text-align: left; line-height: 1.5; margin: 0; margin-top: 2mm; font-size: ${styles.fontSizeBody};">
        Pagável em ${note.paymentLocation}.
      </p>
    </div>

    <!-- Emitente -->
    <div style="margin-bottom: ${styles.marginBottomEmitente};">
      <h2 style="font-weight: bold; text-shadow: ${styles.textShadowStrong}; font-size: ${styles.fontSizeBody}; text-transform: uppercase;">EMITENTE</h2>
      <div style="line-height: 1.6; font-size: ${styles.fontSizeBody};">
        <div><strong style="text-shadow: ${styles.textShadowStrong};">Nome:</strong> ${note.emitterName}</div>
        <div><strong style="text-shadow: ${styles.textShadowStrong};">CPF:</strong> ${note.emitterCPF}</div>
        <div><strong style="text-shadow: ${styles.textShadowStrong};">Endereço:</strong> ${note.emitterAddress}</div>
      </div>
    </div>

    <!-- Local e Data -->
    <div style="text-align: left; margin-bottom: ${styles.marginBottomLocal}; font-size: ${styles.fontSizeBody};">
      <p style="margin: 0;">${note.city}, ${config.formatDate(note.issueDate)}.</p>
    </div>

    <!-- Assinatura -->
    <div style="position: absolute; bottom: ${styles.assinaturaBottom}; left: 0; right: 0;">
      <div style="width: 60%; height: 1px; margin: 0 0 0.5mm 0; background-color: #000;"></div>
      <p style="
        margin: 0 0 0 15mm;
        font-weight: bold;
        text-shadow: ${styles.textShadowStrong};
        font-size: ${styles.fontSizeBody};
        text-transform: uppercase;
        margin-top: -2mm;
      ">
        ${note.emitterName.toUpperCase()}
      </p>
    </div>

  </div>
</div>`;
};
