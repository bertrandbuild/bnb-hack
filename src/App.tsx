import './App.css'

import TradingViewWidget from './components/TradingViewWidget'
import ExecuteStrategy from './components/executeStrategy/ExecuteStrategy';

function App() {

  return (
    <section className='flex flex-row'>
      <div className='w-[60vw] h-[80vh]'>
        <TradingViewWidget />
      </div>
      <div className='w-[40vw] h-[80vh]'>
        <ExecuteStrategy />
      </div>
    </section>
  )
}

export default App