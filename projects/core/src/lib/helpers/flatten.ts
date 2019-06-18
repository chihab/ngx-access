export function flatten(tree, nodeEvaluator, leafEvaluator) {
  const ROOT = '__root';
  function getPath(path, delimiter, prop) {
    return path && path != ROOT
      ? path + delimiter + prop
      : prop;
  }
  function arrayPush(arr, value) {
    if (!arr)
      arr = [];
    arr.push(value);
    return arr;
  }
  function visitor(node, path = '', key = '') {
    if (typeof node === 'object') {
      const nodePath = getPath(path, '.', key);
      return Object.keys(node)
        .reduce((_acc, _key) => {
          const childPath = getPath(nodePath, '.', _key);
          const childNode = visitor(node[_key], nodePath, _key);
          if (childNode.__type === 'LEAF') {
            console.log(_key + ' ===> ' + childNode.__value);
            _acc[_key] = leafEvaluator(childNode.__value);
            return _acc;
          }
          return Object.keys(childNode)
            .filter(__action => __action !== '__type')
            .reduce((__acc, __key) => {
              if (__key === '__flat') {
                __acc.__flat = { ...__acc.__flat, ...childNode.__flat };
              }
              else {
                const __path = getPath(childPath, ':', __key)
                __acc[__key] = arrayPush(__acc[__key], __path);
                if (Array.isArray(childNode[__key])) {
                  __acc.__flat[__path] = nodeEvaluator(__acc.__flat, childNode[__key]);
                } else {
                  __acc.__flat[__path] = childNode[__key];
                }
              }
              return __acc;
            }, _acc)
        }, { __flat: {}, __type: 'NODE' })
    } else {
      const __value = node;
      return {
        __value, __type: 'LEAF', __flat: { [getPath(path, ':', key)]: __value }
      };
    }
  }
  return visitor({ [ROOT]: tree }).__flat;
}
