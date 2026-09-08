import { Link } from 'react-router'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main footer-v2-main">
        <section className="footer-v2-col" aria-label="项目建设单位">
          <h2>建设单位</h2>
          <dl>
            <div><dt>主管单位</dt><dd>北京大学</dd></div>
            <div><dt>主建单位</dt><dd>北京大学计算中心</dd></div>
          </dl>
        </section>

        <section className="footer-v2-col" aria-label="运营与联系信息">
          <h2>运营与联系</h2>
          <dl>
            <div><dt>运营单位</dt><dd>北京大学计算中心</dd></div>
            <div><dt>地址</dt><dd>北京市海淀区颐和园路5号</dd></div>
          </dl>
        </section>

        <section className="footer-v2-col" aria-label="服务支持">
          <h2>服务支持</h2>
          <a href="mailto:noah@pku.edu.cn?subject=问题反馈">问题反馈</a>
          <a href="mailto:noah@pku.edu.cn?subject=权益申诉">权益申诉</a>
        </section>
      </div>

      <div className="site-footer-bottom footer-v2-bottom">
        <div>
          <Link to="/about">关于我们</Link>
          <span aria-hidden="true">·</span>
          <Link to="/about#site-statement">网站声明</Link>
          <span aria-hidden="true">·</span>
          <Link to="/about#privacy">隐私政策</Link>
        </div>
      </div>
    </footer>
  )
}
