import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { TokenPosition, Token } from "./token";

export const tokenize = (
  code: string,
  tokens: Token[],
  offset = 0,
  tokensPos: TokenPosition[] = []
): E.Either<Error, TokenPosition[]> =>
  pipe(
    tokens,
    A.findFirstMap(token =>
      pipe(
        token.regexp.exec(code),
        O.fromNullable,
        O.map(([value]) => ({
          token,
          value,
          position: {
            start: offset,
            end: offset + value.length
          }
        }))
      )
    ),
    E.fromOption(() => new Error(`Unknown token: "${code.substring(0, 10)}"`)),
    E.chain(token =>
      pipe(
        code.substr(token.value.length) || null,
        O.fromNullable,
        O.fold(
          () => E.right(tokensPos),
          code =>
            tokenize(code, tokens, token.position.end, tokensPos.concat(token))
        )
      )
    )
  );
