import { or, consume, rule, chain, Rule } from "./rules";
import { tokens } from "./tokens";

const OPERATORS = or("operators", consume(tokens.PLUS, 1));

const BINARY_EXPRESSION: Rule = rule(
  "BINARY_EXPRESSION",
  or("left", consume(tokens.NUMBER)),
  OPERATORS,
  or(
    "right",
    chain(() => BINARY_EXPRESSION),
    consume(tokens.NUMBER)
  )
);

export const grammar = rule("ROOT", or("body", BINARY_EXPRESSION));
