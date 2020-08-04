import { CSTNode } from "./cst";
import * as T from "@matechs/core/Effect";
import { pipe, flow } from "@matechs/core/Function";
import * as O from "@matechs/core/Option";
import * as A from "@matechs/core/Array";
import { of } from "@matechs/core/List";
import { RuleOutType } from "./rules";

const parse: any = (node: CSTNode) => {
  const toAstNode = (n: object) =>
    node.outType === RuleOutType.Node
      ? { kind: node.name, ...n }
      : { [node.name]: n };

  if ("children" in node) {
    return pipe(
      node.children,
      A.traverse(O.option)(parse),
      O.map(A.reduce({}, Object.assign)),
      O.map(toAstNode)
    );
  }

  return O.some(toAstNode(node));
};

const sortExpression = (node: any) => {
  // console.log("Ast", node);

  if (node.name === "BINARY_EXPRESSION") {
    // const [operator] =
    //   node.children.find((n: any) => n.name === "operator")?.children ?? [];
    // console.log("oeprator", operator);
    // for (const c of node.children) {
    //   const [operator2] =
    //     c?.children?.[0]?.children?.find((n: any) => n.name === "operator")
    //       ?.children ?? [];
    //   console.log("operator2", operator2);
    //   if (operator2 && operator2?.priority < operator.priority) {
    //     console.log("p", node, c);
    //     return node;
    //     // return {
    //     //   ...node,
    //     //   children: node.children.map((ch: any) => ({
    //     //     ...ch,
    //     //     children: ch.children.map((cc: any) => cc.name === "operator" ? )
    //     //   })),
    //     // };
    //   }
    // }
  }

  if (!node.children) {
    return node;
  }

  return {
    ...node,
    children: node.children.map(sortExpression),
  };
};

export const parseAst = (cst: CSTNode) =>
  pipe(
    parse(sortExpression(cst)),
    T.fromOption(() => "Err")
  );
