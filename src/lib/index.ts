import { pipe } from "fp-ts/lib/pipeable";
import * as E from "fp-ts/lib/Either";
import { Token } from "./token";
import { tokenize } from "./tokenize";
import { parse } from "./cst/parse";
import { Rule } from "./rules";

export const parseCode = (code: string, tokens: Token[], grammar: Rule) =>
  pipe(
    tokenize(code, tokens),
    E.map(e => {
      console.log(e.map(v => `${v.token.name}(${v.value})`).join(" "));
      return e;
    }),
    E.map(tokenPos => parse(tokenPos, grammar))
  );
