export const TokenType = {
  PAR_OPEN: '('.charCodeAt(0),
  PAR_CLOSE: ')'.charCodeAt(0),
  OP_NOT: '!'.charCodeAt(0),
  BINARY_AND: '&'.charCodeAt(0),
  BINARY_OR: '|'.charCodeAt(0),
  LITERAL: 'LITERAL',
  END: 'END',
  LEAF: 'LEAF',
  ATOMIC: 'ATOMIC',
};

export type TokenItem = number | string;

export interface Token {
  type: number | string;
  value: string;
}

export default TokenType;
