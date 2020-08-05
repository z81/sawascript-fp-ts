import { pipe } from "@matechs/core/Function";
import * as T from "@matechs/core/Effect";
import * as O from "@matechs/core/Option";
import * as A from "@matechs/core/Array";
import * as TR from "@matechs/core/Tree";
import {
  Rule,
  ValueRule,
  AndRule,
  OrRule,
  NamedRule,
  RuleOutType,
} from "./rules";
import { grammar } from "./grammar";
import { CodeToken, eqToken, Token } from "./tokens";
import { Env } from "./environment";
import { Ord, contramap, ordNumber } from "@matechs/core/Ord";
import { Transform } from "stream";

export type CSTNode = {
  name: string;
  outType: RuleOutType;
  priority: number;
  type: Rule["type"];
} & (
  | {
      token: Token;
      start: number;
      end: number;
      raw: string;
    }
  | {}
);

export const cstNodePriority: Ord<CSTNode> = contramap(
  (node: CSTNode) => -node.priority
)(ordNumber);

const parseAnd = (
  tokens: readonly CodeToken[],
  rules: readonly Rule[]
): O.Option<TR.Tree<CSTNode>[]> =>
  pipe(
    rules,
    A.head,
    O.chain(parseRule(tokens)),
    O.chain((rule) =>
      pipe(
        O.some({
          nextTokens: pipe(tokens, A.dropLeft(1)),
          nextRules: pipe(rules, A.dropLeft(1)),
        }),
        O.chain(({ nextTokens, nextRules }) =>
          pipe(
            nextRules,
            O.fromPredicate(A.isNonEmpty),
            O.fold(
              () => O.some([]),
              () => parseAnd(nextTokens, nextRules)
            )
          )
        ),
        O.map((nextRule) => [rule, ...nextRule])
      )
    )
  );

const parseRule = (tokens: readonly CodeToken[]) => (
  rule: Rule
): O.Option<TR.Tree<CSTNode>> => {
  switch (rule.type) {
    case "OR":
      return pipe(
        rule.children as any,
        A.map((r) => (typeof r === "function" ? r() : r)),
        A.findFirstMap(parseRule(tokens)),
        O.map((r) =>
          TR.make(
            {
              ...rule,
              priority:
                r.value.type !== "RULE" ? r.value.priority : rule.priority,
            },
            [r]
          )
        )
      );
    case "AND":
    case "RULE":
      return pipe(
        parseAnd(tokens, rule.children),
        O.map((children) => {
          const priority =
            rule.type === "RULE"
              ? Math.max(
                  rule.priority,
                  ...children.map((r) => r.value.priority)
                )
              : rule.priority;

          return TR.make(
            {
              type: rule.type,
              name: rule.name,
              priority,
              outType: rule.outType,
            },
            children
          );
        })
      );
    case "VALUE":
      return pipe(
        tokens,
        A.head,
        O.chainTap(
          O.fromPredicate(({ token }) => eqToken.equals(rule.token, token))
        ),
        O.map((tokenInfo) =>
          TR.of({
            ...tokenInfo,
            name: rule.name,
            priority: rule.priority,
            type: rule.type,
            outType: rule.outType,
            raw: tokenInfo.value,
          })
        )
      );
  }
};

export const parseCst = (allTokens: readonly CodeToken[]) =>
  pipe(
    T.pure(T.accessEnvironment<Env>()),
    T.chain((env) =>
      pipe(
        T.pure(allTokens.filter((t) => t.token.type !== "SPACE")),
        T.chain((tokens) =>
          pipe(
            grammar,
            parseRule(tokens),
            T.fromOption(() => "Syntax error")
          )
        )
      )
    )
  );
