export const tokens = {
  SPACE: {
    name: "SPACE",
    regexp: /^( |\t)/
  },
  SINGLE_QUOTE: {
    name: "SINGLE_QUOTE",
    regexp: /^'/
  },
  EOL: {
    name: "EOL",
    regexp: /^\n/
  },
  NAME: {
    name: "NAME",
    regexp: /^[^ ]+/
  }
};
