import { rule, repeat, and, or, consume, pick } from "./lib/rules";
import { tokens } from "./tokens";

// prettier-ignore
const seq = rule("Seq",
  repeat(
    and(
      pick(or(
        consume(tokens.NAME),
        consume(tokens.SINGLE_QUOTE)
      )),
      consume(tokens.SPACE)
    )
  ),
  consume(tokens.EOL)
)

export const grammar = repeat(seq);
