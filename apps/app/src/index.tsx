import React from 'react'
import ReactDOM from 'react-dom'
import { App } from '@riftdweb/core'
import reportWebVitals from './reportWebVitals'
import { AppRoutes } from './_routes'

ReactDOM.render(
  <React.StrictMode>
    <App name="Rift">
      <AppRoutes />
    </App>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
