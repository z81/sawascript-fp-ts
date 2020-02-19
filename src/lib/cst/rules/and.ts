import { TokenPosition } from "../../token";
import { Rule } from "../../rules";
import { ParseResult, parse } from "../parse";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/Array";

export const parseAnd = (
  tokenPos: TokenPosition[],
  [rule, ...rules]: Rule[],
  level: number
): O.Option<ParseResult> =>
  pipe(
    parse([...tokenPos], rule, level + 1),
    O.chain(parseResult => {
      if (A.isEmpty(rules)) {
        return O.some(parseResult);
      }

      return pipe(
        parseAnd(tokenPos.slice(parseResult.tokens.length), rules, level),
        O.map(t => ({
          tokens: [...parseResult.tokens, ...t.tokens],
          rule: parseResult.rule
        }))
      );
    })
  );
