import Tokenizer from './tokenizer';
import { PolishNotation, PolishGenerator } from './polish';
import { ExpNode, make, nodeEvaluator } from './node';
import TokenType, { Token } from './token-type';

const parser = (exp: string): ExpNode | null => {
  const tokens: Token[] = Tokenizer(exp.replace(/\s/g, ''));
  const polish: Token[] = PolishNotation(tokens);
  const gen: Generator<Token> = PolishGenerator(polish);
  const tree: ExpNode | null = make(gen);
  return tree;
};

export { nodeEvaluator, TokenType, parser };
