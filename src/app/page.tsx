import { css } from "styled-system/css";

/**
 * トップページです。
 *
 * @remarks
 * Panda CSS のスタイル適用を検証するための最小ページです。
 */
export default function Home() {
  return (
    <main
      className={css({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      })}
    >
      <h1
        className={css({
          fontSize: "4xl",
          fontWeight: "bold",
        })}
      >
        RyokuChat
      </h1>
    </main>
  );
}
