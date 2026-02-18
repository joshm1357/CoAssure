import SessionClient from './SessionClient';

export function generateStaticParams() {
  return [
    { type: 'pre-start' },
    { type: 'toolbox-talk' },
    { type: 'form-assist' },
    { type: 'report' },
    { type: 'reflection' },
  ];
}

export default async function SessionPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return <SessionClient type={type} />;
}
