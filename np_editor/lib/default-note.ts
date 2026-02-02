export interface PromissoryNote {
  id: string;
  number: string;
  dueDate: string;
  amount: number;
  formattedAmount: string;
  beneficiaryName: string;
  beneficiaryCNPJ: string;
  emitterName: string;
  emitterCPF: string;
  emitterAddress: string;
  paymentLocation: string;
  issueDate: string;
  city: string;
  state: string;
}

export const defaultNote: PromissoryNote = {
  id: "1",
  number: "01 de 01",
  dueDate: "2023-02-10",
  amount: 2090.0,
  formattedAmount: "DOIS MIL E NOVENTA REAIS",
  beneficiaryName: "MARCOS ADRIANO BORBA SOCIEDADE INDIVIDUAL DE ADVOCACIA",
  beneficiaryCNPJ: "44.488.339/0001-54",
  emitterName: "Nome Completo do Emitente",
  emitterCPF: "895.490.749-00",
  emitterAddress:
    "Rua Coral, s/n°, lote 05, Bairro Ribeirão das Pedras, Indaial/SC, CEP: 89.080-063",
  paymentLocation: "Indaial/SC",
  issueDate: "2023-02-03",
  city: "Indaial",
  state: "SC",
};
