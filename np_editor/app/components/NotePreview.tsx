// components/NotePreview.tsx

import { PromissoryNote } from "@/lib/default-note";

interface NotePreviewProps {
  note: PromissoryNote;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  formatFullDate: (dateString: string) => string;
  formatDateDDMMYYYY: (dateString: string) => string;
  isMultipleLayout?: boolean;
  notesPerPage?: number;
}

export default function NotePreview({
  note,
  formatCurrency,
  formatDate,
  formatFullDate,
  formatDateDDMMYYYY,
  isMultipleLayout = false,
  notesPerPage = 1,
}: NotePreviewProps) {
  // Ajustes para tamanho reduzido quando múltiplo
  const smallSize = isMultipleLayout && notesPerPage > 1;

  const fontSizeTitle = smallSize ? "6mm" : "7mm";
  const fontSizeValue = smallSize ? "3.8mm" : "4.5mm";
  const fontSizeBody = smallSize ? "3.2mm" : "3.8mm";
  const fontSizeEmitente = smallSize ? "3.4mm" : "4mm";
  const paddingTop = smallSize ? "3mm" : "5mm";
  const paddingBottom = smallSize ? "12mm" : "25mm";
  const paddingSide = smallSize ? "10mm" : "25mm";
  const marginBottomEmitente = smallSize ? "6mm" : "10mm";
  const marginBottomLocal = smallSize ? "8mm" : "15mm";
  const lineHeight = smallSize ? "1.4" : "1.6";

  return (
    <div
      className="note-container mx-auto bg-white"
      style={{
        width: smallSize ? "200mm" : "210mm",
        minHeight: smallSize ? "85mm" : "280mm",
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        border: "1px solid #eee",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: smallSize ? "3mm" : "0",
      }}
    >
      <div
        style={{
          width: "100%",
          padding: `${paddingTop} ${paddingSide} ${paddingBottom}`,
          boxSizing: "border-box",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 1. Título Principal */}
        <div
          style={{ textAlign: "center", marginBottom: "0mm", flexShrink: 0 }}
        >
          <h1
            style={{
              fontSize: fontSizeTitle,
              fontWeight: "bold",
              margin: "0",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              lineHeight: "1.2",
              textDecoration: "underline black",
            }}
          >
            NOTA PROMISSÓRIA
          </h1>
        </div>

        {/* 2. Numero da Nota */}
        <div style={{ marginTop: "2mm", marginBottom: "1mm" }}>
          <span style={{ fontWeight: "bold", fontSize: fontSizeBody }}>
            Nº:
          </span>
          <span style={{ marginLeft: "2mm", fontSize: fontSizeBody }}>
            {note.number}
          </span>
        </div>

        {/* 3. Vencimento e Valor */}
        <div style={{ textAlign: "right", marginBottom: "0", flexShrink: 0 }}>
          <div style={{ marginBottom: "1mm" }}>
            <span style={{ fontWeight: "bold", fontSize: fontSizeBody }}>
              Vencimento:
            </span>
            <span style={{ marginLeft: "2mm", fontSize: fontSizeBody }}>
              {formatDateDDMMYYYY(note.dueDate)}
            </span>
          </div>
          <div>
            <span
              style={{
                fontWeight: "bold",
                fontSize: fontSizeValue,
                padding: "1mm 2mm",
                display: "inline-block",
              }}
            >
              Valor: {formatCurrency(note.amount)}
            </span>
          </div>
        </div>

        {/* 4. Corpo do Texto */}
        <div
          style={{
            flexGrow: 1,
            marginBottom: "0",
            marginTop: smallSize ? "4mm" : "15mm",
          }}
        >
          <p
            style={{
              textAlign: "justify",
              lineHeight: lineHeight,
              margin: "0",
              fontSize: fontSizeBody,
            }}
          >
            {formatFullDate(note.dueDate)}, pagarei por esta nota promissória à{" "}
            {note.beneficiaryName}, CNPJ n° {note.beneficiaryCNPJ}, ou à sua
            ordem, a quantia de <strong>{note.formattedAmount}</strong>, em
            moeda corrente nacional.
          </p>

          {/* 6. Local de Pagamento */}
          <p
            style={{
              textAlign: "left",
              lineHeight: lineHeight,
              fontSize: fontSizeBody,
              marginTop: smallSize ? "2mm" : "5mm",
              marginBottom: marginBottomLocal,
            }}
          >
            Pagável em {note.paymentLocation}.
          </p>
        </div>

        {/* 7. Seção EMITENTE */}
        <div style={{ flexShrink: 0, marginBottom: marginBottomEmitente }}>
          <h2
            style={{
              fontWeight: "bold",
              fontSize: fontSizeEmitente,
              textTransform: "uppercase",
              lineHeight: "1.3",
              margin: "0 0 1mm 0",
            }}
          >
            EMITENTE
          </h2>

          <div style={{ lineHeight: lineHeight, fontSize: fontSizeBody }}>
            {/* Nome */}
            <div style={{ marginBottom: "1mm" }}>
              <span style={{ fontWeight: "bold", display: "inline-block" }}>
                Nome:
              </span>
              <span style={{ marginLeft: "2mm" }}>{note.emitterName}</span>
            </div>

            {/* CPF */}
            <div style={{ marginBottom: "1mm" }}>
              <span style={{ fontWeight: "bold", display: "inline-block" }}>
                CPF:
              </span>
              <span style={{ marginLeft: "2mm" }}>{note.emitterCPF}</span>
            </div>

            {/* Endereço */}
            <div>
              <span
                style={{
                  fontWeight: "bold",
                  display: "inline-block",
                  verticalAlign: "top",
                }}
              >
                Endereço:
              </span>
              <span
                style={{
                  marginLeft: "2mm",
                  display: "inline-block",
                  width: "calc(100% - 22mm)",
                }}
              >
                {note.emitterAddress}
              </span>
            </div>
          </div>
        </div>

        {/* 8. Local e Data e Assinatura */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: smallSize ? "2mm" : "5mm",
            flexShrink: 0,
          }}
        >
          {/* Local e Data */}
          <div
            style={{
              textAlign: "left",
              marginBottom: smallSize ? "8mm" : "15mm",
              fontSize: fontSizeBody,
            }}
          >
            <p style={{ margin: "0" }}>
              {note.city}, {formatDate(note.issueDate)}.
            </p>
          </div>

          {/* Espaço para assinatura */}
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                width: "70%",
                height: "1px",
                backgroundColor: "#000",
              }}
            ></div>
            <p
              style={{
                margin: "2mm 0 0 0",
                fontWeight: "bold",
                fontSize: fontSizeBody,
                marginLeft: "15mm",
                textTransform: "uppercase",
                lineHeight: "1.3",
              }}
            >
              {note.emitterName.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
