const questions = [
  ['Como faço uma reserva?', 'Escolha uma viagem, selecione hospedagem e transporte e avance pelo checkout.'],
  ['Posso cancelar minha reserva?', 'Entre em contato com a equipe para consultar as regras e prazos da sua reserva.'],
  ['Como funciona o pagamento?', 'O checkout apresenta as formas de pagamento disponíveis para cada experiência.'],
];

export default function FaqPage() {
  return <main className="min-h-screen bg-adventure-dark px-6 pb-20 pt-32 text-slate-900"><div className="mx-auto max-w-3xl"><h1 className="text-4xl font-bold">Perguntas frequentes</h1><div className="mt-8 space-y-4">{questions.map(([question, answer]) => <section key={question} className="rounded-2xl border border-neutral-300 bg-white p-6"><h2 className="text-lg font-semibold">{question}</h2><p className="mt-2 text-slate-700">{answer}</p></section>)}</div></div></main>;
}
