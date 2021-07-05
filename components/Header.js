import { css } from "@emotion/react";
import Link from "next/link";
import { Logo } from ".";

const styles = css`
  width: 100%;
  position: relative;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;

  .title {
    font-size: 24px;
  }

  .nav {
    position: absolute;
    right: 0;
    display: inline;
    font-size: 24px;
  }

  .nav a {
    text-decoration: none;
    color: white;
    line-height: 36px;
    font-weight: normal;
  }

  .nav a:hover {
    color: orange;
    font-weight: normal;
  }
`;

function Header(props) {
  return (
    <div css={styles}>
      <Logo.Full />
      <div className="nav">
        <Link href="/">
          <a>Home</a>
        </Link>
        <span> / </span>
        <Link href="/portfolio">
          <a>Portfolio</a>
        </Link>
        <span> / </span>
        <Link href="/blog">
          <a>Blog</a>
        </Link>
        <span> / </span>
        <Link href="/servers">
          <a>Servers</a>
        </Link>
      </div>
      {/* <div className="title">{props.title}</div> */}
    </div>
  );
}

export default Header;
