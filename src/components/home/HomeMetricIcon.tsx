export default function HomeMetricIcon({ kind }: { kind: string }) {
  const gradient = `home-metric-${kind}`
  return <svg viewBox="0 0 48 48" aria-hidden="true">
    <defs><linearGradient id={gradient} x1="0" y1="0" x2=".8" y2="1"><stop stopColor={kind === 'blue' ? '#a6d8ff' : '#bb9fff'} /><stop offset="1" stopColor={kind === 'blue' ? '#2862f4' : '#7040ff'} /></linearGradient></defs>
    <g fill={`url(#${gradient})`}>
      {kind === 'violet' && <><path d="m24 5 21 9-21 9L3 14Z"/><path d="m3 22 21 9 21-9v7l-21 9L3 29Z"/><path d="m3 33 21 9 21-9v7l-21 9L3 40Z"/></>}
      {kind === 'blue' && <><path d="M4 12a5 5 0 0 1 5-5h10l6 6h14a5 5 0 0 1 5 5v19a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" opacity=".7"/><path d="M3 20h42l-5 19a4 4 0 0 1-4 3H10a4 4 0 0 1-4-3Z"/></>}
      {kind === 'indigo' && <><rect x="4" y="5" width="40" height="17" rx="5"/><rect x="4" y="27" width="40" height="17" rx="5"/><g fill="white"><circle cx="13" cy="13.5" r="2"/><circle cx="35" cy="13.5" r="2"/><circle cx="13" cy="35.5" r="2"/><circle cx="35" cy="35.5" r="2"/></g></>}
      {kind === 'purple' && <><circle cx="19" cy="13" r="9"/><circle cx="36" cy="16" r="7"/><path d="M2 43v-6a17 17 0 0 1 34 0v6Z"/><path d="M32 27c11-3 16 5 16 15H39v-5c0-4-2-8-7-10Z" opacity=".8"/></>}
    </g>
  </svg>
}
