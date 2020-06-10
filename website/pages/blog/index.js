import Head from 'next/head';
import styles from './blog.module.css';
import { Header } from '../../components';

export default function Servers() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Blog | Bulmer Solutions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header title="Blog"/>
      <div className={styles.Blog} />
    </div>
  )
}
