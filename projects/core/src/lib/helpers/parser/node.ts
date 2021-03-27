import TokenType, { Token, TokenItem } from './token-type';

export class ExpNode {
  constructor(
    public op: TokenItem,
    public left: ExpNode | null,
    public right?: ExpNode | null,
    public literal?: string
  ) {}

  isLeaf() {
    return this.op === TokenType.LEAF;
  }

  isAtomic() {
    return (
      this.isLeaf() || (this.op === TokenType.OP_NOT && this.left?.isLeaf())
    );
  }

  getLiteralValue(): string {
    return this.literal || '';
  }

  static CreateAnd(left: ExpNode | null, right: ExpNode | null) {
    return new ExpNode(TokenType.BINARY_AND, left, right);
  }

  static CreateNot(exp: ExpNode | null) {
    return new ExpNode(TokenType.OP_NOT, exp);
  }

  static CreateOr(left: ExpNode | null, right: ExpNode | null) {
    return new ExpNode(TokenType.BINARY_OR, left, right);
  }

  static CreateLiteral(lit: string) {
    return new ExpNode(TokenType.LEAF, null, null, lit);
  }
}

export const make = (gen: Generator<Token>): ExpNode | null => {
  const data = gen.next().value;

  switch (data.type) {
    case TokenType.LITERAL:
      return ExpNode.CreateLiteral(data.value);
    case TokenType.OP_NOT:
      return ExpNode.CreateNot(make(gen));
    case TokenType.BINARY_AND: {
      const left = make(gen);
      const right = make(gen);
      return ExpNode.CreateAnd(left, right);
    }
    case TokenType.BINARY_OR: {
      const left = make(gen);
      const right = make(gen);
      return ExpNode.CreateOr(left, right);
    }
  }
  return null;
};

export type NodeEvaluator = (
  tree: ExpNode | null | undefined,
  literalEvaluator: LiteralEvaluator
) => boolean;

export type LiteralEvaluator = (tokenItem?: TokenItem) => boolean;

export const nodeEvaluator: NodeEvaluator = (
  tree,
  literalEvaluator
): boolean => {
  if (tree) {
    if (tree.isLeaf()) {
      return literalEvaluator(tree.getLiteralValue());
    }

    if (tree.op === TokenType.OP_NOT) {
      return !nodeEvaluator(tree.left, literalEvaluator);
    }

    if (tree.op === TokenType.BINARY_OR) {
      return (
        nodeEvaluator(tree.left, literalEvaluator) ||
        nodeEvaluator(tree.right, literalEvaluator)
      );
    }

    if (tree.op === TokenType.BINARY_AND) {
      return (
        nodeEvaluator(tree.left, literalEvaluator) &&
        nodeEvaluator(tree.right, literalEvaluator)
      );
    }
  }
  return false;
};
