// =====================================================
// AVENTURE-SE — Utility Functions
// =====================================================

/**
 * Formata valor em Reais (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata data no padrão brasileiro dd/mm/aaaa
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '--';
  const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T12:00:00` : dateStr;
  const date = new Date(normalizedDate);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formata data por extenso: "29 de dezembro"
 */
export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/**
 * Formata intervalo de datas: "29 Dez - 03 Jan"
 */
export function formatDateRange(startDate?: string | null, endDate?: string | null): string {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
  const startStr = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(start);
  const endStr = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(end);
  return `${startStr} - ${endStr}`;
}

/**
 * Calcula número de dias/noites entre duas datas
 */
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function calculateNights(startDate: string, endDate: string): number {
  return calculateDays(startDate, endDate) - 1;
}

/**
 * Calcula vagas restantes
 */
export function getRemainingSpots(capacity: number, booked: number): number {
  return Math.max(0, capacity - booked);
}

/**
 * Retorna badge de escassez baseado nas vagas
 */
export function getScarcityBadge(capacity: number, booked: number): { text: string; variant: 'danger' | 'warning' | 'success' | 'sold_out' } | null {
  const remaining = getRemainingSpots(capacity, booked);
  const percentage = (booked / capacity) * 100;

  if (remaining === 0) return { text: 'Esgotado', variant: 'sold_out' };
  if (remaining <= 3) return { text: `Últimas ${remaining} vagas!`, variant: 'danger' };
  if (percentage >= 70) return { text: `${remaining} vagas restantes`, variant: 'warning' };
  return { text: 'Vagas disponíveis', variant: 'success' };
}

/**
 * Gera código único de reserva
 */
export function generateBookingCode(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `AVT-${year}-${random}`;
}

/**
 * Mapeia tipo de acomodação para label amigável
 */
export function getAccommodationIcon(type: string): string {
  switch (type) {
    case 'camping': return '⛺';
    case 'hostel': return '🏨';
    case 'pousada': return '🏠';
    case 'suite': return '👑';
    default: return '🏕️';
  }
}

/**
 * Retorna cor do badge de dificuldade
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'leve': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'moderado': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'intenso': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case 'extremo': return 'bg-red-500/20 text-red-300 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
}

/**
 * Retorna cor do badge de status de pagamento
 */
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'confirmed': return 'bg-blue-500/20 text-blue-400';
    case 'pending': return 'bg-amber-500/20 text-amber-400';
    case 'cancelled': return 'bg-red-500/20 text-red-400';
    case 'refunded': return 'bg-blue-500/20 text-blue-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
}

export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'confirmed': return 'Confirmado';
    case 'pending': return 'Pendente';
    case 'cancelled': return 'Cancelado';
    case 'refunded': return 'Reembolsado';
    default: return status;
  }
}

/**
 * Classname merge helper (simple implementation)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Slugify text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}
