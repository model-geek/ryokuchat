import { css } from "styled-system/css";

/**
 * ログインページです。
 *
 * @remarks
 * Issue #3 以降でログインフォームを実装します。
 */
export default function LoginPage() {
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
        Login
      </h1>
    </main>
  );
}
