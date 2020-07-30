import { pipe } from "@matechs/core/Function";
import * as T from "@matechs/core/Effect";
import * as O from "@matechs/core/Option";
import * as A from "@matechs/core/Array";
import { Rule, ConsumeRule, AndRule, OrRule, NamedRule } from "./rules";
import { grammar } from "./grammar";
import { CodeToken, eqToken, Token } from "./tokens";
import { Env } from "./environment";
import { Ord, contramap, ordNumber } from "@matechs/core/Ord";

export type CSTNode =
  | {
      name: string;
      token: Token;
      start: number;
      end: number;
      value: string;
      priority: number;
      type: Rule["type"];
    }
  | {
      name: string;
      children: CSTNode[];
      priority: number;
      type: Rule["type"];
    };

export const cstNodePriority: Ord<CSTNode> = contramap(
  (node: CSTNode) => -node.priority
)(ordNumber);

const parseAnd = (
  tokens: readonly CodeToken[],
  rules: readonly Rule[]
): O.Option<CSTNode[]> =>
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
): O.Option<CSTNode> => {
  switch (rule.type) {
    case "OR":
      return pipe(
        rule.children as any,
        A.map((r) => (typeof r === "function" ? r() : r)),
        A.findFirstMap(parseRule(tokens)),
        O.map((r) => ({ ...rule, children: [r] }))
      );
    case "AND":
    case "RULE":
      return pipe(
        parseAnd(tokens, rule.children),
        O.map((children) => ({
          type: rule.type,
          name: rule.name,
          children,
          priority: rule.priority,
        }))
      );
    case "CONSUME":
      return pipe(
        tokens,
        A.head,
        O.chainTap(
          O.fromPredicate(({ token }) => eqToken.equals(rule.token, token))
        ),
        O.map((tokenInfo) => ({
          ...tokenInfo,
          name: rule.name,
          priority: rule.priority,
          type: rule.type,
        }))
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
