import { or, value, rule, chain, Rule, RuleOutType } from "./rules";
import { tokens } from "./tokens";

const OPERATORS = or(RuleOutType.Branch, "operator", [
  value(tokens.PLUS, 1),
  value(tokens.MUL, 2),
]);

const BINARY_EXPRESSION: Rule = rule("BINARY_EXPRESSION", [
  or(RuleOutType.Branch, "left", [value(tokens.NUMBER)]),
  OPERATORS,
  or(RuleOutType.Branch, "right", [
    chain(() => BINARY_EXPRESSION),
    value(tokens.NUMBER),
  ]),
]);

export const grammar = rule("ROOT", [
  or(RuleOutType.Branch, "body", [BINARY_EXPRESSION]),
]);
