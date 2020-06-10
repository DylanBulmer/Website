import Link from 'next/link';
import styles from './header.module.css';
import { Logo } from '../';

function Header(props) {
  return (
    <div className={styles.Header}>
      <Logo.Full></Logo.Full>
      <div className={styles.nav}>
        <Link href="/">
          <a className={styles.link}>
            Home
          </a>
        </Link>
        <span> • </span>
        <Link href="/portfolio">
          <a className={styles.link}>
            Portfolio
          </a>
        </Link>
        <span> • </span>
        <Link href="/blog">
          <a className={styles.link}>
            Blog
          </a>
        </Link>
        <span> • </span>
        <Link href="/servers">
          <a className={styles.link}>
            Servers
          </a>
        </Link>
      </div>
      <div className={styles.title}>
        {props.title}
      </div>
    </div>
  )
}

export default Header
