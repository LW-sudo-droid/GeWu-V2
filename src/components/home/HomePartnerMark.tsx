/** Small vector wordmark symbols replace the old building-photo placeholders. */
export default function HomePartnerMark({ name, logo }: { name: string; logo?: string }) {
  if (name === '华为') return <svg className="home-partner-symbol" viewBox="0 0 48 48" aria-hidden="true">
    <g fill="#ed001c">{[-72,-48,-24,0,24,48,72].map(angle => <ellipse key={angle} cx="24" cy="13" rx="4.5" ry="12" transform={`rotate(${angle} 24 31)`} />)}<path d="M5 32h38L24 44Z" /></g>
  </svg>
  if (name === '万方数据') return <svg className="home-partner-symbol" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="#f52a42" strokeWidth="4"><path d="M8 6h31v35H8Z"/><path d="M18 6v35M18 18h21M18 31h21"/></g></svg>
  if (name === '蚂蚁集团') return <svg className="home-partner-symbol" viewBox="0 0 48 48" aria-hidden="true"><g fill="#659fff"><ellipse cx="25" cy="30" rx="17" ry="14"/><circle cx="22" cy="14" r="9"/><path d="m14 8-5-6 4-2 5 8M28 7l4-7 4 2-4 8"/></g><ellipse cx="25" cy="29" rx="8" ry="10" fill="#fff"/><circle cx="20" cy="13" r="2" fill="#fff"/></svg>
  if (name === '字节跳动') return <svg className="home-partner-symbol" viewBox="0 0 48 48" aria-hidden="true"><g fill="#398cff"><path d="M5 22h7v21H5ZM16 13h7v30h-7ZM27 5h7v38h-7ZM38 16h7v27h-7Z"/></g></svg>
  if (name === '中国联通') return <svg className="home-partner-symbol" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="#e94c73" strokeWidth="4.5" strokeLinejoin="round"><path d="m24 5 9 9-9 10-9-10ZM24 24l9 10-9 9-9-9ZM5 24l9-9 10 9-10 9ZM24 24l10-9 9 9-9 9Z"/></g></svg>
  if (name === '京能集团') return <svg className="home-partner-symbol" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3 44 39H4Z" fill="#4c81d1"/><path d="m24 15 11 19H13Z" fill="#fff"/></svg>
  if (name === '鹏城实验室') return <svg className="home-partner-symbol" viewBox="0 0 48 48" aria-hidden="true"><path d="M5 38V9h38v29ZM12 15v17h7V15Zm15 0v17h9V15Z" fill="#548db6"/></svg>
  return logo ? <img src={logo} alt="" /> : <i aria-hidden="true">{name.slice(0,2)}</i>
}
