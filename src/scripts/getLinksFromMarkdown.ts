export default function getLinksFromMarkdown(markdown: string): string[] {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const links: string[] = [];
  let match;

  while ((match = linkRegex.exec(markdown)) !== null) {
    links.push(match[2]);
  }

  return links;
}
