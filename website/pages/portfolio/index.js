import Head from 'next/head';
import styles from './portfolio.module.css';
import { Header } from '../../components';

export default function Servers() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Portfolio | Bulmer Solutions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header title="Portfolio"/>
      <div className={styles.Portfolio} />
    </div>
  )
}
