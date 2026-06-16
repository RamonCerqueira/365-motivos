import motivosData from "./motivos-completos.json";

export type Category = 'h-m' | 'm-h' | 'amor-proprio';

export const motivos = motivosData as Record<Category, string[]>;
