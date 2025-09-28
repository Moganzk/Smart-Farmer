/**
 * Profanity Filter Service
 * A simple service to filter profanity from messages
 */

class ProfanityFilter {
  constructor() {
    // Simple list of profane words to filter
    // In a production system, this would be more extensive and potentially loaded from a database
    this.profaneWords = [
      'ass', 
      'damn', 
      'hell', 
      'fuck', 
      'shit', 
      'bastard',
      'bitch',
      'crap',
      'cunt',
      'dick',
      'piss',
      'slut',
      'whore'
    ];
    
    // Create regex for faster matching
    this.regex = new RegExp('\\b(' + this.profaneWords.join('|') + ')\\b', 'gi');
  }

  /**
   * Check if text contains profanity
   * @param {string} text - Text to check
   * @returns {boolean} True if profanity is found
   */
  hasProfanity(text) {
    if (!text) return false;
    return this.regex.test(text);
  }

  /**
   * Filter profanity from text by replacing with asterisks
   * @param {string} text - Text to filter
   * @returns {string} Filtered text
   */
  filter(text) {
    if (!text) return text;
    
    return text.replace(this.regex, match => {
      return '*'.repeat(match.length);
    });
  }

  /**
   * Add words to the profanity list
   * @param {string[]} words - Words to add
   */
  addWords(words) {
    if (!Array.isArray(words)) return;
    
    this.profaneWords = [...new Set([...this.profaneWords, ...words])];
    this.regex = new RegExp('\\b(' + this.profaneWords.join('|') + ')\\b', 'gi');
  }
}

module.exports = new ProfanityFilter();