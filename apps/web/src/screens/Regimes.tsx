import { useTranslation } from "react-i18next";
import { UTOPIA_TURNS_REQUIRED, policyTrees, utopias } from "@decreto/game-content";
import type { GameState } from "@decreto/shared-types";
import { activeCount, nodeStatus } from "../api/mockApi.js";
import { TopBar } from "../components/TopBar.js";

const REGIMES = ["authoritarianism", "monarchy"];
const treeSize = (id: string) => policyTrees.find((t) => t.id === id)?.nodes.length ?? 0;

export function Regimes({ game, onBack }: { game: GameState; onBack: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="screen">
      <TopBar game={game} title={t("regimes.title")} onBack={onBack} />
      <div className="page">
        <div className="cols2">
          {REGIMES.map((id) => (
            <section key={id} className="panel">
              <div className="row"><h2>{t(`tree.${id}`)}</h2><small className="muted">{t(`regimes.req.${id}`)}</small></div>
              <ol className="stages">
                {policyTrees.find((tr) => tr.id === id)?.nodes.map((n) => (
                  <li key={n} className={nodeStatus(game, n)}>{t(`node.${n}`)}<small>{t(`status.${nodeStatus(game, n)}`)}</small></li>
                ))}
              </ol>
            </section>
          ))}
        </div>
        <div className="row"><h2>{t("regimes.utopias")}</h2><small className="muted">{t("regimes.utopiasHint", { turns: UTOPIA_TURNS_REQUIRED })}</small></div>
        <div className="cols5">
          {utopias.map((u) => (
            <section key={u.id} className="panel">
              <h3>{t(`utopia.${u.id}.name`)}</h3>
              <div className="row muted">
                <span>{t("regimes.complete")}</span>
                <span>{u.trees.filter((r) => activeCount(game, r.treeId) >= (r.upTo ?? treeSize(r.treeId))).length}/{u.trees.length}</span>
              </div>
              {u.trees.map((r) => (
                <div key={r.treeId} className="row">
                  <span>{t(`tree.${r.treeId}`)}{r.upTo ? ` (${t("regimes.upTo", { n: r.upTo })})` : ""}</span>
                  <span>{activeCount(game, r.treeId)}/{r.upTo ?? treeSize(r.treeId)}</span>
                </div>
              ))}
              <div className="spacer" />
              <small className="eyebrow">{t("main.indicators")}</small>
              <p>{t(`utopia.${u.id}.indicators`)}</p>
              <small className="muted">{t("regimes.turnsKept", { n: 0, total: UTOPIA_TURNS_REQUIRED })}</small>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
