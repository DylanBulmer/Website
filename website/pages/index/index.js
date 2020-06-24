import Head from 'next/head';
import styles from './home.module.css';
import { Header } from '../../components';
import img from './group-writing.jpg'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Home | Bulmer Solutions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header title="Home"/>
      <div className={styles.box}>
        <h3>Welcome!</h3>
        <p>
          During my time in quarantine, I have decided to work
          hard instead of sitting around, binge watching the Office
          as I know many of us do. I found that this time can be
          best utilized to reflect on the knowledge we currently 
          have and find areas where we can improve. 
          After some time, I have realized that I am a weak 
          designer. I have taken this and started to learn new 
          design techniques so I can grow as a developer. Although 
          this may be a tough time, we still have the opportunity 
          to grow and show that we are resilient.
        </p>
        <p>
          Here at Bulmer Solutions, showing resilience and prevaling is how quality work gets done.
        </p>
      </div>
      <div className={styles.Home} />
    </div>
  )
}
