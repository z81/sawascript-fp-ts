import { Token } from "./tokens";
import { contramap, Ord, ordNumber } from "@matechs/core/Ord";

export const or = <C extends Rule[] | [() => Rule]>(
  name: string,
  ...children: C
): OrRule => ({
  type: "OR",
  children,
  priority: 0,
  name,
});

export const and = (name: string, ...children: Rule[]): AndRule => ({
  type: "AND",
  children,
  priority: 0,
  name,
});

export const consume = (token: Token, priority = 0): ConsumeRule => ({
  type: "CONSUME",
  token,
  priority,
  name: "value",
});

export const rule = <N extends string>(
  name: N,
  ...children: Rule[]
): NamedRule => ({
  type: "RULE",
  name,
  children,
  priority: 0,
});

export const chain = (rule: () => Rule) => rule as any;

type BaseRule = {
  priority: number;
  name: string;
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

export type ConsumeRule = BaseRule & {
  type: "CONSUME";
  token: Token;
};

export type Rule = ConsumeRule | AndRule | OrRule | NamedRule;
