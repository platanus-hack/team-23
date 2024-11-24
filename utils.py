import re


def inverted_index_to_text_v2(inverted_idx: dict, max_words: int = 200):
    position_term_pairs = []
    for term, positions in inverted_idx.items():
        for position in positions:
            position_term_pairs.append((position, term))

    position_term_pairs.sort()
    reconstructed_string = []
    word_count = 0

    for _, term in position_term_pairs:
        if word_count >= max_words:
            break
        reconstructed_string.append(term)
        word_count += 1

    return " ".join(reconstructed_string)


def extract_tag_content(text, tag_name: str):
    pattern = rf"<{tag_name}>(.*?)</{tag_name}>"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None
