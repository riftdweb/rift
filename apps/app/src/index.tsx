import React from 'react'
import ReactDOM from 'react-dom'
import { reportWebVitals } from '@riftdweb/core'
import { Rift } from './_app'

ReactDOM.render(
  <React.StrictMode>
    <Rift />
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
