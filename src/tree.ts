import { pipe } from "@matechs/core/Function";
import * as O from "@matechs/core/Option";
import * as A from "@matechs/core/Array";
import * as TR from "@matechs/core/Tree";

export const treeFind: <A>(
  f: (a: A) => boolean
) => (fa: TR.Tree<A>) => O.Option<TR.Tree<A>> = (f) => (fa) =>
  pipe(
    fa.value,
    O.fromPredicate(f),
    O.fold(
      () => pipe(fa.forest, A.findFirstMap(treeFind(f))),
      () => O.some(fa)
    )
  );

export const treeFilter: <A>(
  f: (a: A) => boolean
) => (fa: TR.Tree<A>) => TR.Tree<A> = (f) => (fa) => ({
  value: fa.value,
  forest: pipe(fa.forest, A.filter(TR.fold(f)), A.map(treeFilter(f))),
});
