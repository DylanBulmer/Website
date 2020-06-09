import Head from 'next/head';
import styles from './home.module.css';
import { Header } from '../../components';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header title="Home"/>
      <div className={styles.box}>
        <h3>Welcome!</h3>
        <p>
          During my time in quarantine, I have been working hard to create 
          a new modern feel for Bulmer Solutions' website. Instead of sitting 
          around, binge watch the Office as I know many of us do, I found that this time can be best 
          utilized to reflect on what we know from our experiences so then we can 
          learn new techniques, and gain new experiences in areas that we do not
          feel comfortable in. After some time, I have realized that I am a weak 
          designer, which is what brought me to starting this project and allows me 
          to grow as a developer as I learn new design techniques.
          <br />
          <br />
          As a final note, due to the efforts and my striving nature to acheive better,
        </p>
        <i>"Bulmer solutions is where quality work gets done."</i>
      </div>
      <div className={styles.Home} />
    </div>
  )
}
