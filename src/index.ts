import * as T from "@matechs/core/Effect";
import { Do } from "@matechs/core/Do";
import { exit as E } from "@matechs/core";
import { tokenize } from "./tokenize";
import { parseCst } from "./cst";
import { Env, env } from "./environment";
import { parseAst } from "./ast";
import { pipe } from "@matechs/core/Function";

const readSources = T.pure("20 + 2 + 2");

const program: T.AsyncRE<Env, void, any> = Do(T.effect)
  .bind("code", readSources)
  .bindL("tokens", ({ code }) => tokenize(code))
  .bindL("cst", ({ tokens }) => parseCst(tokens))
  .bindL("ast", ({ cst }) => parseAst(cst))
  .done();

const exitFold = E.fold(
  (a) => console.log("Result", JSON.stringify(a, null, "  ")),
  (e) => console.error(e),
  (e) => console.error("Abort", e),
  () => console.error("Interrupt")
);

pipe(program, T.provide(env), T.run)(exitFold);
