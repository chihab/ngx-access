import Tokenizer from './tokenizer';
import { PolishNotation, PolishGenerator } from './polish';
import { make, nodeEvaluator } from './node';
import TokenType from './token-type';

const parser = (exp) => {
  const tokens = Tokenizer(exp);
  const polish = PolishNotation(tokens);
  const gen = PolishGenerator(polish);
  const tree = make(gen);
  return tree;
};

export { nodeEvaluator, TokenType, parser };