"""
Keyword Extraction and Graph Generation
Uses TF-IDF and RAKE for keyword extraction
"""

import re
from collections import Counter, defaultdict
from typing import List, Dict, Tuple
import math


class KeywordExtractor:
    """Extract keywords using TF-IDF and RAKE algorithms"""
    
    def __init__(self, stopwords: set = None):
        """
        Initialize keyword extractor
        
        Args:
            stopwords: Set of stopwords to filter out
        """
        self.stopwords = stopwords or self._default_stopwords()
    
    @staticmethod
    def _default_stopwords() -> set:
        """Default English stopwords"""
        return {
            'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
            'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
            'between', 'both', 'but', 'by', 'can', 'did', 'do', 'does', 'doing', 'down',
            'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
            'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his',
            'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
            'might', 'more', 'most', 'must', 'my', 'myself', 'no', 'nor', 'not', 'now',
            'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves',
            'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
            'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
            'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until',
            'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
            'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your', 'yours',
            'yourself', 'yourselves'
        }
    
    def tokenize(self, text: str) -> List[str]:
        """Tokenize text into words"""
        # Convert to lowercase and extract words
        words = re.findall(r'\b[a-z]+\b', text.lower())
        # Filter stopwords and short words
        return [w for w in words if w not in self.stopwords and len(w) > 2]
    
    def extract_tfidf(self, documents: List[str], top_n: int = 50) -> List[Tuple[str, float]]:
        """
        Extract keywords using TF-IDF
        
        Args:
            documents: List of text documents
            top_n: Number of top keywords to return
        
        Returns:
            List of (keyword, score) tuples
        """
        # Calculate term frequency
        tf = defaultdict(Counter)
        for i, doc in enumerate(documents):
            words = self.tokenize(doc)
            tf[i] = Counter(words)
        
        # Calculate document frequency
        df = Counter()
        for doc_tf in tf.values():
            df.update(doc_tf.keys())
        
        # Calculate TF-IDF
        num_docs = len(documents)
        tfidf_scores = defaultdict(float)
        
        for doc_id, doc_tf in tf.items():
            for term, freq in doc_tf.items():
                # TF-IDF = TF * IDF
                # IDF = log(N / DF)
                tf_score = freq / sum(doc_tf.values())
                idf_score = math.log(num_docs / df[term])
                tfidf_scores[term] += tf_score * idf_score
        
        # Sort by score
        sorted_keywords = sorted(
            tfidf_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return sorted_keywords[:top_n]
    
    def extract_rake(self, text: str, top_n: int = 30) -> List[Tuple[str, float]]:
        """
        Extract keywords using RAKE (Rapid Automatic Keyword Extraction)
        
        Args:
            text: Input text
            top_n: Number of top keywords to return
        
        Returns:
            List of (keyword_phrase, score) tuples
        """
        # Split text into sentences
        sentences = re.split(r'[.!?;\n]', text.lower())
        
        # Extract candidate keywords (sequences of non-stopwords)
        phrase_list = []
        for sentence in sentences:
            words = re.findall(r'\b[a-z]+\b', sentence)
            phrase = []
            for word in words:
                if word not in self.stopwords and len(word) > 2:
                    phrase.append(word)
                else:
                    if phrase:
                        phrase_list.append(' '.join(phrase))
                        phrase = []
            if phrase:
                phrase_list.append(' '.join(phrase))
        
        # Calculate word scores
        word_freq = Counter()
        word_degree = Counter()
        
        for phrase in phrase_list:
            words = phrase.split()
            word_freq.update(words)
            
            # Degree = number of co-occurrences
            for word in words:
                word_degree[word] += len(words) - 1
        
        # Calculate word scores (degree/frequency)
        word_scores = {
            word: (word_degree[word] + word_freq[word]) / word_freq[word]
            for word in word_freq
        }
        
        # Calculate phrase scores
        phrase_scores = {}
        for phrase in set(phrase_list):
            words = phrase.split()
            score = sum(word_scores.get(word, 0) for word in words)
            phrase_scores[phrase] = score
        
        # Sort by score
        sorted_phrases = sorted(
            phrase_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return sorted_phrases[:top_n]


def generate_keyword_clusters(keywords: List[Tuple[str, float]], num_clusters: int = 5) -> Dict:
    """
    Generate keyword clusters
    
    Args:
        keywords: List of (keyword, score) tuples
        num_clusters: Number of clusters to generate
    
    Returns:
        Dictionary with clustered keywords
    """
    # Simple clustering based on score ranges
    if not keywords:
        return {'clusters': []}
    
    # Sort keywords by score
    sorted_keywords = sorted(keywords, key=lambda x: x[1], reverse=True)
    
    # Divide into clusters
    cluster_size = len(sorted_keywords) // num_clusters + 1
    clusters = []
    
    for i in range(num_clusters):
        start = i * cluster_size
        end = min((i + 1) * cluster_size, len(sorted_keywords))
        
        if start < len(sorted_keywords):
            cluster_keywords = sorted_keywords[start:end]
            clusters.append({
                'cluster_id': i + 1,
                'keywords': [{'term': kw, 'weight': score} for kw, score in cluster_keywords]
            })
    
    return {'clusters': clusters}
