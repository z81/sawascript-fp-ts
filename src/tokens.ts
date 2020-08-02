import { Eq, getStructEq, eqString } from "@matechs/core/Eq";
import { pipe } from "@matechs/core/Function";
import * as O from "@matechs/core/Option";
import * as A from "@matechs/core/Array";

export type TokenConfig<T extends string> = { regexp: RegExp; type: T };

export const tokenOf = <T extends string>(config: TokenConfig<T>) => config;

const tokensArray = [
  tokenOf({ type: "SPACE", regexp: /^ / }),
  tokenOf({ type: "NUMBER", regexp: /^\d*/ }),
  tokenOf({ type: "PLUS", regexp: /^\+/ }),
];

export type Token = typeof tokensArray[number];

export type CodeToken = {
  token: Token;
  start: number;
  end: number;
  value: string;
};

export const tokens = Object.fromEntries(
  tokensArray.map((token) => [token.type, token])
) as { [k in Token["type"]]: TokenConfig<k> };

export default tokensArray;

export const matchToken = (token: Token, code: string) =>
  pipe(
    O.fromNullable(code.match(token.regexp)?.[0] || null),
    O.map((value) => ({
      token,
      value,
    }))
  );

export const eqToken: Eq<Token> = getStructEq({
  type: eqString,
});
