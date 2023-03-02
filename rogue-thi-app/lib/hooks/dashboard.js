import {
  ALL_DASHBOARD_CARDS,
  PLATFORM_DESKTOP,
  PLATFORM_MOBILE,
  USER_EMPLOYEE, USER_GUEST, USER_STUDENT
} from '../../pages'
import { useEffect, useState } from 'react'

/**
 * @typedef {Object} DashboardSettings
 * @property {*[]} unlockedThemes - An array of unlocked themes.
 * @property {moveDashboardEntry} moveDashboardEntry - A function that moves a dashboard entry by a certain amount.
 * @property {hideDashboardEntry} hideDashboardEntry - A function that hides a dashboard entry.
 * @property {bringBackDashboardEntry} bringBackDashboardEntry - A function that brings back a hidden dashboard entry.
 * @property {*[]} shownDashboardEntries - An array of dashboard entries that are currently shown.
 * @property {resetOrder} resetOrder - A function that resets the order of the dashboard entries.
 * @property {*[]} hiddenDashboardEntries - An array of dashboard entries that are currently hidden.
 */

/**
 * @callback moveDashboardEntry
 * @param {number} oldIndex - The current index of the dashboard entry.
 * @param {number} diff - The amount to move the dashboard entry by.
 * @returns {void}
 */

/**
 * @callback hideDashboardEntry
 * @param {number} index - The index of the dashboard entry to hide.
 * @returns {void}
 */

/**
 * @callback bringBackDashboardEntry
 * @param {number} index - The index of the hidden dashboard entry to bring back.
 * @returns {void}
 */

/**
 * @callback resetOrder
 * @returns {void}
 */
export function useDashboard () {
  const [shownDashboardEntries, setShownDashboardEntries] = useState([])
  const [hiddenDashboardEntries, setHiddenDashboardEntries] = useState([])
  const [unlockedThemes, setUnlockedThemes] = useState([])

  /**
   * Get the default order of shown and hidden dashboard entries
   */
  function getDefaultDashboardOrder () {
    const platform = window.matchMedia('(max-width: 768px)').matches
      ? PLATFORM_MOBILE
      : PLATFORM_DESKTOP

    let personGroup = USER_STUDENT
    if (localStorage.session === 'guest') {
      personGroup = USER_GUEST
    } else if (localStorage.isStudent === 'false') {
      personGroup = USER_EMPLOYEE
    }

    const filter = x => x.default.includes(platform) && x.default.includes(personGroup)
    return {
      shown: ALL_DASHBOARD_CARDS.filter(filter),
      hidden: ALL_DASHBOARD_CARDS.filter(x => !filter(x))
    }
  }

  useEffect(() => {
    async function load () {
      if (localStorage.personalizedDashboard) {
        const entries = JSON.parse(localStorage.personalizedDashboard)
          .map(key => ALL_DASHBOARD_CARDS.find(x => x.key === key))
          .filter(x => !!x)
        const hiddenEntries = JSON.parse(localStorage.personalizedDashboardHidden)
          .map(key => ALL_DASHBOARD_CARDS.find(x => x.key === key))
          .filter(x => !!x)

        ALL_DASHBOARD_CARDS.forEach(card => {
          if (!entries.find(x => x.key === card.key) && !hiddenEntries.find(x => x.key === card.key)) {
            // new (previosly unknown) card
            entries.splice(0, 0, card)
          }
        })

        setShownDashboardEntries(entries)
        setHiddenDashboardEntries(hiddenEntries)
      } else {
        const entries = getDefaultDashboardOrder()
        setShownDashboardEntries(entries.shown)
        setHiddenDashboardEntries(entries.hidden)
      }

      if (localStorage.unlockedThemes) {
        setUnlockedThemes(JSON.parse(localStorage.unlockedThemes))
      }
    }

    load()
  }, [])

  /**
   * Persists the dashboard settings.
   * @param {object[]} entries Displayed entries
   * @param {object[]} hiddenEntries Hidden entries
   */
  function changeDashboardEntries (entries, hiddenEntries) {
    localStorage.personalizedDashboard = JSON.stringify(entries.map(x => x.key))
    localStorage.personalizedDashboardHidden = JSON.stringify(hiddenEntries.map(x => x.key))
    setShownDashboardEntries(entries)
    setHiddenDashboardEntries(hiddenEntries)
  }

  /**
   * Moves a dashboard entry to a new position.
   * @param {number} oldIndex Old position
   * @param {number} diff New position relative to the old position
   */
  function moveDashboardEntry (oldIndex, diff) {
    const newIndex = oldIndex + diff
    if (newIndex < 0 || newIndex >= shownDashboardEntries.length) {
      return
    }

    const entries = shownDashboardEntries.slice(0)
    const entry = entries[oldIndex]
    entries.splice(oldIndex, 1)
    entries.splice(newIndex, 0, entry)

    changeDashboardEntries(entries, hiddenDashboardEntries)
  }

  /**
   * Hides a dashboard entry.
   * @param {string} key Entry key
   */
  function hideDashboardEntry (key) {
    const entries = shownDashboardEntries.slice(0)
    const hiddenEntries = hiddenDashboardEntries.slice(0)

    const index = entries.filter(entry => entry.removable !== false).findIndex(x => x.key === key)
    if (index >= 0) {
      hiddenEntries.push(entries[index])
      entries.splice(index, 1)
    }

    changeDashboardEntries(entries, hiddenEntries)
  }

  /**
   * Unhides a dashboard entry.
   * @param {number} index Entry position
   */
  function bringBackDashboardEntry (index) {
    const entries = shownDashboardEntries.slice(0)
    const hiddenEntries = hiddenDashboardEntries.slice(0)

    entries.push(hiddenEntries[index])
    hiddenEntries.splice(index, 1)

    changeDashboardEntries(entries, hiddenEntries)
  }

  /**
   * Resets which dashboard entries are shown and their order to default
   */
  function resetOrder () {
    const defaultEntries = getDefaultDashboardOrder()
    setShownDashboardEntries(defaultEntries.shown)
    setHiddenDashboardEntries(defaultEntries.hidden)
    changeDashboardEntries(defaultEntries.shown, defaultEntries.hidden)
  }

  return {
    shownDashboardEntries,
    hiddenDashboardEntries,
    unlockedThemes,
    moveDashboardEntry,
    hideDashboardEntry,
    bringBackDashboardEntry,
    resetOrder
  }
}