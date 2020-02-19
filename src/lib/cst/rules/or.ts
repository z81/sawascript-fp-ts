import { TokenPosition } from "../../token";
import { ConstructRule } from "../../rules";
import { parseResult, parse } from "../parse";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/Array";

export const parseOr = (
  tokenPos: TokenPosition[],
  rule: ConstructRule,
  level: number
) =>
  pipe(
    rule.children,
    A.findFirstMap(rule => parse([...tokenPos], rule, level + 1)),
    O.map(parseResult)
  );
