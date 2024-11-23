import re


def inverted_index_to_text(inverted_idx: dict):
    position_term_pairs = []
    for term, positions in inverted_idx.items():
        for position in positions:
            position_term_pairs.append((position, term))

    position_term_pairs.sort()
    reconstructed_string = []

    for _, term in position_term_pairs:
        reconstructed_string.append(term)

    return ' '.join(reconstructed_string)


def get_first_n_words(text: str, n: int = 300) -> str:
    words = text.split()
    first_200_words = words[:n]
    return ' '.join(first_200_words)


def extract_tag_content(text, tag_name: str):
    pattern = rf"<{tag_name}>(.*?)</{tag_name}>"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None
