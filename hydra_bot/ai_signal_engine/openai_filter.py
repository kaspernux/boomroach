from transformers import pipeline

def classify_token_description(description):
    classifier = pipeline("ner", model="dslim/bert-base-NER")
    results = classifier(description)
    return results