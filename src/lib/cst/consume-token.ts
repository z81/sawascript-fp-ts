import { pipe } from "fp-ts/lib/pipeable";
import * as O from "fp-ts/lib/Option";
import * as A from "fp-ts/lib/Array";
import { ConsumeRule } from "../rules";
import { TokenPosition, Token } from "../token";
import { parseResult } from "./parse";
import { getStructEq, Eq, eqString } from "fp-ts/lib/Eq";

const eqToken: Eq<Token> = getStructEq({
  name: eqString
});

export const consumeToken = (tokenPos: TokenPosition[], rule: ConsumeRule) =>
  pipe(
    A.head(tokenPos),
    O.chain(t => (eqToken.equals(rule.token, t.token) ? O.some(t) : O.none)),
    O.map(t => parseResult({ tokens: [t] }))
  );
