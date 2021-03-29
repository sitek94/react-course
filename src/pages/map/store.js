import { createStore, createHook, defaults } from 'react-sweet-state'
import { produce } from 'immer'

defaults.devtools = true
defaults.mutator = (currentState, producer) => produce(currentState, producer)

const Store = createStore({
  initialState: {
    markers: [],
    isGoogleApiLoaded: false,
    isModalVisible: false,
    currentArticle: {
      title: '',
      url: '',
      pageid: '',
      isSaved: false,
    },
    isSidebarVisible: false,
  },
  actions: {
    // Markers
    addMarkers: markers => ({ setState, getState }) => {
      const state = getState()
      const existingMarkersIds = state.markers.map(marker => marker.pageid)
      const newMarkers = markers.filter(
        marker => !existingMarkersIds.includes(marker.pageid),
      )

      setState(draft => {
        draft.markers.push(...newMarkers)
      })
    },
    setSavedArticlesIds: ids => ({ setState, getState }) => {
      setState(draft => {
        draft.savedArticlesIds = ids
      })
    },

    // Google API
    setIsGoogleApiLoaded: isLoaded => ({ setState }) => {
      setState(draft => {
        draft.isGoogleApiLoaded = isLoaded
      })
    },

    // Current article
    setIsModalVisible: isVisible => ({ setState }) => {
      setState(draft => {
        draft.isModalVisible = isVisible
      })
    },
    setCurrentArticle: ({ pageid, title, url, isSaved }) => ({ setState }) => {
      setState(draft => {
        draft.currentArticle = {
          pageid,
          title,
          url,
          isSaved,
        }
      })
    },
    toggleCurrentArticle: () => ({ setState, getState }) => {
      const { isSaved } = getState().currentArticle
      setState(draft => {
        draft.currentArticle.isSaved = !isSaved
      })
    },

    // Sidebar
    setIsSidebarVisible: isVisible => ({ setState }) => {
      setState(draft => {
        draft.isSidebarVisible = isVisible
      })
    },
  },
})

export const useMapStore = createHook(Store)
