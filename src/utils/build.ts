export const BUILD = __BUILD_INFO__;

/** Блок «О сборке» виден только во внутреннем тестировании. */
export const showBuildInfo = (b = BUILD) => b.env === 'internal';

export const formatBuildDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
