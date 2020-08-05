import { CSTNode } from "./cst";
import * as T from "@matechs/core/Effect";
import { pipe, flow, identity } from "@matechs/core/Function";
import * as O from "@matechs/core/Option";
import * as A from "@matechs/core/Array";
import * as TR from "@matechs/core/Tree";
import { of } from "@matechs/core/List";
import { RuleOutType } from "./rules";
import { Functor1 } from "fp-ts/lib/Functor";

export const treeFind: <A>(
  f: (a: A) => boolean
) => (fa: TR.Tree<A>) => O.Option<TR.Tree<A>> = (f) => (fa) =>
  pipe(
    fa.value,
    O.fromPredicate(f),
    O.fold(
      () => pipe(fa.forest, A.findFirstMap(treeFind(f))),
      () => O.some(fa)
    )
  );

export const treeFilter: <A>(
  f: (a: A) => boolean
) => (fa: TR.Tree<A>) => TR.Tree<A> = (f) => (fa) => ({
  value: fa.value,
  forest: pipe(fa.forest, A.filter(TR.fold(f)), A.map(treeFilter(f))),
});
// pipe(
//   fa.value,
//   A.chain(() => pipe(fa.forest, A.filter(f), {

//   }))
//   // O.fromPredicate(f),
//   // O.chain(() =>
//   //   pipe(
//   //     fa.forest,
//   //     A.map(treeFilter(f)),
//   //     O.chain(() => ({
//   //       value: fa.value,
//   //       forest: pipe(fa.forest, A.map(treeFilter(f))),
//   //     }))
//   //   )
//   // ),
//   // O.fold(
//   //   () => fa,
//   //   () => fa
//   // )
// );

// {
//   const value = f(fa.value);
//   return {
//     value,
//     forest: fa.forest.map(treeChain(f, value)),
//   };
// };
// const tree = TR.make(1, [TR.of(2), TR.of(3), TR.make(4, [TR.of(5)])]);

// pipe(
//   tree,
//   treeMap((a, b) => [a, b])
// );

// setTimeout(() => {
//   console.log(
//     pipe(
//       tree,
//       TR.traverse(O.option)((a) => (a < 2 ? O.some(a) : O.none))
//     )
//   );
// }, 1);

const parse: any = (node: TR.Tree<CSTNode>) => {
  // if (node.value.name === "BINARY_EXPRESSION") {
  //   console.log(node);
  // }

  // const toAstNode = (n: object) =>
  //   node.outType === RuleOutType.Node
  //     ? { kind: node.name, ...n }
  //     : { [node.name]: n };

  // if ("children" in node) {
  //   return pipe(
  //     node.children,
  //     A.traverse(O.option)(parse),
  //     O.map(A.reduce({}, Object.assign)),
  //     O.map(toAstNode)
  //   );
  // }

  // interface Show {
  //   readonly show: (a: CSTNode) => string;
  // }

  // // console.log(TR.getShow({ show: (t) => t.name } as Show));
  // setTimeout(() => {
  //   //   // console.log(
  //   //   //   TR.reduce("", (t, b) => {
  //   //   //     return t + "\n" + (b as any).name;
  //   //   //   })(node)
  //   //   // );

  //   console.log(
  //     pipe(
  //       node,
  //       TR.map(
  //         (t: any) => `${t.name} ${t.value ? `(${t.value})` : ""} ${t.priority}`
  //       ),
  //       TR.drawTree
  //     )
  //   );
  // }, 0);

  return O.some(node);
  // return O.some(toAstNode(node));
};

const sortExpression = (node: TR.Tree<CSTNode>): any => {
  if (node.value.name === "BINARY_EXPRESSION") {
    const n = pipe(
      node,
      treeFind(
        (n) =>
          n.name === "BINARY_EXPRESSION" && n.priority < node.value.priority
      )
    );

    if (O.isSome(n)) {
      return {
        value: n.value.value,
        forest: [
          ...n.value.forest,
          {
            ...node,
            forest: pipe(
              node,
              treeFilter(
                (n) =>
                  n.name !== "BINARY_EXPRESSION" ||
                  n.priority >= node.value.priority
              )
            ).forest,
          },
        ],
      };
    }

    return node;
  }

  return {
    ...node,
    forest: node.forest.map(sortExpression),
  };

  // if (node.name === "BINARY_EXPRESSION") {
  //   return pipe(node.operator);
  //   //   // const [operator] =
  //   //   //   node.children.find((n: any) => n.name === "operator")?.children ?? [];
  //   //   // console.log("oeprator", operator);
  //   //   // for (const c of node.children) {
  //   //   //   const [operator2] =
  //   //   //     c?.children?.[0]?.children?.find((n: any) => n.name === "operator")
  //   //   //       ?.children ?? [];
  //   //   //   console.log("operator2", operator2);
  //   //   //   if (operator2 && operator2?.priority < operator.priority) {
  //   //   //     console.log("p", node, c);
  //   //   //     return node;
  //   //   //     // return {
  //   //   //     //   ...node,
  //   //   //     //   children: node.children.map((ch: any) => ({
  //   //   //     //     ...ch,
  //   //   //     //     children: ch.children.map((cc: any) => cc.name === "operator" ? )
  //   //   //     //   })),
  //   //   //     // };
  //   //   //   }
  //   //   // }
  // }

  // return pipe(
  //   node,
  //   Object.entries,
  //   A.map(([k, v]) => [k, v]),
  //   Object.fromEntries
  // );
};

export const parseAst = (cst: TR.Tree<CSTNode>) =>
  pipe(
    parse(cst),
    O.map(sortExpression),
    O.map((node) => {
      setTimeout(() => {
        //   // console.log(
        //   //   TR.reduce("", (t, b) => {
        //   //     return t + "\n" + (b as any).name;
        //   //   })(node)
        //   // );

        console.log(
          pipe(
            node,
            TR.map(
              (t: any) =>
                `${t.name} ${t.value ? `(${t.value})` : ""} ${t.priority}`
            ),
            TR.drawTree
          )
        );
      }, 0);
    }),
    T.fromOption(() => "Err")
  );
