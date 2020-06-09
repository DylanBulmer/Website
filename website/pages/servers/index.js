import Head from 'next/head';
import styles from './servers.module.css';
import { Header } from '../../components';

export default function Servers() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Servers | Bulmer Solutions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header title="Servers"/>
      <div className={styles.Servers} />
    </div>
  )
}
