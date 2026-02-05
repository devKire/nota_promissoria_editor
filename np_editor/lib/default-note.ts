// lib/default-note.ts
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
  city: string;
  state: string;
  paymentLocation: string;
  issueDate: string;
  installments: number; // Nova propriedade para parcelamento
  currentInstallment: number; // Nova propriedade para parcela atual
  totalInstallments: number; // Nova propriedade para total de parcelas
}

export const defaultNote: PromissoryNote = {
  id: crypto.randomUUID(),
  number: "01 de 01",
  dueDate: new Date().toISOString().split("T")[0],
  amount: 2090.0,
  formattedAmount: "DOIS MIL E NOVENTA REAIS",
  beneficiaryName: "MARCOS ADRIANO BORBA SOCIEDADE INDIVIDUAL DE ADVOCACIA",
  beneficiaryCNPJ: "44.488.339/0001-54",
  emitterName: "Nome Completo do Emitente",
  emitterCPF: "000.000.000-00",
  emitterAddress:
    "Rua Coral, s/n°, lote 05, Bairro Ribeirão das Pedras, Indaial/SC, CEP: 89.080-063",
  city: "Indaial",
  state: "SC",
  paymentLocation: "Indaial/SC",
  issueDate: new Date().toISOString().split("T")[0],
  installments: 1, // Padrão: 1 parcela
  currentInstallment: 1, // Padrão: parcela 1
  totalInstallments: 1, // Padrão: 1 parcela total
};

// Função para gerar número automático
let noteCounter = 1;

export function generateNoteNumber(): string {
  const number = noteCounter++;
  return `${number.toString().padStart(2, "0")} de ${number.toString().padStart(2, "0")}`;
}

export function generateParceledNoteNumber(
  baseNumber: number,
  current: number,
  total: number,
): string {
  return `${baseNumber.toString().padStart(2, "0")}/${current.toString().padStart(2, "0")} de ${total.toString().padStart(2, "0")}`;
}

export function formatNumberToWords(value: number): string {
  // Primeiro, separar a parte inteira e decimal
  let integerPart = Math.floor(value);
  const decimalPart = Math.round((value - integerPart) * 100);

  // Função auxiliar para formatar números de 1 a 999
  const formatUnder1000 = (num: number): string => {
    if (num === 0) return "";

    const units = [
      "",
      "UM",
      "DOIS",
      "TRÊS",
      "QUATRO",
      "CINCO",
      "SEIS",
      "SETE",
      "OITO",
      "NOVE",
      "DEZ",
      "ONZE",
      "DOZE",
      "TREZE",
      "CATORZE",
      "QUINZE",
      "DEZESSEIS",
      "DEZESSETE",
      "DEZOITO",
      "DEZENOVE",
    ];

    const tens = [
      "",
      "",
      "VINTE",
      "TRINTA",
      "QUARENTA",
      "CINQUENTA",
      "SESSENTA",
      "SETENTA",
      "OITENTA",
      "NOVENTA",
    ];

    const hundreds = [
      "",
      "CENTO",
      "DUZENTOS",
      "TREZENTOS",
      "QUATROCENTOS",
      "QUINHENTOS",
      "SEISCENTOS",
      "SETECENTOS",
      "OITOCENTOS",
      "NOVECENTOS",
    ];

    let result = "";

    // Centenas
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;

    if (hundred > 0) {
      if (num === 100) {
        return "CEM";
      }
      result += hundreds[hundred];
      if (remainder > 0) {
        result += " E ";
      }
    }

    // Dezenas e unidades (0-99)
    if (remainder > 0) {
      if (remainder < 20) {
        result += units[remainder];
      } else {
        const ten = Math.floor(remainder / 10);
        const unit = remainder % 10;
        result += tens[ten];
        if (unit > 0) {
          result += " E " + units[unit];
        }
      }
    }

    return result.trim();
  };

  // Caso especial: zero
  if (integerPart === 0 && decimalPart === 0) {
    return "ZERO REAIS";
  }

  let result = "";
  const originalIntegerPart = integerPart;
  const hasMillions = integerPart >= 1000000;
  const hasThousands = integerPart >= 1000;
  let isExactMillion = false;

  // Processar milhões
  if (hasMillions) {
    const millions = Math.floor(integerPart / 1000000);
    const remainder = integerPart % 1000000;

    if (millions === 1) {
      result += "UM MILHÃO";
    } else {
      const millionsText = formatUnder1000(millions);
      result += millionsText + " MILHÕES";
    }

    // Verificar se é um milhão exato (sem resto)
    isExactMillion = remainder === 0;

    if (remainder > 0) {
      // Se houver resto, usar "E" apenas se o resto for menor que 1000
      // (ou seja, se não houver milhares no resto)
      if (remainder < 1000) {
        result += " E ";
      } else {
        result += " ";
      }
    }
    integerPart = remainder;
  }

  // Processar milhares
  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    const remainder = integerPart % 1000;

    if (thousands === 1) {
      result += "MIL";
    } else {
      const thousandsText = formatUnder1000(thousands);
      result += thousandsText + " MIL";
    }

    if (remainder > 0) {
      // REGRA CORRIGIDA: Usar "E" após milhar quando:
      // 1. O resto for menor que 100 (apenas dezenas/unidades) OU
      // 2. O resto for múltiplo de 100 (centenas exatas: 100, 200, 300, etc.)
      if (remainder < 100 || remainder % 100 === 0) {
        result += " E ";
      } else {
        result += " ";
      }
    }
    integerPart = remainder;
  }

  // Processar centenas, dezenas e unidades restantes
  if (integerPart > 0) {
    const under1000Text = formatUnder1000(integerPart);
    result += under1000Text;
  }

  // Limpar espaços extras
  result = result.trim();

  // Verificar se temos milhões exatos
  const isRoundMillion = hasMillions && !hasThousands && integerPart === 0;

  // Processar centavos
  let centavosPart = "";
  if (decimalPart > 0) {
    const centavosText = formatUnder1000(decimalPart);

    // Formatando os centavos corretamente
    centavosPart = centavosText;

    if (decimalPart === 1) {
      centavosPart += " CENTAVO";
    } else {
      centavosPart += " CENTAVOS";
    }
  }

  // Montar o resultado final
  let finalResult = "";

  if (result) {
    // REGRA PARA MILHÕES EXATOS: usar "DE REAIS"
    if (isRoundMillion) {
      if (originalIntegerPart === 1000000) {
        finalResult = result + " DE REAIS";
      } else {
        finalResult = result + " DE REAIS";
      }
    }
    // REGRA PARA MILHÕES NÃO EXATOS COM RESTOS SIMPLES
    else if (hasMillions && integerPart > 0 && integerPart < 1000) {
      // Já tem "E" inserido na lógica acima
      finalResult = result + (originalIntegerPart === 1 ? " REAL" : " REAIS");
    }
    // OUTROS CASOS
    else {
      if (originalIntegerPart === 1) {
        finalResult = result + " REAL";
      } else {
        finalResult = result + " REAIS";
      }
    }

    // Adicionar centavos se houver
    if (centavosPart) {
      finalResult += " E " + centavosPart.toLowerCase();
    }
  } else {
    // Apenas centavos (valor menor que 1 real)
    if (decimalPart === 1) {
      finalResult = centavosPart + " DE REAL";
    } else {
      finalResult = centavosPart + " DE REAIS";
    }
  }

  // Ajustar casos especiais
  finalResult = finalResult
    .replace(/\s+/g, " ")
    // Corrigir "UM MIL" para "MIL" quando apropriado
    .replace(/\bUM MIL(\s|$)/g, "MIL$1")
    // Remover "E" duplicado
    .replace(/\bE\s+E\b/g, "E")
    // Corrigir "UM MILHÃO E " quando não deveria ter "E"
    .replace(/UM MILHÃO E (\d+)/g, (match, p1) => {
      const num = parseInt(p1);
      if (num < 1000) {
        return "UM MILHÃO E " + p1;
      }
      return "UM MILHÃO " + p1;
    })
    // Correção para milhões exatos
    .replace(/(MILHÃO|MILHÕES) REAIS/g, "$1 DE REAIS")
    .trim();

  return finalResult.toUpperCase();
}

// Função para calcular datas das parcelas
export function calculateInstallmentDates(
  startDate: string,
  installments: number,
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < installments; i++) {
    const date = new Date(start);
    date.setMonth(start.getMonth() + i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
}
