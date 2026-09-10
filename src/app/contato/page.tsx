import Link from 'next/link';

export default function ContactPage() {
  return <main className="min-h-screen bg-adventure-dark px-6 pb-20 pt-32 text-slate-900"><div className="mx-auto max-w-2xl"><h1 className="text-4xl font-bold">Contato</h1><p className="mt-4 text-slate-700">Fale com a equipe Aventure-se para tirar dúvidas sobre viagens e reservas.</p><div className="mt-8 space-y-4 rounded-2xl border border-neutral-300 bg-white p-6"><a className="block text-blue-600 hover:underline" href="mailto:contato@aventure-se.com.br">contato@aventure-se.com.br</a><a className="block text-blue-600 hover:underline" href="tel:+5521977167373">(21) 97716-7373</a><Link className="inline-block text-blue-600 hover:underline" href="/faq">Veja também as perguntas frequentes</Link></div></div></main>;
}
