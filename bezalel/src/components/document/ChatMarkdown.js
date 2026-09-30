import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./ChatMarkdown.module.css";

const components = {
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
  table: ({ children }) => <div className={styles.tableScroll}><table>{children}</table></div>,
};

export default function ChatMarkdown({ children }) {
  return (
    <div className={styles.content}>
      <Markdown remarkPlugins={[remarkGfm]} skipHtml components={components}>
        {children ?? ""}
      </Markdown>
    </div>
  );
}
