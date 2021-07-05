import React from "react";
import Head from "next/head";
import { css } from "@emotion/react";

const styles = css`
  .Home {
    position: absolute;
    width: 100%;
    height: 100vh;
    left: 0px;
    top: 0px;

    /* Image rendering */
    background: linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)),
      url("/image/group-meeting-2.jpg") no-repeat;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: brightness(1) contrast(1.15) saturate(0.9) blur(2px);

    /* To not filter everything on the page... */
    z-index: -100;
  }

  .Home:before {
    position: absolute;
    width: 100%;
    height: 100vh;
    left: 0px;
    top: 0px;
    blur: 10%;
    z-index: 99;
  }

  .box {
    position: absolute;
    width: 450px;
    right: 40px;
    bottom: calc((100% - 75px) / 2);
    transform: translateY(50%);
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(3px);
    border-radius: 8px;
    padding: 40px;
  }
`;

export default function Home() {
  return (
    <div css={styles} className="container">
      <Head>
        <title>Home | Bulmer Solutions</title>
      </Head>
      <div className="box">
        <h3>Welcome!</h3>
      </div>
      <div className="Home" />
    </div>
  );
}
