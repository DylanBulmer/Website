import styles from './header.module.css';
import { Logo } from '../';

function Header(props) {
  return (
    <div className={styles.Header}>
      <Logo.Full></Logo.Full>
      <div className={styles.nav}>
        <a className={styles.link}>Home</a>
        <span> • </span>
        <a className={styles.link}>Portfolio</a>
        <span> • </span>
        <a className={styles.link}>Blog</a>
        <span> • </span>
        <a className={styles.link}>Servers</a>
      </div>
      <div className={styles.title}>
        {props.title}
      </div>
    </div>
  )
}

export default Header
