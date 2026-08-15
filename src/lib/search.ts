import { tours } from '@/data/tours';
import { dubaiExperiences } from '@/data/dubai';
import { holyLandJourneys } from '@/data/holyland';
import { visaCountries } from '@/data/visas';
import { articles } from '@/data/articles';
import { hotels } from '@/data/hotels';

export interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  href: string;
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');
}

/** Tìm kiếm đơn giản trên nhiều nhóm dữ liệu — không dấu, không phân biệt hoa thường. */
export function search(query: string): SearchResult[] {
  const q = norm(query.trim());
  if (!q) return [];

  const results: SearchResult[] = [];
  const match = (...fields: string[]) => fields.some((f) => norm(f).includes(q));

  tours.forEach((t) => {
    if (match(t.title, t.destination, t.summary)) {
      results.push({ type: 'Tour', title: t.title, subtitle: t.destination, href: `/du-lich/${t.slug}` });
    }
  });
  dubaiExperiences.forEach((e) => {
    if (match(e.title, e.category, e.summary)) {
      results.push({ type: 'Dubai', title: e.title, subtitle: e.category, href: `/dubai/${e.slug}` });
    }
  });
  holyLandJourneys.forEach((j) => {
    if (match(j.title, j.theme, j.summary, ...j.countries)) {
      results.push({ type: 'Holy Land', title: j.title, subtitle: j.countries.join(', '), href: `/holy-land/${j.slug}` });
    }
  });
  visaCountries.forEach((v) => {
    if (match(v.country, v.region, v.summary)) {
      results.push({ type: 'Visa', title: `Visa ${v.country}`, subtitle: v.region, href: `/visa/${v.slug}` });
    }
  });
  hotels.forEach((h) => {
    if (match(h.name, h.city, h.country)) {
      results.push({ type: 'Khách sạn', title: h.name, subtitle: `${h.city}, ${h.country}`, href: `/khach-san` });
    }
  });
  articles.forEach((a) => {
    if (match(a.title, a.topic, a.destination, a.excerpt)) {
      results.push({ type: 'Cẩm nang', title: a.title, subtitle: a.topic, href: `/cam-nang/${a.slug}` });
    }
  });

  return results;
}
