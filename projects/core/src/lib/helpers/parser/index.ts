import Tokenizer from './tokenizer';
import { PolishNotation, PolishGenerator } from './polish';
import { make, ExpNode, nodeEvaluator } from './node';
import TokenType from './token-type';

const parser = (exp) => {
  const tokens = Tokenizer(exp.replace(/\s/g, ''));
  const polish = PolishNotation(tokens);
  const gen = PolishGenerator(polish);
  const tree = make(gen);
  return tree;
};

export { nodeEvaluator, ExpNode, TokenType, parser };