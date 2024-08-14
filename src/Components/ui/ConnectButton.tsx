import { useAccount } from "wagmi"

const ConnectButton = () => {
  const { isConnected } = useAccount()
  return (
    isConnected ? (
      <button className="btn btn-outline btn-sm h-auto btn-secondary p-0 flex items-center justify-center">
        <w3m-button size="sm" balance="hide" />
      </button>
    ) : (
      <w3m-button size="sm" balance="hide" />
    )
  )
}
export default ConnectButton;