import React from 'react'
import FeedsList from './FeedsList'
import AddFeed from './AddFeed'

const ControlPanel = () => {
  return (
    <nav className="panel">
      <p className="panel-tabs">
        <a className="is-active">Feeds</a>
        <a>Pheeders</a>
        <a>Settings</a>
      </p>

      <FeedsList />

      <AddFeed />

      <a href="http://localhost:5000/auth/twitter">Twitter</a>
    </nav>
  )
}

export default ControlPanel
