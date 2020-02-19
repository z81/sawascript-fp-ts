import { consumeToken } from "./consume-token";
import * as O from "fp-ts/lib/Option";
import { Rule } from "../rules";
import { TokenPosition } from "../token";
import { parseAnd } from "./rules/and";
import { parseOr } from "./rules/or";
import { parseRepeat } from "./rules/repeat";
import { pipe } from "fp-ts/lib/pipeable";

export type ParsedRule = {
  name: string;
  tokens: TokenPosition[];
  children: ParsedRule[];
};

export type ParseResult = {
  tokens: TokenPosition[];
  rule?: ParsedRule;
};

export const parseResult = (parseResult: ParseResult) => parseResult;

const withLog = (
  clb: (
    tokenPos: TokenPosition[],
    rule: Rule,
    level: number
  ) => O.Option<ParseResult>
) => (tokenPos: TokenPosition[], rule: Rule, level = 0) => {
  const r = clb(tokenPos, rule, level + 1);
  console.log(
    `${" ".repeat(level)}  ${rule.type}} `,
    O.isSome(r)
      ? `${r.value.tokens.map(t => `${t.token.name}(${t.value})`).join(" ")}`
      : "none"
  );
  return r;
};

const parseRule = (
  tokenPos: TokenPosition[],
  rules: Rule[],
  level: number
): O.Option<ParseResult> => parseAnd(tokenPos, rules, level);

export const parse = withLog(
  (tokenPos: TokenPosition[], rule: Rule, level = 0): O.Option<ParseResult> => {
    console.log(
      `${" ".repeat(level)} {${rule.type}   tokens[${tokenPos &&
        tokenPos.length}]  `,
      tokenPos.map(t => t.token.name).join(" ")
    );

    switch (rule.type) {
      case "CONSUME":
        return consumeToken([...tokenPos], rule);
      case "REPEAT":
        return parseRepeat(tokenPos, rule, level);
      case "OR":
        return parseOr(tokenPos, rule, level);
      case "AND":
        return parseAnd(tokenPos, rule.children, level);
      case "RULE":
        const result = pipe(
          parseRule(tokenPos, rule.children, level),
          O.map(result =>
            parseResult({
              ...result,
              rule: {
                name: rule.name!,
                tokens: result.tokens,
                children: []
              }
            })
          )
        );

        return result;
    }
  }
);
