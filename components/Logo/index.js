import React from "react";
import styles from "./logo.module.css";

class LogoFull extends React.Component {
  render() {
    return <div className={styles.Logo + " " + styles.Full} />;
  }
}

const Logo = {
  Full: LogoFull,
};

export default Logo;
