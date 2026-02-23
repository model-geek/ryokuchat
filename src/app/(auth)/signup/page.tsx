import { css } from "styled-system/css";

/**
 * サインアップページです。
 *
 * @remarks
 * Issue #3 以降でサインアップフォームを実装します。
 */
export default function SignUpPage() {
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
        Sign Up
      </h1>
    </main>
  );
}
