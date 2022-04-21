import React from 'react'
import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import { Web3Provider } from '@ethersproject/providers'

import useEagerConnect from '../hooks/useEagerConnect'
import useInactiveListener from '../hooks/useInactiveListener'
import {
  injected,
  network,
  walletconnect,
  walletlink,
  ledger,
  trezor,
} from '../connectors'
import { Spinner } from '../components/Spinner'

import { getChain } from '@inti-ar/evm-chains'

// Modal
import Modal from 'react-modal'

Modal.setAppElement("#__next")

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

enum ConnectorNames {
  Injected = 'Injected',
  Network = 'Network',
  WalletConnect = 'WalletConnect',
  WalletLink = 'WalletLink',
  Ledger = 'Ledger',
  Trezor = 'Trezor',
}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: injected,
  [ConnectorNames.Network]: network,
  [ConnectorNames.WalletConnect]: walletconnect,
  [ConnectorNames.WalletLink]: walletlink,
  [ConnectorNames.Ledger]: ledger,
  [ConnectorNames.Trezor]: trezor,
}

const getErrorMessage = (error: Error) => {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network."
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    console.error(error)
    return 'An unknown error occurred. Check the console for more details.'
  }
}

const getLibrary = (provider: any): Web3Provider => {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

export default function Account() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  )
}

const ChainName = () => {
  const { chainId } = useWeb3React()

  let chainName = chainId ? getChain(chainId).name : 'Unknown'

  return (
    <>
    {(chainId) && (
      <>
        <span role="img" aria-label="chain">
          ⛓
        </span>
        <span>{chainName}</span>
      </>
    )}
    </>
  )
}

function Address() {
  const { account } = useWeb3React()

  return (
    <>
      {(account) && (
        <>
          <span role="img" aria-label="robot">
            🤖
          </span>
          <span>
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
        </>
      )}
    </>
  )
}

function Header() {
  return (
    <>
      <ChainName />
      <Address />
    </>
  )
}

const Connector = (props: { name: any }) => {
  const { name } = props

  const context = useWeb3React<Web3Provider>()
  const { connector, activate, error } = context
  const [activatingConnector, setActivatingConnector] = React.useState<any>()
  const triedEager = useEagerConnect()
  
  const currentConnector = connectorsByName[name]
  const activating = currentConnector === activatingConnector
  const connected = currentConnector === connector
  const disabled = !triedEager || !!activatingConnector || connected || !!error

  return (
    <button
      style={{
        height: '3rem',
        borderRadius: '1rem',
        borderColor: activating ? 'orange' : connected ? 'green' : 'unset',
        cursor: disabled ? 'unset' : 'pointer',
        position: 'relative'
      }}
      disabled={disabled}
      key={name}
      onClick={() => {
        setActivatingConnector(currentConnector)
        activate(connectorsByName[name])
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          color: 'black',
          margin: '0 0 0 1rem'
        }}
      >
        {activating && <Spinner color={'black'} style={{ height: '25%', marginLeft: '-1rem' }} />}
        {connected && (
          <span role="img" aria-label="check">
            ✅
          </span>
        )}
      </div>
      {name}
    </button>
  )
}

const Connectors = () => {

  return (
    <>
      {Object.keys(connectorsByName).map((name, index) => {
        return (
          <Connector key={ index } name={ name } />
        )
      })}
    </>
  )
}

const App = () => {
  let subtitle;
  const [modalIsOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
  }


  const context = useWeb3React<Web3Provider>()
  const { connector, chainId, account, deactivate, active, error } = context

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>()
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)

  return (
    <>
      <Header />
      <button onClick={openModal}
        style={{
          height: '3rem',
          borderRadius: '1rem',
          cursor: 'pointer'
      }}>{(account) ? "..." : "Connect"}</button>
      <Modal contentLabel="Web3 Modal"
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <hr style={{ margin: '2rem' }} />
        <div
          style={{
            display: 'grid',
            gridGap: '1rem',
            gridTemplateColumns: '1fr 1fr',
            maxWidth: '20rem',
            margin: 'auto'
          }}
        >
          <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Web3</h2>
          <button onClick={closeModal}
            style={{
              height: '3rem',
              borderRadius: '1rem',
              cursor: 'pointer'
          }}>Close</button>
          <Connectors />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {(active || error) && (
            <button
              style={{
                height: '3rem',
                marginTop: '2rem',
                borderRadius: '1rem',
                borderColor: 'red',
                cursor: 'pointer'
              }}
              onClick={() => {
                deactivate()
              }}
            >
              Deactivate
            </button>
          )}

          {!!error && <h4 style={{ marginTop: '1rem', marginBottom: '0' }}>{getErrorMessage(error)}</h4>}
        </div>

        <hr style={{ margin: '2rem' }} />

        <div
          style={{
            display: 'grid',
            gridGap: '1rem',
            gridTemplateColumns: 'fit-content',
            maxWidth: '20rem',
            margin: 'auto'
          }}
        >
          {!!(connector === connectorsByName[ConnectorNames.Network] && chainId) && (
            <button
              style={{
                height: '3rem',
                borderRadius: '1rem',
                cursor: 'pointer'
              }}
              onClick={() => {
                ;(connector as any).changeChainId(chainId === 1 ? 4 : 1)
              }}
            >
              Switch Networks
            </button>
          )}
          {connector === connectorsByName[ConnectorNames.WalletConnect] && (
            <button
              style={{
                height: '3rem',
                borderRadius: '1rem',
                cursor: 'pointer'
              }}
              onClick={() => {
                ;(connector as any).close()
              }}
            >
              Kill WalletConnect Session
            </button>
          )}
          {connector === connectorsByName[ConnectorNames.WalletLink] && (
            <button
              style={{
                height: '3rem',
                borderRadius: '1rem',
                cursor: 'pointer'
              }}
              onClick={() => {
                ;(connector as any).close()
              }}
            >
              Kill WalletLink Session
            </button>
          )}
        </div>
      </Modal>
    </>
  )
}
