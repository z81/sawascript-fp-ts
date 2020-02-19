import { Token } from "./token";

export type ConsumeRule = {
  type: "CONSUME";
  token: Token;
};

export type ConstructRule = {
  name?: string;
  type: "AND" | "OR" | "REPEAT" | "RULE";
  children: Rule[];
};

export type Rule = ConstructRule | ConsumeRule & {
  pick?: boolean;
};

export const and = (...children: Rule[]) => ({
  type: "AND" as const,
  children
});

export const or = (...children: Rule[]) => ({ type: "OR" as const, children });

export const repeat = (...children: Rule[]) => ({
  type: "REPEAT" as const,
  children
});

export const rule = (name: string, ...children: Rule[]) => ({
  name,
  type: "RULE" as const,
  children
});

export const consume = (token: Token) => ({
  type: "CONSUME" as const,
  token
});

export const pick = (rule: Rule) => ({
  ...rule,
  pick: true
});