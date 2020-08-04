import { Token } from "./tokens";
import { contramap, Ord, ordNumber } from "@matechs/core/Ord";

export enum RuleOutType {
  Branch,
  Node,
}

export const or = <C extends Rule[] | [() => Rule]>(
  outType: RuleOutType,
  name: string,
  children: C
): OrRule => ({
  outType,
  type: "OR",
  children,
  priority: 0,
  name,
});

export const and = (
  outType: RuleOutType,
  name: string,
  children: Rule[]
): AndRule => ({
  type: "AND",
  children,
  priority: 0,
  name,
  outType,
});

export const value = (token: Token, priority = 0): ValueRule => ({
  type: "VALUE",
  token,
  priority,
  name: token.type,
  outType: RuleOutType.Node,
});

export const rule = <N extends string>(
  name: N,
  children: Rule[]
): NamedRule => ({
  type: "RULE",
  name,
  children,
  priority: 0,
  outType: RuleOutType.Node,
});

export const chain = (rule: () => Rule) => rule as any;

type BaseRule = {
  priority: number;
  name: string;
  outType: RuleOutType;
};

export type OrRule = BaseRule & {
  type: "OR";
  children: Rule[] | [() => Rule];
};

export type NamedRule = BaseRule & {
  type: "RULE";
  children: Rule[];
};

export type AndRule = BaseRule & {
  type: "AND";
  children: Rule[];
};

export type ValueRule = BaseRule & {
  type: "VALUE";
  token: Token;
};

export type Rule = ValueRule | AndRule | OrRule | NamedRule;
