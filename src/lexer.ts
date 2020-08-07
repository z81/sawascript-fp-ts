import * as T from "@matechs/core/Effect";
import { CodeToken, matchToken } from "./tokens";
import TOKENS_LIST from "./tokens";
import { pipe } from "@matechs/core/Function";
import * as O from "@matechs/core/Option";
import * as A from "@matechs/core/Array";
import { Env } from "./environment";

export const formatSyntaxError = (offset: number, code: string) => {
  const errInCode = code.substr(offset - 5, 9);
  const errorText = `Unknown token on position \x1b[31m${offset}\x1b[0m  "\x1b[31m${errInCode}\x1b[0m"`;
  const errorLine = `~`.repeat(47 + offset.toString().length);

  return `${errorText}\n\x1b[31m${errorLine}^\x1b[0m`;
};

export const tokenize = (
  code: string,
  offset = 0,
  tokens: CodeToken[] = []
): T.Effect<Env, Env, SyntaxError, CodeToken[]> =>
  pipe(
    T.pure(T.accessEnvironment<Env>()),
    T.chain((env) =>
      pipe(
        TOKENS_LIST,
        A.findFirstMap(matchToken(code.substr(offset))),
        O.map((tokenInfo) => ({
          ...tokenInfo,
          start: offset,
          end: offset + tokenInfo.value.length,
        })),
        T.fromOption(() => new SyntaxError(formatSyntaxError(offset, code))),
        T.map((tokenInfo) => ({
          nextTokens: tokens.concat(tokenInfo),
          tokenInfo,
        })),
        T.chain(({ nextTokens, tokenInfo }) =>
          pipe(
            O.fromNullable(code.length > tokenInfo.end ? code : null),
            O.fold(
              () => T.pure(nextTokens),
              (code) => tokenize(code, tokenInfo.end, nextTokens)
            )
          )
        )
      )
    )
  );
