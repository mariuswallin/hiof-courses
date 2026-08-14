import styles from "./styles.css?url";
import type { DocumentProps } from "rwsdk/router";

/**
 * Global HTML shell. RSC-friendly — no client state lives here.
 */
export function Document({ children, rw }: DocumentProps) {
  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta name="theme-color" content="#6366f1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href={styles} />
        <link rel="modulepreload" href="/src/client.tsx" />
        <title>Kvitter</title>
      </head>
      <body className="antialiased">
        <div id="root">{children}</div>
        <script nonce={rw.nonce}>{`import("/src/client.tsx")`}</script>
      </body>
    </html>
  );
}
