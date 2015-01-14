blockchain
=====

node.js module to access the blockchain websocket api

[![Build Status](https://travis-ci.org/abrkn/blockchain.png)](https://travis-ci.org/abrkn/blockchain)

installation
-----

`npm install blockchain`

donations
-----

1Kk26TMvgxFavxuLTNdkmh7iHzs2A7524y

methods
-----

- **constructor**(): creates a new socket and calls **open**
- **subscribe**(address, callback)
- **unsubscribe**(address, callback)
- **open**()
- **close**()

events
-----

- **connect**: function()
- **connectFailed**: function(errorDescription)
- **disconnect** function()
- **error**: function(error)

notes
-----

- subscriptions persist
- see tests for example

license
---

ISC
