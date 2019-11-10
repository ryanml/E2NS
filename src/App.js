import './App.css'
import React, { PureComponent } from 'react'
import CryptoBanner from './banner'
import { abi } from './abi'

class App extends PureComponent {

  constructor (props) {
    super(props)
    this.state = {
      tokens: [],
      tokensLoaded: false,
      domainName: '',
      domainTld: '',
      existingRegistry: '',
      validationError: false,
      providerEnabled: false,
      accounts: [],
      contract: null,
      currentAccount: null,
      contractInstance: null,
      confirmingTx: false,
      transactionSuccess: false,
      currentInterval: null
    }
    this.apiEndpoint = 'web3api.io/api/v2/'
    this.apiKey = 'UAK7acefdf714da8dd18a117280de7452f0'
    this.contractAddress = '0x67CC728484Af8A2dfAed2f3e2Cc557e01692C4bF'
    this.tokenUrl = 'tokens/rankings?direction=descending&sortType=marketCap&timeInterval=d'
  }

  async componentDidMount () {
    this.fetchTokenList()
    const contract = window.web3.eth.contract(abi)
    const contractInstance = contract.at(this.contractAddress)
    if (window.ethereum) {
      try {
        await window.ethereum.enable()
        this.setState({
          contract,
          contractInstance,
          providerEnabled: true
        })
      } catch (error) {}
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const _this = this
    if (this.state.providerEnabled && !prevState.providerEnabled) {
      window.web3.eth.getAccounts(function (err, res) {
        if (!err) {
          _this.setState({ currentAccount: res[0] })
        }
      })
    }
  } 

  fetchTokenList () {
    let responseData = null
    const _this = this
    const xhrReq = new XMLHttpRequest()
    
    xhrReq.addEventListener('readystatechange', function () {
      if (this.readyState === this.DONE) {
        const dataObj = JSON.parse(this.responseText)
        if (dataObj.status === 200) {
          _this.fillTokens(dataObj.payload.data)
        }
      }
    })
    
    xhrReq.open('GET', `https://${this.apiEndpoint}${this.tokenUrl}`)
    xhrReq.setRequestHeader('x-api-key', this.apiKey)
    xhrReq.setRequestHeader('x-amberdata-blockchain-id', '1c9c969065fcd1cf')
    xhrReq.send(responseData)
  }

  fillTokens (responseList) {
    const erc20TokenLabels = responseList
      .filter((item) => item.isERC20)
      .map((item) => item.symbol.toLowerCase())

    this.setState({
      tokensLoaded: true,
      tokens: erc20TokenLabels,
      domainTld: erc20TokenLabels[0]
    })
  }

  onDomainChange (event) {
    const _this = this
    const domainName = event.target.value
    const validationError = !(domainName.match(/^[A-Za-z0-9\-\_]+$/s))
    const { contractInstance, domainTld } = this.state

    this.setState({
      domainName,
      validationError,
      existingRegistry: ''
    })

    if (!validationError) {
      contractInstance.lookup(`${domainName}.${domainTld}`, function (err, result) {
        console.log({err, result})
        // This is hacky and in rare scenarios not reliable, but this is a hackathon
        if (!result.startsWith('0x000000000')) {
          _this.setState({ existingRegistry: result })
        }
      })
    }
  }

  onTldChange (event) {
    this.setState({
      domainTld: event.target.value
    })
  }

  onSubmit () {
    const _this = this
    const { contractInstance, currentAccount, domainName, domainTld } = this.state

    if (!contractInstance) {
      console.error('Error: Could not create contract instance')
    }

    const transaction = {
      from: currentAccount,
      gas: 200000,
    }

    contractInstance.register.sendTransaction(`${domainName}.${domainTld}`, transaction, function (err, response) {
      if (!err) {
        _this.setState({ confirmingTx: true })
        const intervalId = setInterval(() => {
          window.web3.eth.getTransactionReceipt(response, function (err, data) {
            if (data) {
              _this.setState({
                confirmingTx: false,
                transactionSuccess: true
              })
              window.clearInterval(_this.state.currentInterval)
              setTimeout(() => {
                _this.setState({
                  domainName: '',
                  currentInterval: null,
                  transactionSuccess: false
                })
              }, 3000)
            }
          })
        }, 100)
        _this.setState({ currentInterval: intervalId })
      }
    })
  }                  

  renderForm () {
    const {
      domainName,
      domainTld,
      tokens,
      validationError,
      confirmingTx,
      existingRegistry,
      transactionSuccess
    } = this.state
    const domainString = `${domainName}.${domainTld}`

    return (
      <div className={'form'}>
        <span>Your domain, your tokens. Grab yours today:</span>
        <div className={'input'}>
          <input
            type={'text'}
            value={domainName}
            onChange={this.onDomainChange.bind(this)}
            className={`domain-string form-control`}
          />
          <div className={'period'}>
            <span>.</span>
          </div>
          <select className={'token-tld'} onChange={this.onTldChange.bind(this)}>
            {tokens.map((token, i) => {
              return (
                <option key={`option-${i}`} value={token}>
                  {token}
                </option>
              )
            })}
          </select>
          <button
            onClick={this.onSubmit.bind(this)}
            className={'btn btn-dark'}
            disabled={validationError || !domainName.length || existingRegistry.length > 0}
          >
            Submit
          </button>
        </div>
        {
          domainName.length && !confirmingTx && !existingRegistry.length && !transactionSuccess
          ? <>
              <h4>Preview:</h4>
              <div className={'preview'}></div>
              <span className={'preview-text'}>{`http://${domainString}`}</span>
              {
                validationError
                ? <div className={'error-text'}>
                    <span>Your domain name may only contain alpha-numeric characters, hyphens, and underscores.</span>
                  </div>
                : null
              }
            </>
          : null
        }
        {
          confirmingTx
          ? <h4>Confirming registration... (this can take a minute)</h4>
          : null
        }
        {
          existingRegistry.length
          ? <h5>{domainString} is already registered and points to: {existingRegistry}</h5>
          : null
        }
        {
          transactionSuccess
          ? <h4>Success! Your domain {domainString} has been registered!</h4>
          : null
        }
      </div>
    )
  }

  render () {
    const { currentAccount, tokensLoaded } = this.state

    return (
      <div className={'App'}>
        <div className={'header'}>
          <CryptoBanner />
          <h1>ERC-20 Name Service Registrar</h1>
        </div>
        {
          tokensLoaded && currentAccount
          ? this.renderForm()
          : null
        }
      </div>
    )   
  }
}

export default App
