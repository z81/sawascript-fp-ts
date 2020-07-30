import { CSTNode, cstNodePriority } from "./cst";
import * as T from "@matechs/core/Effect";
import { pipe, flow } from "@matechs/core/Function";
import * as O from "@matechs/core/Option";
import * as A from "@matechs/core/Array";
import { of } from "@matechs/core/List";

const parse: any = (node: CSTNode) => {
  if ("children" in node) {
    return pipe(
      node.children,
      A.sort(cstNodePriority),
      A.traverse(O.option)(parse),
      O.map(
        A.reduce({}, (acc, n: any) => ({
          ...acc,
          ...n,
        }))
      ),
      O.map((value) => ({ [node.name]: value }))
    );
  }

  return O.some({
    [node.name]: node,
  });
};

export const parseAst = (cst: CSTNode) => T.fromOption(() => "Err")(parse(cst));
