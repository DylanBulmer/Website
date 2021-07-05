// import App from 'next/app'
import Head from "next/head";

const styles = css`
  body {
    margin: 0;
    padding: 40px;
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
      </Head>
      <Component {...pageProps} css={styles} />
    </>
  );
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default App;
