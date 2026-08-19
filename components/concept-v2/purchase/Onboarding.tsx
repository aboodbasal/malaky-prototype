"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  formatBytes,
  saveOnboarding,
  stageDocument,
  type ExecutiveVoiceDraft,
  type OnboardingDraft,
} from "@/lib/concept-v2/adapters";
import {
  APPROVAL_MODELS,
  APPROVAL_NOTE,
  CALENDAR_LINE_ONE,
  CALENDAR_LINE_TWO,
  CALENDAR_MARKET_SIDE,
  CALENDAR_PROMPTS,
  CHANNEL_NOTE,
  CHANNEL_OPTIONS,
  CHANNEL_SCOPED_NOTE,
  FORM_STEPS,
  INDUSTRIES,
  LANGUAGE_OPTIONS,
  MARKET_NOTE,
  MARKET_OPTIONS,
  UPLOAD_HINT,
  UPLOAD_NOTE,
  VOICE_LANGUAGES,
  VOICE_LIMIT_NOTE,
  VOICE_TONES,
} from "@/lib/concept-v2/onboarding-steps";
import { executiveVoiceLimit, getPurchasablePlan } from "@/lib/concept-v2/commerce";
import { readFlow, readSelection, withSelection } from "@/lib/concept-v2/flow-state";
import { track } from "@/lib/concept-v2/analytics";
import { Button } from "../ui";
import { CheckIcon, CloseIcon } from "../icons";
import { FlowHead } from "./FlowChrome";
import { StepRail } from "./StepRail";
import flow from "./flow.module.css";
import styles from "./onboarding.module.css";

const EMPTY_VOICE: ExecutiveVoiceDraft = {
  name: "",
  title: "",
  linkedin: "",
  language: "English",
  tone: "",
  topics: "",
  avoid: "",
  samples: "",
};

const EMPTY_DRAFT: OnboardingDraft = {
  business: { company: "", website: "", industry: "", description: "" },
  brand: { colours: "", products: "", audience: "", personality: "", never: "", documents: [] },
  voices: [EMPTY_VOICE],
  markets: { primary: "", also: [] },
  languages: ["English"],
  channels: [],
  calendar: { dates: "", notes: "" },
  approvals: { model: "all", approver: "" },
};

/**
 * Intelligence Setup, steps 01 to 07.
 *
 * The whole draft lives in one piece of component state and is handed to
 * `saveOnboarding` once, at the end. There is no per-step save, because a
 * per-step save implies a server you can resume from and this repository has
 * neither — see lib/concept-v2/adapters/onboarding, which says what production
 * has to decide.
 *
 * Three things on this screen are true rather than decorative: the executive
 * voice count is capped by the plan that was chosen, the upload zone never
 * reads or sends a file and says so, and the channel step states plainly that
 * choosing a channel is a planning instruction and not a connection.
 */
export function Onboarding() {
  const params = useSearchParams();
  const router = useRouter();
  const selection = readSelection(params);
  const plan = getPurchasablePlan(selection.planId);
  const voiceLimit = executiveVoiceLimit(selection.planId);

  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const uid = useId();

  const step = FORM_STEPS[index];

  /* The company name is already known from checkout; asking for it twice is
     the kind of thing that makes a setup feel like paperwork. */
  useEffect(() => {
    track("onboarding_view", { plan: selection.planId });
    const record = readFlow();
    if (record?.company) {
      setDraft((d) => ({ ...d, business: { ...d.business, company: record.company as string } }));
    }
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Moving between steps replaces the page under the reader; focus follows. */
  useEffect(() => {
    if (index === 0) return;
    window.requestAnimationFrame(() => headingRef.current?.focus());
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [index]);

  /* --- helpers ---------------------------------------------------- */

  const setBusiness = (patch: Partial<OnboardingDraft["business"]>) => {
    setError(null);
    setDraft((d) => ({ ...d, business: { ...d.business, ...patch } }));
  };

  const setBrand = (patch: Partial<OnboardingDraft["brand"]>) => {
    setError(null);
    setDraft((d) => ({ ...d, brand: { ...d.brand, ...patch } }));
  };

  const setVoice = (i: number, patch: Partial<ExecutiveVoiceDraft>) => {
    setError(null);
    setDraft((d) => ({
      ...d,
      voices: d.voices.map((v, n) => (n === i ? { ...v, ...patch } : v)),
    }));
  };

  const addVoice = () =>
    setDraft((d) =>
      d.voices.length >= voiceLimit ? d : { ...d, voices: [...d.voices, EMPTY_VOICE] },
    );

  const removeVoice = (i: number) =>
    setDraft((d) => ({ ...d, voices: d.voices.filter((_, n) => n !== i) }));

  const toggleIn = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const staged = await Promise.all(
      Array.from(files).map((f) => stageDocument({ name: f.name, size: f.size })),
    );
    setDraft((d) => ({
      ...d,
      brand: {
        ...d.brand,
        documents: [
          ...d.brand.documents,
          ...staged.map((s) => `${s.name} · ${formatBytes(s.size)}`),
        ],
      },
    }));
  };

  /* --- validation -------------------------------------------------- */

  /** Light on purpose: only what makes the next step answerable. */
  const problem = (): string | null => {
    if (step.id === "business" && !draft.business.company.trim())
      return "Malaky needs to know which company it is marketing.";
    if (step.id === "markets" && !draft.markets.primary)
      return "Choose the market Malaky should plan against first.";
    if (step.id === "markets" && draft.languages.length === 0)
      return "Choose at least one language.";
    if (step.id === "channels" && draft.channels.length === 0)
      return "Choose at least one channel for Malaky to prepare work for.";
    return null;
  };

  const back = () => {
    setError(null);
    if (index === 0) return;
    setIndex(index - 1);
  };

  const next = async () => {
    const found = problem();
    if (found) {
      setError(found);
      return;
    }
    setError(null);
    track("onboarding_step_completed", { step: step.id, num: step.num });

    if (index < FORM_STEPS.length - 1) {
      setIndex(index + 1);
      return;
    }

    setSaving(true);
    track("onboarding_submitted", { plan: selection.planId });
    await saveOnboarding(draft);
    router.push(withSelection("/concept-v2/onboarding/schedule", selection));
  };

  /* --- steps -------------------------------------------------------- */

  const field = (
    name: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts: {
      wide?: boolean;
      optional?: boolean;
      placeholder?: string;
      textarea?: boolean;
      hint?: string;
    } = {},
  ) => {
    const id = `${uid}-${name}`;
    return (
      <p className={`${flow.field} ${opts.wide ? flow.fieldWide : ""}`}>
        <span className={flow.labelRow}>
          <label className={flow.label} htmlFor={id}>
            {label}
          </label>
          {opts.optional && <span className={flow.optional}>Optional</span>}
        </span>
        {opts.textarea ? (
          <textarea
            id={id}
            className={`${flow.input} ${flow.textarea}`}
            rows={3}
            placeholder={opts.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            id={id}
            className={flow.input}
            placeholder={opts.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
        {opts.hint && <span className={flow.fieldHint}>{opts.hint}</span>}
      </p>
    );
  };

  const body = () => {
    switch (step.id) {
      /* --- 01 business --- */
      case "business":
        return (
          <div className={flow.fields}>
            {field("company", "Company name", draft.business.company, (v) =>
              setBusiness({ company: v }),
            )}
            {field(
              "website",
              "Website",
              draft.business.website,
              (v) => setBusiness({ website: v }),
              { placeholder: "yourcompany.com" },
            )}
            <p className={flow.field}>
              <label className={flow.label} htmlFor={`${uid}-industry`}>
                Industry
              </label>
              <select
                id={`${uid}-industry`}
                className={`${flow.input} ${flow.select}`}
                value={draft.business.industry}
                onChange={(e) => setBusiness({ industry: e.target.value })}
              >
                <option value="">Select an industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </p>
            {field(
              "description",
              "What does the business do?",
              draft.business.description,
              (v) => setBusiness({ description: v }),
              {
                wide: true,
                textarea: true,
                placeholder: "In your own words, as you would explain it to a new customer.",
              },
            )}
          </div>
        );

      /* --- 02 brand --- */
      case "brand":
        return (
          <>
            <div className={flow.fields}>
              {field("products", "Products and services", draft.brand.products, (v) =>
                setBrand({ products: v }),
              )}
              {field("audience", "Who you are selling to", draft.brand.audience, (v) =>
                setBrand({ audience: v }),
              )}
              {field(
                "personality",
                "How your brand should sound",
                draft.brand.personality,
                (v) => setBrand({ personality: v }),
                { placeholder: "Confident, plain-spoken, never salesy" },
              )}
              {field("colours", "Brand colours", draft.brand.colours, (v) =>
                setBrand({ colours: v }),
              )}
              {field(
                "never",
                "Anything Malaky must never say",
                draft.brand.never,
                (v) => setBrand({ never: v }),
                {
                  wide: true,
                  textarea: true,
                  placeholder: "Claims you cannot make, competitors you do not name, words you avoid.",
                },
              )}
            </div>

            <div className={styles.group}>
              <p className={styles.groupLabel}>Brand documents</p>
              <div
                className={styles.drop}
                data-over={dragging || undefined}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  void addFiles(e.dataTransfer.files);
                }}
              >
                <input
                  type="file"
                  id={`${uid}-files`}
                  className={styles.fileInput}
                  multiple
                  onChange={(e) => {
                    void addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <label htmlFor={`${uid}-files`} className={styles.dropTitle}>
                  Choose files, or drop them here
                </label>
                <span className={styles.dropHint}>{UPLOAD_HINT}</span>
                <span className={styles.dropNote}>{UPLOAD_NOTE}</span>
              </div>

              {draft.brand.documents.length > 0 && (
                <ul className={styles.files}>
                  {draft.brand.documents.map((doc, i) => (
                    <li key={`${doc}-${i}`} className={styles.file}>
                      <span>{doc.split(" · ")[0]}</span>
                      <span className={styles.fileMeta}>
                        {doc.split(" · ")[1]}
                        <button
                          type="button"
                          className={styles.fileRemove}
                          aria-label={`Remove ${doc.split(" · ")[0]}`}
                          onClick={() =>
                            setDraft((d) => ({
                              ...d,
                              brand: {
                                ...d.brand,
                                documents: d.brand.documents.filter((_, n) => n !== i),
                              },
                            }))
                          }
                        >
                          <CloseIcon size={14} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        );

      /* --- 03 voices --- */
      case "voices":
        return (
          <>
            <p className={styles.voiceLimit}>
              <span>
                {plan.name} covers{" "}
                {voiceLimit === 1 ? "one executive voice" : `up to ${voiceLimit} executive voices`}.
              </span>
              <span>{VOICE_LIMIT_NOTE}</span>
            </p>

            {draft.voices.map((voice, i) => (
              <div key={i} className={styles.voice}>
                <div className={styles.voiceHead}>
                  <p className={styles.voiceTitle}>Voice {String(i + 1).padStart(2, "0")}</p>
                  {draft.voices.length > 1 && (
                    <button
                      type="button"
                      className={styles.voiceRemove}
                      onClick={() => removeVoice(i)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={flow.fields}>
                  <p className={flow.field}>
                    <label className={flow.label} htmlFor={`${uid}-v${i}-name`}>
                      Name
                    </label>
                    <input
                      id={`${uid}-v${i}-name`}
                      className={flow.input}
                      value={voice.name}
                      onChange={(e) => setVoice(i, { name: e.target.value })}
                    />
                  </p>
                  <p className={flow.field}>
                    <label className={flow.label} htmlFor={`${uid}-v${i}-title`}>
                      Title
                    </label>
                    <input
                      id={`${uid}-v${i}-title`}
                      className={flow.input}
                      value={voice.title}
                      onChange={(e) => setVoice(i, { title: e.target.value })}
                    />
                  </p>
                  <p className={flow.field}>
                    <label className={flow.label} htmlFor={`${uid}-v${i}-lang`}>
                      Publishes in
                    </label>
                    <select
                      id={`${uid}-v${i}-lang`}
                      className={`${flow.input} ${flow.select}`}
                      value={voice.language}
                      onChange={(e) => setVoice(i, { language: e.target.value })}
                    >
                      {VOICE_LANGUAGES.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </p>
                  <p className={flow.field}>
                    <label className={flow.label} htmlFor={`${uid}-v${i}-tone`}>
                      How they sound
                    </label>
                    <select
                      id={`${uid}-v${i}-tone`}
                      className={`${flow.input} ${flow.select}`}
                      value={voice.tone}
                      onChange={(e) => setVoice(i, { tone: e.target.value })}
                    >
                      <option value="">Select a tone</option>
                      {VOICE_TONES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </p>
                  <p className={`${flow.field} ${flow.fieldWide}`}>
                    <span className={flow.labelRow}>
                      <label className={flow.label} htmlFor={`${uid}-v${i}-topics`}>
                        What they should be known for
                      </label>
                      <span className={flow.optional}>Optional</span>
                    </span>
                    <textarea
                      id={`${uid}-v${i}-topics`}
                      className={`${flow.input} ${flow.textarea}`}
                      rows={2}
                      value={voice.topics}
                      onChange={(e) => setVoice(i, { topics: e.target.value })}
                    />
                  </p>
                </div>
              </div>
            ))}

            {draft.voices.length < voiceLimit && (
              <Button tone="secondary" onClick={addVoice} className={styles.addVoice}>
                Add another voice
              </Button>
            )}
          </>
        );

      /* --- 04 markets --- */
      case "markets":
        return (
          <>
            <div className={styles.group}>
              <p className={flow.field}>
                <label className={flow.label} htmlFor={`${uid}-primary`}>
                  Primary market
                </label>
                <select
                  id={`${uid}-primary`}
                  className={`${flow.input} ${flow.select}`}
                  value={draft.markets.primary}
                  onChange={(e) => {
                    setError(null);
                    setDraft((d) => ({ ...d, markets: { ...d.markets, primary: e.target.value } }));
                  }}
                >
                  <option value="">Select a market</option>
                  {MARKET_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <span className={flow.fieldHint}>{MARKET_NOTE}</span>
              </p>
            </div>

            <fieldset className={styles.group}>
              <legend className={styles.groupLabel}>Also operating in</legend>
              <div className={flow.chips}>
                {MARKET_OPTIONS.filter((m) => m.id !== draft.markets.primary).map((m) => {
                  const on = draft.markets.also.includes(m.id);
                  return (
                    <label key={m.id} className={flow.chip} data-on={on || undefined}>
                      <input
                        type="checkbox"
                        className={flow.chipInput}
                        checked={on}
                        onChange={() =>
                          setDraft((d) => ({
                            ...d,
                            markets: { ...d.markets, also: toggleIn(d.markets.also, m.id) },
                          }))
                        }
                      />
                      <CheckIcon size={12} className={flow.chipCheck} aria-hidden="true" />
                      {m.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className={styles.group}>
              <legend className={styles.groupLabel}>Languages</legend>
              <div className={flow.chips}>
                {LANGUAGE_OPTIONS.map((l) => {
                  const on = draft.languages.includes(l);
                  return (
                    <label key={l} className={flow.chip} data-on={on || undefined}>
                      <input
                        type="checkbox"
                        className={flow.chipInput}
                        checked={on}
                        onChange={() => {
                          setError(null);
                          setDraft((d) => ({ ...d, languages: toggleIn(d.languages, l) }));
                        }}
                      />
                      <CheckIcon size={12} className={flow.chipCheck} aria-hidden="true" />
                      {l}
                    </label>
                  );
                })}
              </div>
              <p className={flow.fieldHint}>
                Each language is composed natively rather than translated.
              </p>
            </fieldset>
          </>
        );

      /* --- 05 channels --- */
      case "channels":
        return (
          <>
            <fieldset className={styles.channels}>
              <legend className="visually-hidden">Channels</legend>
              {CHANNEL_OPTIONS.map((channel) => {
                const on = draft.channels.includes(channel.id);
                const id = `${uid}-ch-${channel.id}`;
                return (
                  <label key={channel.id} className={styles.channel} data-on={on || undefined}>
                    <input
                      type="checkbox"
                      id={id}
                      className={styles.control}
                      checked={on}
                      onChange={() => {
                        setError(null);
                        setDraft((d) => ({ ...d, channels: toggleIn(d.channels, channel.id) }));
                      }}
                    />
                    <span className={styles.channelBox} aria-hidden="true">
                      <CheckIcon size={11} />
                    </span>
                    <span className={styles.channelLabel}>{channel.label}</span>
                    <span className={styles.channelDetail}>{channel.detail}</span>
                    {channel.state === "scoped" && (
                      <span className={styles.scopedTag}>Where scoped</span>
                    )}
                  </label>
                );
              })}
            </fieldset>

            <p className={styles.truth}>{CHANNEL_NOTE}</p>
            <p className={flow.fieldHint}>{CHANNEL_SCOPED_NOTE}</p>
          </>
        );

      /* --- 06 calendar --- */
      case "calendar":
        return (
          <div className={styles.calendarSplit}>
            <div className={styles.group}>
              <p className={styles.calendarLines}>
                <span className={styles.calendarYou}>{CALENDAR_LINE_ONE}</span>
                <span className={styles.calendarUs}>{CALENDAR_LINE_TWO}</span>
              </p>

              <ul className={styles.prompts}>
                {CALENDAR_PROMPTS.map((p) => (
                  <li key={p}>
                    <span className={styles.dot} aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>

              <div className={flow.fields}>
                {field(
                  "dates",
                  "What is coming",
                  draft.calendar.dates,
                  (v) => setDraft((d) => ({ ...d, calendar: { ...d.calendar, dates: v } })),
                  {
                    wide: true,
                    textarea: true,
                    placeholder:
                      "Store opening in October. New product line before Ramadan. Trade show in March.",
                  },
                )}
                {field(
                  "notes",
                  "Anything Malaky should plan around",
                  draft.calendar.notes,
                  (v) => setDraft((d) => ({ ...d, calendar: { ...d.calendar, notes: v } })),
                  { wide: true, textarea: true, optional: true },
                )}
              </div>
            </div>

            <div className={flow.panel}>
              <p className={flow.sectionLabel}>Malaky already watches</p>
              <ul className={`${styles.prompts} ${styles.panelList}`}>
                {CALENDAR_MARKET_SIDE.map((item) => (
                  <li key={item}>
                    <span className={`${styles.dot} ${styles.dotGold}`} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className={flow.panelLead}>
                Verified against official sources for each market you operate in.
              </p>
            </div>
          </div>
        );

      /* --- 07 approvals --- */
      case "approval":
        return (
          <>
            <fieldset className={styles.models}>
              <legend className="visually-hidden">Approval model</legend>
              {APPROVAL_MODELS.map((model) => {
                const on = draft.approvals.model === model.id;
                return (
                  <label key={model.id} className={styles.model} data-on={on || undefined}>
                    <input
                      type="radio"
                      name="approval"
                      className={styles.control}
                      checked={on}
                      onChange={() =>
                        setDraft((d) => ({
                          ...d,
                          approvals: { ...d.approvals, model: model.id },
                        }))
                      }
                    />
                    <span className={styles.modelDot} aria-hidden="true" />
                    <span className={styles.modelLabel}>{model.label}</span>
                    <span className={styles.modelDetail}>{model.detail}</span>
                  </label>
                );
              })}
            </fieldset>

            <div className={flow.fields}>
              {field(
                "approver",
                "Who approves marketing",
                draft.approvals.approver,
                (v) =>
                  setDraft((d) => ({ ...d, approvals: { ...d.approvals, approver: v } })),
                { hint: "Name and role. You can add more people once setup is complete." },
              )}
            </div>

            <p className={styles.truth}>{APPROVAL_NOTE}</p>
          </>
        );

      default:
        return null;
    }
  };

  const last = index === FORM_STEPS.length - 1;

  return (
    <>
      <FlowHead
        eyebrow="Intelligence Setup"
        title="Teach Malaky your business"
        lead="Everything below becomes the context Malaky operates from. You can change any of it with us later."
      />

      <section className={flow.body} aria-labelledby="setup-title">
        <div className={`shell ${styles.layout}`}>
          <StepRail currentIndex={index} onJump={setIndex} />

          <div className={styles.step}>
            <div className={styles.stepHead}>
              <p className={styles.stepEyebrow}>
                <span className={styles.stepNum}>{step.num}</span>
                Step {index + 1} of {FORM_STEPS.length + 1}
              </p>
              <h2 className={styles.stepTitle} id="setup-title" ref={headingRef} tabIndex={-1}>
                {step.title}
              </h2>
              <p className={styles.stepLead}>{step.purpose}</p>
            </div>

            <div className={styles.stepBody}>{body()}</div>

            <p className={flow.submitError} role="alert" hidden={!error}>
              {error}
            </p>

            <div className={styles.nav}>
              <div className={styles.navLeft}>
                {index > 0 && (
                  <Button tone="ghost" onClick={back}>
                    Back
                  </Button>
                )}
                <span className={styles.progress}>
                  {index + 1} / {FORM_STEPS.length + 1}
                </span>
              </div>
              <Button tone="primary" size="lg" arrow onClick={next} disabled={saving}>
                {saving ? "Saving…" : last ? "Continue to your walkthrough" : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
