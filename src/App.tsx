import './App.css'
import TradingViewWidget from './Components/TradingViewWidget'

function App() {

  return (
    <section className='flex flex-row'>
      <div className='w-[50vw] h-[80vh]'>
        <TradingViewWidget />
      </div>
      <div className='w-[50vw] h-[80vh]'>
        <button className='btn btn-primary'>Start</button>
      </div>
    </section>
  )
}

export default App
