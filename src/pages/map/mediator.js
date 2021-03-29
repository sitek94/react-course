import wikipedia from 'services/api/wikipedia'
import ArticlesDatabase from 'services/articles-database'
import { useMapStore } from './store'

const defaultMarkerColor = 'primary'
const savedMarkerColor = 'secondary'

const listeners = {}
let map

function attachListener(eventName, listener) {
  listeners[eventName] = listener
}

function emit(eventName, ...args) {
  const listener = listeners[eventName]

  if (!listener) {
    throw new Error(`There is no listener for "${eventName}" event.`)
  }

  listener(...args)
}

/**
 * Maps Wikipedia articles to markers
 */
function mapArticlesToMarkers(articles) {
  return articles.map(({ pageid, lat, lon, title }) => ({
    pageid,
    lat,
    lng: lon,
    title,
  }))
}

/**
 * Adds `color` prop to a marker. The color depends on whether the article that
 * marker points at is saved or not.
 */
function addColorToMarkers(markers) {
  return markers.map(marker => ({
    ...marker,
    color: ArticlesDatabase.isArticleSaved(marker.pageid)
      ? savedMarkerColor
      : defaultMarkerColor,
  }))
}

function useMapMediator() {
  const [
    { markers, currentArticle },
    {
      addMarkers,
      setIsGoogleApiLoaded,
      setIsModalVisible,
      setCurrentArticle,
      toggleCurrentArticle,
      setSavedArticles,
    },
  ] = useMapStore()

  async function onMapDragged(event) {
    const response = await wikipedia.getArticles({ coord: event.center })
    const articles = response.query.geosearch
    const markers = mapArticlesToMarkers(articles)
    const markersWithColor = addColorToMarkers(markers)

    addMarkers(markersWithColor)
  }

  function onGoogleApiLoaded({ map: mapInstance }) {
    map = mapInstance

    setIsGoogleApiLoaded(true)
  }

  function onSearchBoxPlaceClicked({ coords }) {
    if (map) {
      map.setCenter(coords)
    }
  }

  async function onMarkerClicked({ pageid }) {
    const response = await wikipedia.getArticleInfo({ pageid })
    const article = Object.values(response.query.pages)[0]

    setIsModalVisible(true)
    setCurrentArticle({
      title: article.title,
      url: article.fullurl,
      pageid,
      isSaved: ArticlesDatabase.isArticleSaved(pageid),
    })
  }

  async function onModalHeartClicked() {
    const { pageid, title } = currentArticle
    const { lat, lng } = markers.find(m => m.pageid === pageid)

    ArticlesDatabase.toggleArticle({ pageid, title, lat, lng })
    toggleCurrentArticle()

    setSavedArticles(ArticlesDatabase.getArticles())
  }

  attachListener('mapDragged', onMapDragged)
  attachListener('googleApiLoaded', onGoogleApiLoaded)
  attachListener('searchBoxPlaceClicked', onSearchBoxPlaceClicked)
  attachListener('markerClicked', onMarkerClicked)
  attachListener('modalHeartClicked', onModalHeartClicked)
}

function MapMediator() {
  useMapMediator()

  return null
}

export { MapMediator, emit }
