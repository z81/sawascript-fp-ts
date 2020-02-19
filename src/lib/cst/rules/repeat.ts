import { TokenPosition } from "../../token";
import { Rule, ConstructRule } from "../../rules";
import { ParseResult, parseResult } from "../parse";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { parseAnd } from "./and";

export const parseRepeat = (
  tokenPos: TokenPosition[],
  rule: Rule,
  level: number
): O.Option<ParseResult> =>
  pipe(
    parseAnd([...tokenPos], (rule as ConstructRule).children, level + 1),
    O.chain(r =>
      pipe(
        tokenPos,
        O.fromPredicate(() => r.tokens.length !== tokenPos.length),
        O.fold(
          () =>
            pipe(
              r,
              O.fromPredicate(() => r.tokens.length === 0),
              O.map(() => parseResult({ tokens: r.tokens, rule: r.rule }))
            ),
          () => parseRepeat(tokenPos.slice(r.tokens.length), rule, level)
        ),
        O.fold(
          () => O.some({ tokens: r.tokens, rule: r.rule }),
          t =>
            O.some({
              tokens: [...r.tokens, ...t.tokens],
              rule: t.rule || r.rule
            })
        )
      )
    )
  );
