import TokenType from './token-type';

const PolishNotation = tokens => {
  let queue = [];
  const stack = [];
  let subQueue = [];
  let subStack = [];

  tokens.forEach(token => {
    switch (token.type) {
      case TokenType.LITERAL:
      case TokenType.OP_NOT:
        if (subStack.length) {
          subQueue.push(token)
        }
        else {
          queue.push(token);
        }
        break;
      case TokenType.BINARY_AND:
      case TokenType.BINARY_OR:
        if (subStack.length) {
          subStack.unshift(token);
        }
        else {
          stack.unshift(token);
        }
        break;
      case TokenType.PAR_OPEN:
        subStack.unshift(token);
        break;
      case TokenType.PAR_CLOSE:
        while (
          subStack.length &&
          subStack[subStack.length - 1].type !== TokenType.PAR_OPEN
        ) {
          subQueue.unshift(subStack.pop());
        }

        subStack.pop();

        if (subStack.length && subStack[subStack.length - 1].type === TokenType.OP_NOT) {
          subQueue.unshift(subStack.pop());
        }
        queue = queue.concat([...subStack, ...subQueue]);
        subStack = [];
        subQueue = [];
        break;
      default:
        break;
    }
    // debugger;
  });

  const result = (stack.length && [...stack, ...queue]) || queue;

  return result;
};

const PolishGenerator = function* (polish) {
  for (let index = 0; index < polish.length - 1; index++) {
    yield polish[index];
  }

  return polish[polish.length - 1];
};

export {
  PolishNotation,
  PolishGenerator
};
