export const NAME_MAX = 15;

type Seg = { segment: (s: string) => Iterable<{ segment: string }> };
const SegmenterCtor = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: 'grapheme' }) => Seg }).Segmenter;
const segmenter = SegmenterCtor ? new SegmenterCtor(undefined, { granularity: 'grapheme' }) : null;

/** Разбить строку на «символы, как их видит человек» (эмодзи с модификаторами — один символ). */
export const graphemes = (s: string): string[] =>
    segmenter ? Array.from(segmenter.segment(s), (x) => x.segment) : Array.from(s);

export const clampName = (s: string, max = NAME_MAX): string => graphemes(s).slice(0, max).join('');
export const nameLength = (s: string): number => graphemes(s).length;
