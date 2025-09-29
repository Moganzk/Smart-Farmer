import { 
  FETCH_ADVISORY_CATEGORIES, 
  FETCH_ADVISORY_CONTENT, 
  SEARCH_ADVISORY, 
  FETCH_FEATURED_CONTENT,
  TOGGLE_SAVE_CONTENT
} from '../types';

const initialState = {
  categories: [],
  content: {},
  featuredContent: [],
  savedContent: [],
  searchResults: {
    query: '',
    results: []
  }
};

const advisoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ADVISORY_CATEGORIES:
      return {
        ...state,
        categories: action.payload
      };
    case FETCH_ADVISORY_CONTENT:
      return {
        ...state,
        content: {
          ...state.content,
          [action.payload.categoryId]: action.payload.content
        }
      };
    case SEARCH_ADVISORY:
      return {
        ...state,
        searchResults: {
          query: action.payload.query,
          results: action.payload.results
        }
      };
    case FETCH_FEATURED_CONTENT:
      return {
        ...state,
        featuredContent: action.payload
      };
    case TOGGLE_SAVE_CONTENT: {
      const { contentId, isSaved } = action.payload;
      let updatedSavedContent;

      if (isSaved) {
        // Find the content in content/featuredContent and add to savedContent
        const content = findContentById(state, contentId);
        if (content) {
          updatedSavedContent = [...state.savedContent, content];
        } else {
          updatedSavedContent = state.savedContent;
        }
      } else {
        // Remove from savedContent
        updatedSavedContent = state.savedContent.filter(item => item.id !== contentId);
      }

      return {
        ...state,
        savedContent: updatedSavedContent
      };
    }
    default:
      return state;
  }
};

// Helper function to find content by id across different sources
const findContentById = (state, contentId) => {
  // Check featuredContent
  const featuredItem = state.featuredContent.find(item => item.id === contentId);
  if (featuredItem) return featuredItem;

  // Check content in each category
  for (const categoryId in state.content) {
    if (state.content.hasOwnProperty(categoryId)) {
      const categoryContent = state.content[categoryId];
      const contentItem = categoryContent.find(item => item.id === contentId);
      if (contentItem) return contentItem;
    }
  }

  // Check search results
  const searchItem = state.searchResults.results.find(item => item.id === contentId);
  if (searchItem) return searchItem;

  return null;
};

export default advisoryReducer;