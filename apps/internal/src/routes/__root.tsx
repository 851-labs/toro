import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { InternalLayout } from "../screens/internal-chat";
import styles from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    links: [{ href: styles, rel: "stylesheet" }],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1.0", name: "viewport" },
      { title: "Toro Internal" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <InternalLayout>
          <Outlet />
        </InternalLayout>
        <Scripts />
      </body>
    </html>
  );
}
