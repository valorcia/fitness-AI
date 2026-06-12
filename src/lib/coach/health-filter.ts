/**
 * Last-line safety filter applied to the coach's response BEFORE it reaches
 * the user. Catches the few classes of unsafe statements that would create
 * regulatory or duty-of-care risk:
 *
 *  - Diagnostic language: "tu as / vous avez [pathologie]"
 *  - Drug dosage advice
 *  - Definitive medical conclusions
 *
 * On a hit, we prepend a brief disclaimer so the message remains usable,
 * rather than dropping it entirely (which feels broken to the user).
 *
 * This is intentionally a regex layer, NOT an LLM. It runs on every token
 * stream completion with zero added latency / cost.
 */

const DISCLAIMER =
  "⚠️ Petit rappel : je suis ton coach sport, pas médecin. Ces pistes sont à valider avec un professionnel de santé si tu as un doute.\n\n";

const URGENCY_FOOTER =
  "\n\n🚨 Si la situation est urgente : 15 (SAMU) ou 112. En détresse psychologique : 3114.";

// Diagnostic patterns: present-tense affirmations that the user has a condition.
const DIAGNOSTIC_PATTERNS: RegExp[] = [
  /tu (?:as|fais|souffres? d['e])\s+(?:une? |du |de la )?(?:tendinite|arthrose|hernie|sciatique|cruralgie|fracture|déchirure|claquage|entorse|luxation|dépression|burn[- ]?out|diabète|hypertension|asthme|bronchite|pneumonie|covid|angine|migraine|gastro|colite|reflux)/i,
  /vous (?:avez|faites|souffrez d['e])\s+(?:une? |du |de la )?(?:tendinite|arthrose|hernie|sciatique|cruralgie|fracture|déchirure|claquage|entorse|luxation|dépression|burn[- ]?out|diabète|hypertension|asthme|bronchite|pneumonie|covid|angine|migraine|gastro|colite|reflux)/i,
  /c['e]st (?:probablement|sûrement|forcément|certainement)\s+(?:une? |du |de la )?(?:tendinite|arthrose|hernie|sciatique|fracture|déchirure|claquage|entorse|dépression|burn[- ]?out|diabète|hypertension|asthme|infarctus|AVC)/i,
];

// Dosage / prescription patterns
const PRESCRIPTION_PATTERNS: RegExp[] = [
  /\b(\d+)\s*(?:mg|µg|ug|grammes?|g\b|comprimés?|gélules?|gouttes?)\s+(?:de|d['e])\s+(?:doliprane|paracétamol|ibuprofène|advil|aspirine|cortisone|prednisone|antibiotique|amoxicilline|tramadol|codéine|morphine|valium|xanax|lexomil|melatonine)/i,
  /(?:prends|prenez|tu devrais prendre|il faut prendre)\s+(?:du|de la|un|une|des)\s+(?:doliprane|paracétamol|ibuprofène|advil|aspirine|cortisone|prednisone|antibiotique|amoxicilline|tramadol|codéine|morphine|valium|xanax|lexomil|melatonine)/i,
];

// Urgency triggers — when matched, append emergency numbers
const URGENCY_PATTERNS: RegExp[] = [
  /douleur\s+(?:thoracique|à la poitrine|au cœur|aigu[ëe])/i,
  /(?:perte de connaissance|évanouissement|syncope)/i,
  /(?:saignement|hémorragie)\s+(?:abondant|important|qui ne s'arrête pas)/i,
  /(?:idées?\s+(?:noires?|suicidaires?)|envie de mourir|pulsions?\s+suicidaires?)/i,
  /(?:vomissements?\s+(?:de\s+)?sang|sang dans (?:les\s+)?selles?)/i,
];

export type FilterResult = {
  /** Final text to display to the user. May have a disclaimer prepended. */
  text: string;
  /** True when the original response triggered a safety rewrite. */
  rewrote: boolean;
  /** Set when one of the urgency triggers fired. */
  appendedUrgency: boolean;
};

/**
 * Run all safety filters on a coach response. Cheap, synchronous,
 * stream-friendly (call once on the assembled response).
 */
export function applyHealthFilter(input: string): FilterResult {
  let text = input;
  let rewrote = false;

  for (const p of DIAGNOSTIC_PATTERNS) {
    if (p.test(text)) {
      rewrote = true;
      // Soften: "tu as une tendinite" → "ça pourrait ressembler à une tendinite"
      text = text.replace(p, (m) =>
        m
          .replace(/^tu (?:as|fais|souffres? d['e])\s+/i, "ça pourrait ressembler à ")
          .replace(/^vous (?:avez|faites|souffrez d['e])\s+/i, "ça pourrait ressembler à ")
          .replace(/^c['e]st\s+(?:probablement|sûrement|forcément|certainement)\s+/i, "ça pourrait ressembler à "),
      );
    }
  }

  for (const p of PRESCRIPTION_PATTERNS) {
    if (p.test(text)) {
      rewrote = true;
      text = text.replace(
        p,
        "pour ce qui concerne les médicaments, je préfère que tu en parles avec un pharmacien ou ton médecin",
      );
    }
  }

  let appendedUrgency = false;
  for (const p of URGENCY_PATTERNS) {
    if (p.test(text)) {
      appendedUrgency = true;
      break;
    }
  }

  if (rewrote) text = DISCLAIMER + text;
  if (appendedUrgency) text = text + URGENCY_FOOTER;

  return { text, rewrote, appendedUrgency };
}
