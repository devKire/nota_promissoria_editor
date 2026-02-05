import { NoteHTMLParams } from "@/app/types/note";

export const createNoteHTML = ({
  note,
  rotated = false,
  pageWidth,
  savePaper,
  formatCurrency,
  formatDate,
  formatFullDate,
  formatDateDDMMYYYY,
}: NoteHTMLParams) => {
  // Dimensões fixas
  const noteWidth = savePaper ? 120 : 150; // mm
  const noteHeight = savePaper ? 90 : 99; // mm

  // Fontes ajustadas
  const fontSizeTitle = savePaper ? "4.5mm" : "6mm";
  const fontSizeValue = savePaper ? "3mm" : "4mm";
  const fontSizeBody = savePaper ? "2.4mm" : "3.2mm";

  return (
    <div
      className="note-container"
      style={{
        width: `${noteWidth}mm`,
        height: `${noteHeight}mm`,
        backgroundColor: "white",
        padding: savePaper ? "0 2mm" : "0 3mm",
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        border: "1px solid #eee",
        position: "relative",
        transform: rotated ? "rotate(90deg)" : "none",
        transformOrigin: "top left",
        marginLeft: rotated ? `${noteHeight}mm` : "0",
      }}
    >
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transform: rotated ? "translateX(0mm)" : "none",
        }}
      >
        {/* Título */}
        <div style={{ textAlign: "center", margin: 0 }}>
          <h1
            style={{
              fontSize: fontSizeTitle,
              fontWeight: "bold",
              margin: 0,
              textTransform: "uppercase",
              lineHeight: 1.8,
              textDecoration: "underline black",
            }}
          >
            NOTA PROMISSÓRIA
          </h1>
        </div>

        {/* Número e Vencimento */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            margin: 0,
            padding: 0,
            lineHeight: 1.2,
          }}
        >
          <div style={{ transform: "translateY(-1.5mm)" }}>
            <span style={{ fontWeight: "bold", fontSize: fontSizeBody }}>
              Nº:
            </span>
            <span style={{ marginLeft: "1mm", fontSize: fontSizeBody }}>
              {note.number}
            </span>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ margin: 0 }}>
              <span style={{ fontWeight: "bold", fontSize: fontSizeBody }}>
                Vencimento:
              </span>
              <span style={{ marginLeft: "1mm", fontSize: fontSizeBody }}>
                {formatDateDDMMYYYY(note.dueDate)}
              </span>
            </div>
            <div style={{ marginTop: "0.5mm" }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: fontSizeValue,
                  display: "inline-block",
                }}
              >
                Valor: {formatCurrency(note.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Corpo do Texto */}
        <div style={{ marginBottom: savePaper ? "3mm" : "5mm" }}>
          <p
            style={{
              textAlign: "justify",
              lineHeight: 1.5,
              margin: 0,
              fontSize: fontSizeBody,
            }}
          >
            {formatFullDate(note.dueDate)}, pagarei por esta nota promissória à{" "}
            {note.beneficiaryName}, CNPJ n° {note.beneficiaryCNPJ}, ou à sua
            ordem, a quantia de <strong>{note.formattedAmount}</strong>, em
            moeda corrente nacional.
          </p>

          <p
            style={{
              textAlign: "left",
              lineHeight: 1.5,
              fontSize: fontSizeBody,
              margin: 0,
              marginTop: "2mm",
            }}
          >
            Pagável em {note.paymentLocation}.
          </p>
        </div>

        {/* Emitente */}
        <div style={{ marginBottom: "8mm", flexShrink: 0 }}>
          <h2
            style={{
              fontWeight: "bold",
              fontSize: fontSizeBody,
              textTransform: "uppercase",
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            EMITENTE
          </h2>

          <div style={{ lineHeight: 1.6, fontSize: fontSizeBody }}>
            <span style={{ fontWeight: "bold", fontSize: fontSizeBody }}>
              Nome:
            </span>
            <span style={{ fontSize: fontSizeBody }}>{note.emitterName}</span>
            <div>
              <span style={{ fontWeight: "bold", fontSize: fontSizeBody }}>
                CPF:
              </span>
              <span style={{ fontSize: fontSizeBody }}>{note.emitterCPF}</span>
            </div>
            <div>
              <span
                style={{
                  fontWeight: "bold",
                  display: "inline-block",
                  verticalAlign: "top",
                  fontSize: fontSizeBody,
                }}
              >
                Endereço:
              </span>
              <span style={{ fontSize: fontSizeBody }}>
                {note.emitterAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Local e Data */}
        <div
          style={{
            textAlign: "left",
            flexShrink: 0,
            marginBottom: savePaper ? "10mm" : "15mm",
            fontSize: fontSizeBody,
          }}
        >
          <p style={{ margin: 0 }}>
            {note.city}, {formatDate(note.issueDate)}.
          </p>
        </div>

        {/* Assinatura */}
        <div
          style={{
            flexShrink: 0,
            position: "absolute",
            bottom: "2mm",
            left: 0,
            right: 0,
          }}
        >
          <div
            style={{
              width: "60%",
              height: "1px",
              margin: 0,
              backgroundColor: "#000",
            }}
          />
          <p
            style={{
              margin: "0 0 0 15mm",
              fontWeight: "bold",
              fontSize: fontSizeBody,
              textTransform: "uppercase",
              lineHeight: 1.3,
            }}
          >
            {note.emitterName.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};
