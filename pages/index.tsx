import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import Account from "../components/Account";
import ETHBalance from "../components/ETHBalance";
import TokenBalance from "../components/TokenBalance";

const DAI_TOKEN_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";

function Home() {
  const { account, library } = useWeb3React();

  const isConnected = typeof account === "string" && !!library;

  return (
    <div>
      <Head>
        <title>Next Web3 Dapp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <nav>
          <Link href="/">
            <a>Next Web3 Dapp</a>
          </Link>

          <Account />
        </nav>
      </header>

      <main>
        <h1>
          <a href="https://github.com/luvitale/next-web3-dapp">
            Next Web3 Dapp
          </a>
        </h1>

        {isConnected && (
          <section>
            <ETHBalance />

            <TokenBalance tokenAddress={DAI_TOKEN_ADDRESS} symbol="DAI" />
          </section>
        )}
      </main>

      <style jsx>{`
        nav {
          display: flex;
          justify-content: space-between;
        }

        main {
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default Home;
