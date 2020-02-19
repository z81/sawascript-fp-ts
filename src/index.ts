import { tokens } from "./tokens";
import { grammar } from "./grammar";
import { parseCode } from "./lib";
import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { ParsedRule } from "./lib/cst/parse";

const code = `a b = 1 + 1 \n\n`;

const IGNORED_TOKENS = ["SPACE", "EOL"];

const parseCst = (parsedRule: ParsedRule) => {
  const tokens = parsedRule.tokens.filter(
    t => !IGNORED_TOKENS.includes(t.token.name)
  );
  console.log("cst", tokens);

  //
};

pipe(
  parseCode(code, Object.values(tokens), grammar),
  E.map(v =>
    pipe(
      v,
      O.chain(r => (r.rule ? O.some(r.rule) : O.none)),
      O.map(parseCst)
    )
  ),
  E.map(v => {
    console.log(v);
    return v;
  })
);
