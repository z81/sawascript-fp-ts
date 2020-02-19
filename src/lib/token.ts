export type Token = { name: string; regexp: RegExp };

export type TokenPosition = {
  token: Token;
  value: string;
  position: {
    start: number;
    end: number;
  };
};
