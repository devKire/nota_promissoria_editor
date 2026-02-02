import { PromissoryNote } from "@/lib/default-note";

interface NotePreviewProps {
  note: PromissoryNote;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
}

export default function NotePreview({
  note,
  formatCurrency,
  formatDate,
}: NotePreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          NOTA PROMISSÓRIA
        </h1>
        <div className="h-1 w-24 bg-gray-800 mx-auto"></div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-semibold">N°:</span>
          <span className="bg-yellow-100 px-3 py-1 rounded font-medium">
            {note.number}
          </span>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-semibold">Vencimento:</span>
          <span className="bg-yellow-100 px-3 py-1 rounded font-medium">
            {formatDate(note.dueDate)}
          </span>
        </div>

        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-semibold">Valor:</span>
          <span className="bg-yellow-100 px-3 py-1 rounded font-medium text-lg font-bold">
            {formatCurrency(note.amount)}
          </span>
        </div>

        <div className="mt-8 text-justify leading-relaxed">
          <p className="mb-4">
            Aos{" "}
            <span className="bg-yellow-100 px-2 py-1 rounded">
              {formatDate(note.dueDate)}
            </span>
            , pagarei por esta nota promissória à{" "}
            <span className="bg-yellow-100 px-2 py-1 rounded font-medium">
              {note.beneficiaryName}
            </span>
            , CNPJ n°{" "}
            <span className="bg-yellow-100 px-2 py-1 rounded">
              {note.beneficiaryCNPJ}
            </span>
            , ou à sua ordem, a quantia de{" "}
            <span className="bg-yellow-100 px-2 py-1 rounded font-medium">
              {note.formattedAmount}
            </span>
            , em moeda corrente nacional.
          </p>
          <p>
            Pagável em{" "}
            <span className="bg-yellow-100 px-2 py-1 rounded">
              {note.paymentLocation}
            </span>
            .
          </p>
        </div>

        <div className="mt-12 pt-8 border-t">
          <h3 className="font-bold text-lg mb-4 text-center">EMITENTE</h3>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Nome:</span>{" "}
              <span className="bg-yellow-100 px-2 py-1 rounded">
                {note.emitterName}
              </span>
            </p>
            <p>
              <span className="font-semibold">CPF:</span>{" "}
              <span className="bg-yellow-100 px-2 py-1 rounded">
                {note.emitterCPF}
              </span>
            </p>
            <p>
              <span className="font-semibold">Endereço:</span>{" "}
              <span className="bg-yellow-100 px-2 py-1 rounded">
                {note.emitterAddress}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center">
          <p>
            <span className="font-semibold">{note.city}</span>,{" "}
            <span className="bg-yellow-100 px-2 py-1 rounded">
              {formatDate(note.issueDate)}
            </span>
            .
          </p>
          <div className="mt-8 pt-8 border-t">
            <div className="h-24 flex items-center justify-center border border-gray-300 rounded">
              <p className="text-gray-600 italic">Assinatura do emitente</p>
            </div>
            <p className="mt-4 font-semibold text-lg">{note.emitterName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
