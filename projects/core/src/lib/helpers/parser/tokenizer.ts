import TokenType, { Token } from './token-type';

const Tokenizer = (exp: string): Token[] => {
  let literal = '';
  const tokens: Token[] = [];
  for (const char of exp) {
    const code: number = char.charCodeAt(0);
    switch (code) {
      case TokenType.PAR_OPEN:
      case TokenType.PAR_CLOSE:
      case TokenType.OP_NOT:
      case TokenType.BINARY_AND:
      case TokenType.BINARY_OR:
        if (literal) {
          tokens.push({
            type: TokenType.LITERAL,
            value: literal,
          });
          literal = '';
        }
        tokens.push({
          type: code,
          value: char,
        });
        break;
      default:
        literal += char;
    }
  }

  if (literal)
    tokens.push({
      type: TokenType.LITERAL,
      value: literal,
    });

  return tokens;
};

export default Tokenizer;
