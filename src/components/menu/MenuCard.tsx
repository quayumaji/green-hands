"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Photo } from "@/components/Photo";
import { useCart } from "@/components/cart/CartProvider";
import { dietaryLabelText, money } from "@/lib/format";
import type { MenuItem, SelectedOption } from "@/lib/types";

interface MenuCardProps {
  item: MenuItem;
  /** Whether the API is live; while offline the menu is read-only. */
  orderingEnabled: boolean;
  /** Link the title to /menu/[slug]. Off on the item page itself. */
  linkTitle?: boolean;
}

type Picks = Record<string, string[]>; // groupId -> optionIds

function defaultPicks(item: MenuItem): Picks {
  const picks: Picks = {};
  for (const g of item.optionGroups) {
    // Single-choice required groups preselect the first option so adding stays one tap.
    picks[g.id] = g.required && g.maxSelect === 1 && g.options[0] ? [g.options[0].id] : [];
  }
  return picks;
}

export function MenuCard({ item, orderingEnabled, linkTitle = true }: MenuCardProps) {
  const { addItem } = useCart();
  const [picks, setPicks] = useState<Picks>(() => defaultPicks(item));
  const [error, setError] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const canOrder = orderingEnabled && item.canOrder;

  const selected = useMemo<SelectedOption[]>(() => {
    const out: SelectedOption[] = [];
    for (const g of item.optionGroups) {
      for (const optionId of picks[g.id] ?? []) {
        const o = g.options.find((x) => x.id === optionId);
        if (o) out.push({ groupId: g.id, groupName: g.name, optionId: o.id, optionName: o.name, priceDeltaCents: o.priceDeltaCents });
      }
    }
    return out;
  }, [item.optionGroups, picks]);

  const unitPrice = item.priceCents + selected.reduce((s, o) => s + o.priceDeltaCents, 0);

  function validate(): string {
    for (const g of item.optionGroups) {
      const n = (picks[g.id] ?? []).length;
      const min = g.required ? Math.max(1, g.minSelect) : g.minSelect;
      if (n < min) return `Choose ${min === 1 ? "an option" : `at least ${min} options`} for ${g.name}.`;
      if (n > g.maxSelect) return `Choose at most ${g.maxSelect} for ${g.name}.`;
    }
    return "";
  }

  function add() {
    const problem = validate();
    setError(problem);
    if (problem) return;
    addItem(item, selected);
    setJustAdded(false);
    requestAnimationFrame(() => setJustAdded(true));
  }

  const spicy = item.dietaryLabels.includes("spicy");
  const priceLabel = item.isPriceConfirmed ? money(unitPrice) : "Price to be confirmed";

  return (
    <article className="menu-card" data-menu-item={item.slug} id={`item-${item.slug}`}>
      <Photo className="menu-photo" src={item.imageUrl} alt={item.imageAlt || item.name} ratio="square" fit="contain" sizes="(min-width: 1020px) 33vw, (min-width: 680px) 50vw, 100vw" />
      <div className="menu-card-content">
        <div className="menu-card-top">
          <h3>{linkTitle ? <Link href={`/menu/${item.slug}`}>{item.name}</Link> : item.name}</h3>
          <strong className="menu-price">{priceLabel}</strong>
        </div>
        <p className="menu-description">{item.description}</p>
        {item.dietaryLabels.length ? (
          <div className="diet-tags">
            {item.dietaryLabels.map((label) => (
              <span key={label} className={`diet-tag${label === "spicy" ? " is-spicy" : ""}`}>
                {label === "spicy" ? "🌶 " : ""}
                {dietaryLabelText(label)}
              </span>
            ))}
          </div>
        ) : null}
        {item.optionGroups.length ? (
          <div className="choice-fields">
            {item.optionGroups.map((g) =>
              g.maxSelect === 1 ? (
                <label className="choice-field" key={g.id}>
                  {g.name}
                  {g.required ? "" : " (optional)"}
                  <select
                    value={picks[g.id]?.[0] ?? ""}
                    onChange={(e) => setPicks((p) => ({ ...p, [g.id]: e.target.value ? [e.target.value] : [] }))}
                    aria-label={`${g.name} for ${item.name}`}
                    disabled={!canOrder}
                  >
                    {!g.required ? <option value="">None</option> : null}
                    {g.options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                        {o.priceDeltaCents ? ` (+${money(o.priceDeltaCents)})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <fieldset className="choice-field" key={g.id} style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend style={{ padding: 0 }}>
                    {g.name} (up to {g.maxSelect})
                  </legend>
                  <div className="choice-checks">
                    {g.options.map((o) => {
                      const checked = (picks[g.id] ?? []).includes(o.id);
                      return (
                        <label key={o.id}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!canOrder}
                            onChange={(e) =>
                              setPicks((p) => {
                                const cur = p[g.id] ?? [];
                                return { ...p, [g.id]: e.target.checked ? [...cur, o.id] : cur.filter((x) => x !== o.id) };
                              })
                            }
                          />
                          {o.name}
                          {o.priceDeltaCents ? ` +${money(o.priceDeltaCents)}` : ""}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ),
            )}
          </div>
        ) : null}
        {error ? (
          <p className="form-feedback is-error" role="alert">
            {error}
          </p>
        ) : null}
        {canOrder ? (
          <button className={`button button-green add-button${justAdded ? " added" : ""}`} type="button" onClick={add} onAnimationEnd={() => setJustAdded(false)}>
            Add to bag <span aria-hidden="true">+</span>
          </button>
        ) : (
          <button className="button button-muted add-button" type="button" disabled aria-disabled="true">
            {!orderingEnabled ? "Online ordering paused" : !item.isAvailable ? "Sold out today" : "Price to be confirmed"}
          </button>
        )}
      </div>
    </article>
  );
}
