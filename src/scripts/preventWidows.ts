export default function preventWidows(text: string): string {
  const words = text.split(" ");
  if (words.length > 1) {
    words[words.length - 2] += "\u00A0" + words.pop();
  }
  return words.join(" ");
}
