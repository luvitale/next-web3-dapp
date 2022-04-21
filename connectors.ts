import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'
import { TrezorConnector } from '@web3-react/trezor-connector'

import { getChain } from '@inti-ar/evm-chains'

const POLLING_INTERVAL = 12000

const SUPPORTED_CHAIN_IDS = [
  1, // Ethereum Mainnet
  3, // Ropsten
  4, // Rinkeby
  5, // Goerli
  42, // Kovan
  30, // RSK Mainnet
  31, // RSK Testnet
  200941592, // BFA Mainnet
  99118822, // BFA Testnet
];

const RPC_URLS: { [chainId: number]: string } = SUPPORTED_CHAIN_IDS.reduce((acc, chainId) => {
  const { rpc } = getChain(chainId)
  acc[chainId] = rpc[0]

  return acc
}, {})

export const injected = new InjectedConnector({ supportedChainIds: SUPPORTED_CHAIN_IDS})

export const network = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId: 1
})

export const walletconnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  qrcode: true
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'web3-react example',
  supportedChainIds: SUPPORTED_CHAIN_IDS
})

export const ledger = new LedgerConnector({ chainId: 1, url: RPC_URLS[1], pollingInterval: POLLING_INTERVAL })

export const trezor = new TrezorConnector({
  chainId: 1,
  url: RPC_URLS[1],
  pollingInterval: POLLING_INTERVAL,
  manifestEmail: 'dummy@abc.xyz',
  manifestAppUrl: 'http://localhost:1234'
})
