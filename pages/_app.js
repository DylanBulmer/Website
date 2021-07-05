// import App from 'next/app'
import Head from "next/head";
import { css, Global } from "@emotion/react";
import {Layout} from "@/components";

const styles = css`
  body {
    margin: 0;
    padding: 0;
    background: black;

    /* Font Configuration */
    color: #ffffff;
    font-family: bilo, sans-serif;
    font-style: normal;
    font-weight: lighter;
    font-size: 18px;
    text-shadow: 0px 3px 6px rgba(0, 0, 0, 0.25);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 0;
    font-weight: normal;
  }

  p {
    text-indent: 1em;
    text-align: justify;
  }
`;

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/bmo7sqz.css" />
        <link rel="icon" href="/favicon.ico" />
        <title>Bulmer Solutions</title>
      </Head>
      <Global styles={styles} />
      <Layout>

      <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default App;
