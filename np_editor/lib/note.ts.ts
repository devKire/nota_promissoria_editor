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
      ${rotated ? "transform: rotate(90deg); transform-origin: top left; margin-left: 90mm;" : ""}
    ">
        <div style="
          width: 100%;
          box-sizing: border-box;
          height: 100%;
          display: flex;
          flex-direction: column;
          ${rotated ? "transform: translateX(0mm);" : ""}
        ">
          <!-- 1. Título Principal -->
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
          
          <!-- 2 e 3. Número da Nota e Vencimento -->
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
              <span style="font-weight: bold; font-size: ${fontSizeBody};">Nº:</span>
              <span style="margin-left: 1mm; font-size: ${fontSizeBody};">${note.number}</span>
            </div>

            <!-- Vencimento e Valor -->
            <div style="text-align: right;">
              <div style="margin: 0;">
                <span style="font-weight: bold; font-size: ${fontSizeBody};">Vencimento:</span>
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
          
          <!-- 4. Corpo do Texto -->
          <div style="
            margin-bottom: ${savePaper ? "3mm" : "5mm"};
          ">
            <p style="
              text-align: justify;
              line-height: 1.5;
              margin: 0;
              font-size: ${fontSizeBody};
            ">
              ${config.formatFullDate(note.dueDate)}, pagarei por esta nota promissória à ${note.beneficiaryName}, CNPJ n° ${note.beneficiaryCNPJ}, ou à sua ordem, a quantia de <strong>${note.formattedAmount}</strong>, em moeda corrente nacional.
            </p>
            
            <!-- 6. Local de Pagamento -->
            <p style="
              text-align: left;
              line-height: 1.5;
              font-size: ${fontSizeBody};
              margin: 0;
              margin-top: 2mm;
            ">
              Pagável em ${note.paymentLocation}.
            </p>
          </div>

          <!-- 7. Seção EMITENTE -->
          <div style="
            margin-bottom: 8mm;
            flex-shrink: 0;
          ">
            <h2 style="
              font-weight: bold;
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
              <!-- Nome -->
              <span style="font-weight: bold; display: inline-block; font-size: ${fontSizeBody};">Nome:</span>
              <span style="font-size: ${fontSizeBody};">${note.emitterName}</span>
              <!-- CPF -->
              <div>
                <span style="font-weight: bold; display: inline-block; font-size: ${fontSizeBody};">CPF:</span>
                <span style="font-size: ${fontSizeBody};">${note.emitterCPF}</span>
              </div>
              
              <!-- Endereço -->
              <div>
                <span style="font-weight: bold; display: inline-block; vertical-align: top; font-size: ${fontSizeBody};">Endereço:</span>
                <span style="font-size: ${fontSizeBody};">${note.emitterAddress}</span>
              </div>
            </div>
          </div>
    
          <!-- 8. Local e Data -->
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
          
          <!-- Espaço para assinatura -->
          <div style="
            flex-shrink: 0;
            position: absolute;
            bottom: 2mm;
            left: 0;
            right: 0;
          ">
            <div style="
              width: 60%;
              height: 1px;
              background-color: #000;
              margin: 0 0 1mm 0;
            "></div>
            <p style="
              margin: 0 0 0 15mm;
              font-weight: bold;
              font-size: ${fontSizeBody};
              text-transform: uppercase;
              line-height: 1;
              position: relative;
              top: -2mm; /* ajusta a distância entre a linha e o nome */
            ">
              ${note.emitterName.toUpperCase()}
            </p>
          </div>

        </div>
      </div>
    `;
};
