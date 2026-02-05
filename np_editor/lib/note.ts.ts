import { PromissoryNote } from "./default-note";

export const generateNoteHTML = ({
  note,
  savePaper,
  rotated,
  fontSizeTitle,
  fontSizeBody,
  fontSizeValue,
  noteWidth,
  noteHeight,
  config,
}: {
  note: PromissoryNote;
  savePaper: boolean;
  rotated: boolean;
  fontSizeTitle: string;
  fontSizeBody: string;
  fontSizeValue: string;
  noteWidth: number;
  noteHeight: number;
  config: {
    formatCurrency: (v: number) => string;
    formatDate: (d: string) => string;
    formatFullDate: (d: string) => string;
    formatDateDDMMYYYY: (d: string) => string;
  };
}) => {
  return `
    <div class="note-container" style="
  width: ${noteWidth}mm;
  height: ${noteHeight}mm;
  background-color: white;
  padding: ${savePaper ? "0 2mm" : "0 3mm"};
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
  border: 1px solid #eee;
  position: relative;
  transform: ${rotated ? "rotate(90deg)" : "none"};
  transform-origin: top left;
  margin-left: ${rotated ? `${noteHeight}mm` : "0"};
">
  <div style="
    width: 100%;
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    transform: ${rotated ? "translateX(0mm)" : "none"};
  ">
    <!-- Título -->
    <div style="
      text-align: center; 
      margin: 0;
    ">
      <h1 style="
        font-size: ${fontSizeTitle}; 
        font-weight: bold; 
        margin: 0;
        text-transform: uppercase;
        line-height: 1.8;
        text-decoration: underline black;
      ">
        NOTA PROMISSÓRIA
      </h1>
    </div>
    
    <!-- Número e Vencimento -->
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: 0;
      padding: 0;
      line-height: 1.2;
    ">
      <!-- Nº da Nota -->
      <div style="transform: translateY(-1.5mm);">
        <span style="
          font-weight: bold;
          text-shadow: ${savePaper ? "0 1px 1px #000" : "none"};
          font-size: ${fontSizeBody};
        ">Nº:</span>
        <span style="margin-left: 1mm; font-size: ${fontSizeBody};">${note.number}</span>
      </div>

      <!-- Vencimento e Valor -->
      <div style="text-align: right;">
        <div style="margin: 0;">
          <span style="
            font-weight: bold;
            text-shadow: ${savePaper ? "0 1px 1px #000" : "none"};
            font-size: ${fontSizeBody};
          ">Vencimento:</span>
          <span style="margin-left: 1mm; font-size: ${fontSizeBody};">${config.formatDateDDMMYYYY(note.dueDate)}</span>
        </div>
        <div style="margin-top: 0.5mm;">
          <span style="
            font-weight: bold;
            font-size: ${fontSizeValue};
            display: inline-block;
          ">
            Valor: ${config.formatCurrency(note.amount)}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Corpo do Texto -->
    <div style="
      margin-bottom: ${savePaper ? "3mm" : "3mm"};
    ">
      <p style="
        text-align: justify;
        line-height: 1.5;
        margin: 0;
        font-size: ${fontSizeBody};
      ">
        ${config.formatFullDate(note.dueDate)}, pagarei por esta nota promissória à ${note.beneficiaryName}, CNPJ n° ${note.beneficiaryCNPJ}, ou à sua ordem, a quantia de <strong style="
          font-weight: bold;
          text-shadow: ${savePaper ? "0 1px 1px #000" : "none"};
        ">${note.formattedAmount}</strong>, em moeda corrente nacional.
      </p>
      
      <p style="
        text-align: left;
        line-height: 1.5;
        font-size: ${fontSizeBody};
        margin: 0;
        margin-top: ${savePaper ? "2mm" : "1mm"};
      ">
        Pagável em ${note.paymentLocation}.
      </p>
    </div>

    <!-- Emitente -->
    <div style="
      margin-bottom: ${savePaper ? "8mm" : "5mm"};
      flex-shrink: 0;
    ">
      <h2 style="
        font-weight: bold;
        text-shadow: ${savePaper ? "0 1px 1px #000" : "none"};
        font-size: ${fontSizeBody};
        text-transform: uppercase;
        line-height: 1.3;
        margin: 0;
      ">
        EMITENTE
      </h2>
      
      <div style="
        line-height: 1.6;
        font-size: ${fontSizeBody};
      ">
        <span style="
          font-weight: bold;
          text-shadow: ${savePaper ? "0 1px 1px #000" : "none"};
          font-size: ${fontSizeBody};
        ">Nome:</span>
        <span style="font-size: ${fontSizeBody};">${note.emitterName}</span>
        <div>
          <span style="
            font-weight: bold;
            text-shadow: ${savePaper ? "0 1px 1px #000" : "none"};
            font-size: ${fontSizeBody};
          ">CPF:</span>
          <span style="font-size: ${fontSizeBody};">${note.emitterCPF}</span>
        </div>
        <div>
          <span style="
            font-weight: bold;
            text-shadow: ${savePaper ? "0 1px 1px #000" : "none"};
            display: inline-block;
            vertical-align: top;
            font-size: ${fontSizeBody};
          ">Endereço:</span>
          <span style="font-size: ${fontSizeBody};">${note.emitterAddress}</span>
        </div>
      </div>
    </div>

    <!-- Local e Data -->
    <div style="
      text-align: left;
      flex-shrink: 0;
      margin-bottom: ${savePaper ? "10mm" : "15mm"};
      font-size: ${fontSizeBody};
    ">
      <p style="margin: 0;">
        ${note.city}, ${config.formatDate(note.issueDate)}.
      </p>
    </div>
    
    <!-- Assinatura -->
    <div style="
      flex-shrink: 0;
      position: absolute;
      bottom: ${savePaper ? "4mm" : "4mm"};
      left: 0;
      right: 0;
    ">
      <div style="
        width: 60%;
        height: 1px;
        margin: 0;
        background-color: #000;
      "></div>
      <p style="
        margin: 0 0 0 15mm;
        font-weight: bold;
        text-shadow: ${savePaper ? "0 1px 1px #000" : "none"};
        font-size: ${fontSizeBody};
        text-transform: uppercase;
        line-height: 1.3;
         margin-top: -2mm;
      ">
        ${note.emitterName.toUpperCase()}
      </p>
    </div>
  </div>
</div>
    `;
};
