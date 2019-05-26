import { parser, TokenType } from './';;

describe('Parser', () => {

  it('should correctly evaluate "Admin | !Visitor"', () => {    
    const tree = parser('Admin | !Visitor');
    expect(tree.op).toBe(TokenType.BINARY_OR);
    expect(tree.left.op).toBe(TokenType.LEAF);
    expect(tree.right.op).toBe(TokenType.OP_NOT);
  });

  it('should correclty evaluate "!(Admin | !Visitor)"', () => {    
    const tree = parser('!(Admin | !Visitor)');
    expect(tree.op).toBe(TokenType.OP_NOT);
    expect(tree.left.op).toBe(TokenType.BINARY_OR);
    expect(tree.right).toBe(undefined);
  });

  it('should correclty evaluate "(CanRead & CanWrite) | (Admin | !Visitor)"', () => {    
    const tree = parser('(CanRead & CanWrite) | (Admin | !Visitor)');
    expect(tree.op).toBe(TokenType.BINARY_OR);
    expect(tree.left.op).toBe(TokenType.BINARY_AND);
    expect(tree.right.op).toBe(TokenType.BINARY_OR);
  });

});


