// ==UserScript==
// @name        Info for merged pull requests
// @namespace   Violentmonkey Scripts
// @include     /github\.com\/([\w-]+\/[\w-]+)\/pull\/(\d+).*$/
// @grant       none
// @version     2.0.0
// @author      Isabel Roses <isabel@isabelroses.com>
// @description 10/29/2023, 11:47:39 AM
// ==/UserScript==

(function () {
  'use strict'

  const headername = '.gh-header-meta'
  const header = document.querySelector(headername)

  if (!header) return

  const subscribedRepos = {
    'NixOS/nixpkgs': ['master', 'nixpkgs-unstable', 'nixos-unstable'],
  }

  /**
   * Parse the URL of repo and pull request ID.
   * @type {string[]}
   */
  const [, prRepoURL, prNumber] = document.URL.match(
    /^.*github\.com\/([\w-]+\/[\w-]+)\/pull\/(\d+).*$/
  )

  /**
   * Normalize the repo name if it has been subscribed.
   * @param {string} prRepoURL
   * @returns {string}
   */
  const normalizeRepoName = prRepoURL => {
    return Object.keys(subscribedRepos).find(
      repo => repo.localeCompare(prRepoURL, undefined, { sensitivity: 'accent' }) === 0
    ) || prRepoURL
  }

  const prRepo = normalizeRepoName(prRepoURL)
  const prApi = `https://api.github.com/repos/${prRepo}/pulls/${prNumber}`

  const processResponse = json => {
    if (!json) return

    // surprise: even unmerged commit will have a `merge_commit_sha`
    // this can be used to test the pr before it's merged
    const commitHash = json.merge_commit_sha
    const commitShort = commitHash.slice(0, 7)
    const commitLink = `https://github.com/${prRepo}/commit/${commitHash}`

    const btn = document.querySelector("#fetch-merge-info")
    if (btn) header.removeChild(btn)

    const prInfoLine = document.querySelector(headername)
    prInfoLine.innerHTML += `&ensp;<a href="${commitLink}"><code class="Link--primary text-bold">${commitShort}</code></a>`

    if (!(json.merged && prRepo in subscribedRepos)) {
      return
    }

    const compareLink = `https://github.com/${prRepo}/compare`
    const compareApi = `https://api.github.com/repos/${prRepo}/compare/${commitHash}`

    const branches = subscribedRepos[prRepo].map(branchName => ({
      name: branchName,
      id: `compare-${branchName}`,
      // ^ used internally to identify the element and decorate it
    }))

    // javascript trap: `for...in` is not the right one!
    // must use `for...of` (see mdn).
    for (const branch of branches) {
      prInfoLine.innerHTML += `&ensp;<a href="${compareLink}/${commitHash}...${branch.name}" id="${branch.id}"><b>${branch.name}</b></a>`
    }

    const branchIndicate = (success, branch) => {
      const branchInfo = document.querySelector(`#${branch.id}`)

      let indicator = success ? '✅ ' : '⚠️ '
      // swap the comparison to show how far behind the branch is
      if (!success) branchInfo.href = `${compareLink}/${branch.name}...${commitHash}`

      branchInfo.outerHTML = indicator + branchInfo.outerHTML
    }

    const fetchBranchStatus = branch => fetch(`${compareApi}...${branch.name}`)
      .then(response => response.json())
      .then(json => json.status === 'ahead' || json.status === 'identical')
      .then(success => branchIndicate(success, branch))
      .catch(console.log)

    branches.forEach(fetchBranchStatus)
  }

  const fetchPRInfo = () => {
    fetch(prApi)
      .then(response => response.json())
      .then(json => processResponse(json))
      .catch(console.log)
  }

  const addButton = () => {
    const button = document.createElement('button')
    button.textContent = 'Fetch Merge Info'
    button.id = 'fetch-merge-info'
    button.className = "flex-shrink-0 btn btn-sm ml-sm-3 mt-2 mt-sm-n2 mb-sm-n2 mr-sm-n1 flex-self-center"
    button.onclick = fetchPRInfo

    header.appendChild(button)
  }

  addButton()
})();
